import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../services/song.service';
import { TranslationService } from '../../services/translation.service';
import { Song } from '../../models/song.model';
import { EmptySongModalComponent } from '../empty-song-modal/empty-song-modal.component';

@Component({
  selector: 'app-song-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptySongModalComponent],
  template: `
    <div class="catalog-card">
      <!-- Catalog Header & Search / Filter Controls -->
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

        <!-- Metadata Filter Toolbar -->
        <div class="filter-toolbar">
          <div class="filter-dropdown-group">
            <!-- Category Filter Trigger -->
            <button
              type="button"
              class="filter-trigger-btn"
              [class.active]="selectedCategories().length > 0"
              (click)="toggleCategoryPanel()"
              [title]="t().filterByCategory"
            >
              <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M7 12h10M10 18h4"/>
              </svg>
              <span>{{ t().categoriesLabel }}</span>
              @if (selectedCategories().length > 0) {
                <span class="filter-badge">{{ selectedCategories().length }}</span>
              }
              <svg class="chevron-icon" [class.rotated]="isCategoryOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            <!-- Mass Section Filter Trigger -->
            <button
              type="button"
              class="filter-trigger-btn"
              [class.active]="selectedMassSections().length > 0"
              (click)="toggleMassSectionPanel()"
              [title]="t().filterByMassSection"
            >
              <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
              <span>{{ t().massSectionsLabel }}</span>
              @if (selectedMassSections().length > 0) {
                <span class="filter-badge">{{ selectedMassSections().length }}</span>
              }
              <svg class="chevron-icon" [class.rotated]="isMassSectionOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          <!-- Clear All Active Filters Button -->
          @if (activeFilterCount() > 0) {
            <button
              type="button"
              class="clear-filters-btn"
              (click)="onClearAllFilters()"
              [title]="t().clearFiltersBtn"
            >
              <svg class="btn-clear-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
              <span>{{ t().clearFiltersBtn }}</span>
            </button>
          }
        </div>

        <!-- Collapsible Category Selection Popover/Chips -->
        @if (isCategoryOpen()) {
          <div class="filter-panel fade-in">
            <div class="filter-panel-header">
              <span class="panel-title">{{ t().filterByCategory }}</span>
              @if (selectedCategories().length > 0) {
                <button type="button" class="panel-reset-btn" (click)="onClearCategoryFilters()">
                  {{ t().clearFiltersBtn }}
                </button>
              }
            </div>
            <div class="chips-container">
              @for (category of allCategories(); track category) {
                <button
                  type="button"
                  class="filter-chip"
                  [class.selected]="isCategorySelected(category)"
                  (click)="onToggleCategory(category)"
                >
                  <span class="chip-text">{{ category }}</span>
                  @if (isCategorySelected(category)) {
                    <svg class="chip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  }
                </button>
              }
            </div>
          </div>
        }

        <!-- Collapsible Mass Section Selection Popover/Chips -->
        @if (isMassSectionOpen()) {
          <div class="filter-panel fade-in">
            <div class="filter-panel-header">
              <span class="panel-title">{{ t().filterByMassSection }}</span>
              @if (selectedMassSections().length > 0) {
                <button type="button" class="panel-reset-btn" (click)="onClearMassSectionFilters()">
                  {{ t().clearFiltersBtn }}
                </button>
              }
            </div>
            <div class="chips-container">
              @for (section of allMassSections(); track section) {
                <button
                  type="button"
                  class="filter-chip section-chip"
                  [class.selected]="isMassSectionSelected(section)"
                  (click)="onToggleMassSection(section)"
                >
                  <span class="chip-text">{{ section }}</span>
                  @if (isMassSectionSelected(section)) {
                    <svg class="chip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  }
                </button>
              }
            </div>
          </div>
        }

        <!-- Active Filter Badges Bar -->
        @if (selectedCategories().length > 0 || selectedMassSections().length > 0) {
          <div class="active-chips-strip">
            @for (cat of selectedCategories(); track cat) {
              <span class="active-tag tag-category" (click)="onToggleCategory(cat)" [title]="'Ukloni filter: ' + cat">
                {{ cat }}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </span>
            }
            @for (sec of selectedMassSections(); track sec) {
              <span class="active-tag tag-section" (click)="onToggleMassSection(sec)" [title]="'Ukloni filter: ' + sec">
                {{ sec }}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </span>
            }
          </div>
        }
      </div>

      <!-- Scrollable Song List -->
      <div class="catalog-list" role="list">
        @if (isLoading()) {
          <div class="status-state">
            <div class="spinner"></div>
            <p>{{ t().loadingCatalog }}</p>
          </div>
        } @else {
          <!-- Empty Song Option (Prazna pjesma) -->
          @if (shouldShowEmptySongItem()) {
            <div class="empty-song-item fade-in" role="listitem">
              <div
                class="empty-song-info clickable"
                (click)="onOpenEmptySongModal()"
                tabindex="0"
                role="button"
                (keydown.enter)="onOpenEmptySongModal()"
                (keydown.space)="onOpenEmptySongModal(); $event.preventDefault()"
                [title]="t().emptySongItemHint"
                [attr.aria-label]="t().emptySongTitle + ': ' + t().emptySongItemHint"
              >
                <div class="song-header">
                  <div class="empty-title-row">
                    <span class="empty-song-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="18" height="14" x="3" y="5" rx="2"/>
                        <path d="M7 15h4"/>
                      </svg>
                    </span>
                    <h3 class="song-title">{{ t().emptySongTitle }}</h3>
                  </div>
                  <span class="badge badge-accent empty-badge">
                    {{ t().emptySongBadge }}
                  </span>
                </div>

                <div class="song-tags-row">
                  <span class="tag-badge badge-empty">
                    {{ t().emptySongBadge }}
                  </span>
                </div>

                <p class="song-preview empty-preview">
                  {{ t().emptySongDesc }}
                </p>
              </div>

              <div class="song-actions">
                <button
                  type="button"
                  class="btn btn-primary empty-add-btn"
                  (click)="onOpenEmptySongModal(); $event.stopPropagation()"
                  [attr.aria-label]="t().addEmptySongBtn"
                >
                  <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <span>{{ t().addBtn }}</span>
                </button>
              </div>
            </div>
          }

          @if (filteredSongs().length === 0 && !shouldShowEmptySongItem()) {
            <div class="status-state empty-state">
              <div class="empty-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <h3>{{ t().noSongsFoundTitle }}</h3>
              @if (searchQuery() || selectedCategories().length > 0 || selectedMassSections().length > 0) {
                <p>{{ t().noSongsFoundDesc(searchQuery() || activeFiltersSummary()) }}</p>
                <button type="button" class="btn btn-secondary btn-sm" (click)="onClearAllFilters()">
                  {{ t().clearFiltersBtn }}
                </button>
              } @else {
                <p>{{ t().catalogEmptyDesc }}</p>
              }
            </div>
          } @else {
            @for (song of filteredSongs(); track song.id) {
            <div class="song-item fade-in" role="listitem">
              <div
                class="song-info clickable"
                (click)="onOpenLyrics(song)"
                tabindex="0"
                role="button"
                (keydown.enter)="onOpenLyrics(song)"
                (keydown.space)="onOpenLyrics(song); $event.preventDefault()"
                [title]="t().clickToViewLyricsHint"
                [attr.aria-label]="t().clickToViewLyricsHint + ': ' + song.title"
              >
                <div class="song-header">
                  <h3 class="song-title">{{ song.title }}</h3>
                  <span class="badge badge-primary stanza-badge">
                    {{ t().slidesCount(song.stanzaCount) }}
                  </span>
                </div>

                <!-- Metadata Tags (Mass Section & Category) -->
                @if ((song.massSections && song.massSections.length > 0) || (song.categories && song.categories.length > 0)) {
                  <div class="song-tags-row">
                    @for (sec of song.massSections; track sec) {
                      <span
                        class="tag-badge badge-mass-section"
                        [class.active-filter]="isMassSectionSelected(sec)"
                        (click)="onToggleMassSection(sec); $event.stopPropagation()"
                        [title]="'Filtriraj po dijelu mise: ' + sec"
                      >
                        {{ sec }}
                      </span>
                    }
                    @for (cat of song.categories; track cat) {
                      <span
                        class="tag-badge badge-category"
                        [class.active-filter]="isCategorySelected(cat)"
                        (click)="onToggleCategory(cat); $event.stopPropagation()"
                        [title]="'Filtriraj po kategoriji: ' + cat"
                      >
                        {{ cat }}
                      </span>
                    }
                  </div>
                }

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
                  (click)="onAddSong(song); $event.stopPropagation()"
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
      }
      </div>
    </div>

    @if (isEmptySongModalOpen()) {
      <app-empty-song-modal
        (confirm)="onConfirmEmptySong($event)"
        (close)="onCloseEmptySongModal()"
      />
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
      min-width: 0;
      height: 100%;
    }

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
      width: 100%;
      min-width: 0;
    }

    .catalog-header {
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 10px;
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
      height: 38px;
      font-size: 13px;
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

    /* Filter Toolbar */
    .filter-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-dropdown-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 500;
      padding: 5px 9px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-trigger-btn:hover {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border-color: var(--border-default);
    }

    .filter-trigger-btn.active {
      background: rgba(7, 77, 151, 0.2);
      border-color: var(--accent-primary);
      color: #bfdbfe;
    }

    .filter-icon {
      width: 13px;
      height: 13px;
      opacity: 0.85;
    }

    .chevron-icon {
      width: 12px;
      height: 12px;
      transition: transform 0.2s ease;
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .filter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: var(--accent-primary);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }

    .clear-filters-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--accent-danger);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: var(--radius-sm);
      transition: background 0.15s ease;
    }

    .clear-filters-btn:hover {
      background: var(--accent-danger-light);
    }

    .btn-clear-svg {
      width: 12px;
      height: 12px;
    }

    /* Collapsible Filter Panel */
    .filter-panel {
      background: var(--bg-app);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 2px;
      box-shadow: var(--shadow-sm);
    }

    .filter-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .panel-reset-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 11px;
      cursor: pointer;
    }

    .panel-reset-btn:hover {
      color: var(--text-primary);
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 150px;
      overflow-y: auto;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 4px 10px;
      font-size: 11px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-chip:hover {
      border-color: var(--border-default);
      color: var(--text-primary);
      background: #1e293b;
    }

    .filter-chip.selected {
      background: var(--accent-primary);
      color: #ffffff;
      border-color: var(--accent-primary);
      font-weight: 600;
    }

    .section-chip.selected {
      background: #0284c7; /* Cyan / Sky for Mass section distinction */
      border-color: #0284c7;
    }

    .chip-check {
      width: 10px;
      height: 10px;
    }

    /* Active Chips Strip */
    .active-chips-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding-top: 2px;
    }

    .active-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: opacity 0.15s ease;
    }

    .active-tag:hover {
      opacity: 0.8;
    }

    .active-tag svg {
      width: 11px;
      height: 11px;
    }

    .active-tag.tag-category {
      background-color: rgba(7, 77, 151, 0.25);
      border: 1px solid rgba(7, 77, 151, 0.55);
      color: #bfdbfe;
    }

    .active-tag.tag-section {
      background-color: rgba(2, 132, 199, 0.2);
      border: 1px solid rgba(2, 132, 199, 0.5);
      color: #bae6fd;
    }

    /* Song Catalog List */
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

    .song-info,
    .empty-song-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .song-info.clickable,
    .empty-song-info.clickable {
      cursor: pointer;
      border-radius: var(--radius-sm);
      outline: none;
      transition: opacity 0.15s ease;
    }

    .song-info.clickable:hover .song-title,
    .empty-song-info.clickable:hover .song-title {
      color: var(--accent-primary);
    }

    .song-info.clickable:focus-visible,
    .empty-song-info.clickable:focus-visible {
      box-shadow: 0 0 0 2px var(--accent-primary);
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

    /* Metadata Tag Row on Song Card */
    .song-tags-row {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
      margin-top: 2px;
      margin-bottom: 2px;
    }

    .tag-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .badge-mass-section {
      background-color: rgba(2, 132, 199, 0.15);
      color: #7dd3fc;
      border: 1px solid rgba(2, 132, 199, 0.3);
    }

    .badge-mass-section:hover,
    .badge-mass-section.active-filter {
      background-color: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    .badge-category {
      background-color: rgba(7, 77, 151, 0.2);
      color: #bfdbfe;
      border: 1px solid rgba(7, 77, 151, 0.4);
    }

    .badge-category:hover,
    .badge-category.active-filter {
      background-color: var(--accent-primary);
      color: #ffffff;
      border-color: var(--accent-primary);
    }

    /* Empty Song Item Styles */
    .empty-song-item {
      border: 1px dashed rgba(7, 77, 151, 0.45);
      background: linear-gradient(135deg, rgba(7, 77, 151, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.15s ease;
    }

    .empty-song-item:hover {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(7, 77, 151, 0.14) 0%, rgba(2, 132, 199, 0.08) 100%);
    }

    .empty-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-song-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      background: rgba(7, 77, 151, 0.25);
      color: #93c5fd;
      flex-shrink: 0;
    }

    .empty-song-icon svg {
      width: 14px;
      height: 14px;
    }

    .empty-badge {
      background-color: rgba(7, 77, 151, 0.25);
      color: #93c5fd;
      border: 1px solid rgba(7, 77, 151, 0.4);
      font-size: 11px;
      padding: 1px 7px;
    }

    .badge-empty {
      background-color: rgba(147, 197, 253, 0.12);
      color: #bfdbfe;
      border: 1px solid rgba(147, 197, 253, 0.25);
      cursor: default;
    }

    .empty-preview {
      font-style: normal;
      color: var(--text-secondary);
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

    .add-btn,
    .empty-add-btn {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: var(--radius-sm);
      min-width: 72px;
    }

    .add-btn.in-playlist {
      background-color: rgba(7, 77, 151, 0.2);
      border-color: rgba(7, 77, 151, 0.45);
      color: #bfdbfe;
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

  // Metadata filter state
  readonly allCategories = this.songService.allCategories;
  readonly allMassSections = this.songService.allMassSections;
  readonly selectedCategories = this.songService.selectedCategories;
  readonly selectedMassSections = this.songService.selectedMassSections;
  readonly activeFilterCount = this.songService.activeFilterCount;

  readonly isCategoryOpen = signal<boolean>(false);
  readonly isMassSectionOpen = signal<boolean>(false);
  readonly isEmptySongModalOpen = signal<boolean>(false);

  readonly shouldShowEmptySongItem = computed(() => {
    // If mass sections filter is active, empty song has no mass section
    if (this.selectedMassSections().length > 0) {
      return false;
    }
    // If category filter is active, empty song only matches if "Prazna pjesma" is included
    const cats = this.selectedCategories();
    if (cats.length > 0 && !cats.includes('Prazna pjesma')) {
      return false;
    }
    const q = this.normalizeText(this.searchQuery());
    if (!q) return true;
    return (
      'prazna pjesma'.includes(q) ||
      'empty song'.includes(q) ||
      'prazna'.includes(q) ||
      'empty'.includes(q) ||
      'blank'.includes(q) ||
      'crni'.includes(q) ||
      'slajd'.includes(q) ||
      'slide'.includes(q) ||
      'pjesma'.includes(q)
    );
  });

  onOpenEmptySongModal(): void {
    this.isEmptySongModalOpen.set(true);
  }

  onCloseEmptySongModal(): void {
    this.isEmptySongModalOpen.set(false);
  }

  onConfirmEmptySong(event: { title: string; slideCount: number }): void {
    this.songService.addEmptySong(event.title, event.slideCount);
    this.isEmptySongModalOpen.set(false);
  }

  private normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  toggleCategoryPanel(): void {
    this.isCategoryOpen.update(v => !v);
    if (this.isCategoryOpen()) {
      this.isMassSectionOpen.set(false);
    }
  }

  toggleMassSectionPanel(): void {
    this.isMassSectionOpen.update(v => !v);
    if (this.isMassSectionOpen()) {
      this.isCategoryOpen.set(false);
    }
  }

  onSearchChange(query: string): void {
    this.songService.setSearchQuery(query);
  }

  onClearSearch(): void {
    this.songService.clearSearchQuery();
  }

  onToggleCategory(category: string): void {
    this.songService.toggleCategoryFilter(category);
  }

  onToggleMassSection(section: string): void {
    this.songService.toggleMassSectionFilter(section);
  }

  isCategorySelected(category: string): boolean {
    return this.songService.isCategorySelected(category);
  }

  isMassSectionSelected(section: string): boolean {
    return this.songService.isMassSectionSelected(section);
  }

  onClearCategoryFilters(): void {
    this.songService.clearCategoryFilters();
  }

  onClearMassSectionFilters(): void {
    this.songService.clearMassSectionFilters();
  }

  onClearAllFilters(): void {
    this.songService.clearAllFilters();
    this.isCategoryOpen.set(false);
    this.isMassSectionOpen.set(false);
  }

  onAddSong(song: Song): void {
    this.songService.addToPlaylist(song);
  }

  onOpenLyrics(song: Song): void {
    this.songService.openLyrics(song);
  }

  isSongInPlaylist(songId: string): boolean {
    return this.songService.isSongSelected(songId);
  }

  getSongOccurrence(songId: string): number {
    return this.songService.getSongOccurrenceCount(songId);
  }

  activeFiltersSummary(): string {
    const parts: string[] = [];
    if (this.selectedCategories().length > 0) {
      parts.push(this.selectedCategories().join(', '));
    }
    if (this.selectedMassSections().length > 0) {
      parts.push(this.selectedMassSections().join(', '));
    }
    return parts.join(' | ');
  }
}
