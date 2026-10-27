import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { PlaylistItem, Song } from '../models/song.model';
import { PRESET_CATEGORIES, PRESET_MASS_SECTIONS } from '../constants/song-metadata.constants';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private readonly http = inject(HttpClient);
  private playlistCounter = 0;

  // State signals
  private readonly songsSignal = signal<Song[]>([]);
  readonly searchQuery = signal<string>('');
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedMassSections = signal<string[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly playlist = signal<PlaylistItem[]>([]);

  // Public readonly accessors
  readonly songs = this.songsSignal.asReadonly();

  /**
   * Computed list of all available categories (merging presets and any discovered in songs)
   */
  readonly allCategories = computed<string[]>(() => {
    const set = new Set<string>(PRESET_CATEGORIES);
    for (const song of this.songsSignal()) {
      if (Array.isArray(song.categories)) {
        song.categories.forEach(c => c && set.add(c));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'hr'));
  });

  /**
   * Computed list of all available mass sections (merging presets and any discovered in songs)
   */
  readonly allMassSections = computed<string[]>(() => {
    const set = new Set<string>(PRESET_MASS_SECTIONS);
    for (const song of this.songsSignal()) {
      if (Array.isArray(song.massSections)) {
        song.massSections.forEach(m => m && set.add(m));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'hr'));
  });

  /**
   * Count of currently active filters (search + selected categories + selected mass sections)
   */
  readonly activeFilterCount = computed<number>(() => {
    let count = 0;
    if (this.searchQuery().trim().length > 0) count++;
    count += this.selectedCategories().length;
    count += this.selectedMassSections().length;
    return count;
  });

  /**
   * Computed filtered songs based on:
   * 1. Search text (matches title or any stanza)
   * 2. Selected categories (OR logic among selected categories)
   * 3. Selected mass sections (OR logic among selected mass sections)
   */
  readonly filteredSongs = computed<Song[]>(() => {
    const query = this.normalizeText(this.searchQuery());
    const selCats = this.selectedCategories();
    const selSections = this.selectedMassSections();
    const allSongs = this.songsSignal();

    const searchWords = query ? query.split(/\s+/).filter(Boolean) : [];

    return allSongs.filter(song => {
      // 1. Text Search Filter
      if (searchWords.length > 0) {
        const normalizedTitle = this.normalizeText(song.title);
        const normalizedLyrics = this.normalizeText(song.stanzas.join(' '));
        const matchesQuery = searchWords.every(word =>
          normalizedTitle.includes(word) || normalizedLyrics.includes(word)
        );
        if (!matchesQuery) return false;
      }

      // 2. Categories Filter (OR logic: match if song has ANY of the selected categories)
      if (selCats.length > 0) {
        const songCats = song.categories || [];
        const hasMatchingCategory = selCats.some(cat => songCats.includes(cat));
        if (!hasMatchingCategory) return false;
      }

      // 3. Mass Sections Filter (OR logic: match if song has ANY of the selected mass sections)
      if (selSections.length > 0) {
        const songSections = song.massSections || [];
        const hasMatchingSection = selSections.some(sec => songSections.includes(sec));
        if (!hasMatchingSection) return false;
      }

      return true;
    });
  });

  // Computed playlist statistics
  readonly playlistCount = computed(() => this.playlist().length);

  readonly totalPlaylistSlides = computed(() => {
    return this.playlist().reduce((sum, item) => sum + item.song.stanzaCount, 0);
  });

  /**
   * Check if a specific song is currently in the playlist
   */
  isSongSelected(songId: string): boolean {
    return this.playlist().some(item => item.song.id === songId);
  }

  /**
   * Count occurrences of a song in the playlist
   */
  getSongOccurrenceCount(songId: string): number {
    return this.playlist().filter(item => item.song.id === songId).length;
  }

  /**
   * Fetch songs from assets/songs/index.json and cache in state
   */
  loadSongs(): Observable<Song[]> {
    if (this.songsSignal().length > 0) {
      return of(this.songsSignal());
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http.get<Song[]>('assets/songs/index.json').pipe(
      tap(songs => {
        const normalized = (songs || []).map(s => ({
          ...s,
          categories: s.categories || [],
          massSections: s.massSections || []
        }));
        this.songsSignal.set(normalized);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.error('[SongService] Error loading songs index:', err);
        this.errorMessage.set('Failed to load songs repository.');
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Update search filter query
   */
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Clear active search query
   */
  clearSearchQuery(): void {
    this.searchQuery.set('');
  }

  /**
   * Toggle a category in the active filter selection
   */
  toggleCategoryFilter(category: string): void {
    this.selectedCategories.update(current => {
      return current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
    });
  }

  /**
   * Toggle a mass section in the active filter selection
   */
  toggleMassSectionFilter(section: string): void {
    this.selectedMassSections.update(current => {
      return current.includes(section)
        ? current.filter(s => s !== section)
        : [...current, section];
    });
  }

  /**
   * Check if category is currently selected in filter
   */
  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  /**
   * Check if mass section is currently selected in filter
   */
  isMassSectionSelected(section: string): boolean {
    return this.selectedMassSections().includes(section);
  }

  /**
   * Clear category filters only
   */
  clearCategoryFilters(): void {
    this.selectedCategories.set([]);
  }

  /**
   * Clear mass section filters only
   */
  clearMassSectionFilters(): void {
    this.selectedMassSections.set([]);
  }

  /**
   * Clear all filters (search, categories, and mass sections)
   */
  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.selectedMassSections.set([]);
  }

  /**
   * Add song to the end of the presentation playlist
   */
  addToPlaylist(song: Song): PlaylistItem {
    const playlistId = `${song.id}-${Date.now()}-${++this.playlistCounter}`;
    const newItem: PlaylistItem = {
      playlistId,
      song
    };

    this.playlist.update(items => [...items, newItem]);
    return newItem;
  }

  /**
   * Remove a song from the playlist by playlistId
   */
  removeFromPlaylist(playlistId: string): void {
    this.playlist.update(items => items.filter(item => item.playlistId !== playlistId));
  }

  /**
   * Move item up by one position in the playlist
   */
  moveSongUp(index: number): void {
    if (index <= 0) return;
    this.playlist.update(items => {
      const next = [...items];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  }

  /**
   * Move item down by one position in the playlist
   */
  moveSongDown(index: number): void {
    const items = this.playlist();
    if (index < 0 || index >= items.length - 1) return;
    this.playlist.update(currentItems => {
      const next = [...currentItems];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  }

  /**
   * Move item from previous index to current index (arbitrary reordering)
   */
  reorderPlaylist(fromIndex: number, toIndex: number): void {
    const items = this.playlist();
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
      return;
    }

    this.playlist.update(currentItems => {
      const next = [...currentItems];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  }

  /**
   * Clear all items from the playlist
   */
  clearPlaylist(): void {
    this.playlist.set([]);
  }

  /**
   * Helper to normalize text (lowercase, remove diacritics) for case-insensitive search
   */
  private normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
