import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../services/song.service';
import { TranslationService } from '../../services/translation.service';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-song-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalog-card">
      <!-- Catalog Header & Search Controls -->
      <div class="catalog-header">
        <div class="title-row">
          <h2 class="catalog-title">{{ t().catalogTitle }}</h2>
          <span class="live-counter">
            {{ t().showingSongsCounter(filteredSongs().length, totalSongs().length) }}
          </span>
        </div>

        <!-- Search Bar with Clear Button -->
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>

          <input
            type="text"
            class="form-input search-input"
            [placeholder]="t().searchPlaceholder"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            [attr.aria-label]="t().searchPlaceholder"
          />

          @if (searchQuery()) {
            <button
              type="button"
              class="clear-search-btn"
              (click)="onClearSearch()"
              [attr.aria-label]="t().clearSearch"
              [title]="t().clearSearch"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Scrollable Song List -->
      <div class="catalog-list" role="list">
        @if (isLoading()) {
          <div class="status-state">
            <div class="spinner"></div>
            <p>{{ t().loadingCatalog }}</p>
          </div>
        } @else if (filteredSongs().length === 0) {
          <div class="status-state empty-state">
            <div class="empty-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <h3>{{ t().noSongsFoundTitle }}</h3>
            @if (searchQuery()) {
              <p>{{ t().noSongsFoundDesc(searchQuery()) }}</p>
              <button type="button" class="btn btn-secondary btn-sm" (click)="onClearSearch()">
                {{ t().clearSearchBtn }}
              </button>
            } @else {
              <p>{{ t().catalogEmptyDesc }}</p>
            }
          </div>
        } @else {
          @for (song of filteredSongs(); track song.id) {
            <div class="song-item fade-in" role="listitem">
              <div class="song-info">
                <div class="song-header">
                  <h3 class="song-title">{{ song.title }}</h3>
                  <span class="badge badge-primary stanza-badge">
                    {{ t().slidesCount(song.stanzaCount) }}
                  </span>
                </div>

                @if (song.preview) {
                  <p class="song-preview" [title]="t().lyricPreviewHint">{{ song.preview }}</p>
                }
              </div>

              <div class="song-actions">
                <button
                  type="button"
                  class="btn add-btn"
                  [class.btn-primary]="!isSongInPlaylist(song.id)"
                  [class.btn-secondary]="isSongInPlaylist(song.id)"
                  [class.in-playlist]="isSongInPlaylist(song.id)"
                  (click)="onAddSong(song)"
                  [attr.aria-label]="t().addBtn + ' ' + song.title"
                >
                  @if (isSongInPlaylist(song.id)) {
                    <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    <span>{{ t().addedBtn(getSongOccurrence(song.id)) }}</span>
                  } @else {
                    <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <span>{{ t().addBtn }}</span>
                  }
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .catalog-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 520px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }

    .catalog-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .catalog-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .live-counter {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background-color: var(--bg-surface-elevated);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      padding-left: 38px;
      padding-right: 36px;
      background-color: var(--bg-input);
      border-color: var(--border-default);
      height: 40px;
    }

    .clear-search-btn {
      position: absolute;
      right: 10px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      transition: all 0.15s ease;
    }

    .clear-search-btn:hover {
      background: var(--border-default);
      color: var(--text-primary);
    }

    .catalog-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .song-item {
      background-color: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: border-color 0.15s ease, transform 0.1s ease;
    }

    .song-item:hover {
      border-color: var(--border-default);
      background-color: #0d1424;
    }

    .song-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .song-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .song-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stanza-badge {
      font-size: 11px;
      padding: 1px 7px;
    }

    .song-preview {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
    }

    .song-actions {
      flex-shrink: 0;
    }

    .add-btn {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: var(--radius-sm);
      min-width: 72px;
    }

    .add-btn.in-playlist {
      background-color: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      color: #c7d2fe;
    }

    .add-btn.in-playlist:hover {
      background-color: var(--accent-primary);
      color: #ffffff;
    }

    .btn-svg {
      width: 14px;
      height: 14px;
    }

    .status-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      gap: 12px;
      color: var(--text-muted);
    }

    .empty-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .empty-icon-wrap svg {
      width: 24px;
      height: 24px;
    }

    .empty-state h3 {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .empty-state p {
      font-size: 13px;
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 12px;
      margin-top: 6px;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--border-default);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SongCatalogComponent {
  private readonly songService = inject(SongService);
  readonly i18n = inject(TranslationService);

  readonly t = this.i18n.t;
  readonly totalSongs = this.songService.songs;
  readonly filteredSongs = this.songService.filteredSongs;
  readonly searchQuery = this.songService.searchQuery;
  readonly isLoading = this.songService.isLoading;

  onSearchChange(query: string): void {
    this.songService.setSearchQuery(query);
  }

  onClearSearch(): void {
    this.songService.clearSearchQuery();
  }

  onAddSong(song: Song): void {
    this.songService.addToPlaylist(song);
  }

  isSongInPlaylist(songId: string): boolean {
    return this.songService.isSongSelected(songId);
  }

  getSongOccurrence(songId: string): number {
    return this.songService.getSongOccurrenceCount(songId);
  }
}

