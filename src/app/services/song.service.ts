import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { PlaylistItem, Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private readonly http = inject(HttpClient);
  private playlistCounter = 0;

  // State signals
  private readonly songsSignal = signal<Song[]>([]);
  readonly searchQuery = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly playlist = signal<PlaylistItem[]>([]);

  // Public readonly accessors
  readonly songs = this.songsSignal.asReadonly();

  // Computed filtered songs based on searchQuery
  readonly filteredSongs = computed<Song[]>(() => {
    const query = this.normalizeText(this.searchQuery());
    const allSongs = this.songsSignal();

    if (!query) {
      return allSongs;
    }

    const searchWords = query.split(/\s+/).filter(Boolean);

    return allSongs.filter(song => {
      const normalizedTitle = this.normalizeText(song.title);
      const normalizedLyrics = this.normalizeText(song.stanzas.join(' '));

      // Match all query terms in either title or lyrics
      return searchWords.every(word =>
        normalizedTitle.includes(word) || normalizedLyrics.includes(word)
      );
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
        this.songsSignal.set(songs || []);
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

