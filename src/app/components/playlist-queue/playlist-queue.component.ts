import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../../services/song.service';
import { PptxExportService } from '../../services/pptx-export.service';
import { SettingsService } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-playlist-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="queue-card">
      <!-- Queue Header with Summary Bar -->
      <div class="queue-header">
        <div class="header-main-row">
          <div class="title-with-badge">
            <h2 class="queue-title">{{ t().queueTitle }}</h2>
            <span class="badge badge-primary queue-badge">
              {{ playlist().length }}
            </span>
          </div>

          @if (playlist().length > 0) {
            <button
              type="button"
              class="clear-all-btn"
              (click)="onClearPlaylist()"
              [title]="t().clearAllBtn"
              [attr.aria-label]="t().clearAllBtn"
            >
              {{ t().clearAllBtn }}
            </button>
          }
        </div>

        <!-- Summary Statistics Bar -->
        @if (playlist().length > 0) {
          <div class="summary-bar fade-in">
            <div class="summary-metric">
              <span class="metric-label">{{ t().selectedSongsMetric }}</span>
              <span class="metric-value">{{ playlist().length }}</span>
            </div>
            <div class="metric-divider"></div>
            <div class="summary-metric">
              <span class="metric-label">{{ t().lyricSlidesMetric }}</span>
              <span class="metric-value">{{ lyricSlidesCount() }}</span>
            </div>
            <div class="metric-divider"></div>
            <div class="summary-metric">
              <span class="metric-label">{{ t().estTotalSlidesMetric }}</span>
              <span class="metric-value highlight">{{ totalEstimatedSlides() }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Playlist Queue Body -->
      <div class="queue-body" role="list">
        @if (playlist().length === 0) {
          <!-- Empty State -->
          <div class="empty-queue-state fade-in">
            <div class="empty-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect width="20" height="15" x="2" y="3" rx="2"/>
                <path d="M7 21h10M12 18v3"/>
              </svg>
            </div>
            <h3 class="empty-title">{{ t().emptyQueueTitle }}</h3>
            <p class="empty-desc">
              {{ t().emptyQueueDesc }}
            </p>
          </div>
        } @else {
          <!-- Ordered List of Selected Songs -->
          <div class="items-list">
            @for (item of playlist(); track item.playlistId; let i = $index; let isFirst = $first; let isLast = $last) {
              <div class="queue-item fade-in" role="listitem">
                <!-- Order Number Badge -->
                <div class="order-badge" title="#{{ i + 1 }}">
                  {{ i + 1 }}
                </div>

                <!-- Song Details -->
                <div
                  class="item-details clickable"
                  (click)="onOpenLyrics(item.song)"
                  tabindex="0"
                  role="button"
                  (keydown.enter)="onOpenLyrics(item.song)"
                  (keydown.space)="onOpenLyrics(item.song); $event.preventDefault()"
                  [title]="t().clickToViewLyricsHint"
                  [attr.aria-label]="t().clickToViewLyricsHint + ': ' + item.song.title"
                >
                  <h4 class="item-title">{{ item.song.title }}</h4>
                  <div class="item-meta">
                    <span class="meta-tag">{{ t().slidesCount(item.song.stanzaCount) }}</span>
                    @if (!isLast && settings().blankSlideBetweenSongs) {
                      <span class="transition-tag">{{ t().blankTransitionTag }}</span>
                    }
                  </div>
                </div>

                <!-- Reorder & Remove Actions -->
                <div class="item-actions">
                  <div class="reorder-group">
                    <button
                      type="button"
                      class="btn-icon-action"
                      [disabled]="isFirst"
                      (click)="onMoveUp(i); $event.stopPropagation()"
                      [title]="t().moveUpTooltip"
                      [attr.aria-label]="t().moveUpTooltip"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="btn-icon-action"
                      [disabled]="isLast"
                      (click)="onMoveDown(i); $event.stopPropagation()"
                      [title]="t().moveDownTooltip"
                      [attr.aria-label]="t().moveDownTooltip"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    class="btn-icon-action delete-action"
                    (click)="onRemoveItem(item.playlistId); $event.stopPropagation()"
                    [title]="t().removeTooltip"
                    [attr.aria-label]="t().removeTooltip + ': ' + item.song.title"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Footer with Prominent Download Button -->
      <div class="queue-footer">
        @if (feedbackMessage()) {
          <div class="feedback-banner" [class.success]="feedbackType() === 'success'" [class.error]="feedbackType() === 'error'">
            @if (feedbackType() === 'success') {
              <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            }
            <span>{{ feedbackMessage() }}</span>
          </div>
        }

        <button
          type="button"
          class="btn btn-success export-button"
          [disabled]="playlist().length === 0 || isGenerating()"
          (click)="onGeneratePresentation()"
          [attr.aria-label]="t().exportPresentationBtn"
        >
          @if (isGenerating()) {
            <div class="button-spinner"></div>
            <span>{{ t().generatingPresentationBtn }}</span>
          } @else {
            <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            <span>{{ t().exportPresentationBtn }}</span>
          }
        </button>

        <!-- Presentation Settings Status Indicator (Task 10) -->
        <button
          type="button"
          class="settings-status-btn"
          [class.custom]="!isDefaultSettings()"
          (click)="openSettings.emit()"
          [attr.title]="t().settingsBtn"
          [attr.aria-label]="!isDefaultSettings() ? t().settingsCustomStatus : t().settingsDefaultStatus"
        >
          @if (isDefaultSettings()) {
            <span class="status-indicator default-indicator" aria-hidden="true">
              <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span class="status-text">{{ t().settingsDefaultStatus }}</span>
          } @else {
            <span class="status-indicator custom-indicator" aria-hidden="true">
              <span class="custom-dot"></span>
            </span>
            <span class="status-text">{{ t().settingsCustomStatus }}</span>
          }
          <svg class="status-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .queue-card {
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

    .queue-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .header-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .queue-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .queue-badge {
      font-size: 12px;
      padding: 2px 8px;
    }

    .clear-all-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: color 0.15s ease, background 0.15s ease;
    }

    .clear-all-btn:hover {
      color: var(--accent-danger);
      background-color: var(--accent-danger-light);
    }

    .summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background-color: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 8px 12px;
    }

    .summary-metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .metric-label {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .metric-value.highlight {
      color: #38bdf8;
    }

    .metric-divider {
      width: 1px;
      height: 24px;
      background-color: var(--border-subtle);
    }

    .queue-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
    }

    .empty-queue-state {
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
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .empty-icon-wrap svg {
      width: 28px;
      height: 28px;
    }

    .empty-title {
      font-size: 1.05rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .empty-desc {
      font-size: 13px;
      max-width: 320px;
      line-height: 1.5;
    }

    .empty-desc strong {
      color: var(--text-primary);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .queue-item {
      background-color: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .queue-item:hover {
      border-color: var(--border-default);
      background-color: #0d1424;
    }

    .order-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      color: var(--accent-primary);
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .item-details.clickable {
      cursor: pointer;
      border-radius: var(--radius-sm);
      outline: none;
      transition: opacity 0.15s ease;
    }

    .item-details.clickable:hover .item-title {
      color: var(--accent-primary);
    }

    .item-details.clickable:focus-visible {
      box-shadow: 0 0 0 2px var(--accent-primary);
    }

    .item-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .meta-tag {
      color: var(--text-secondary);
    }

    .transition-tag {
      color: var(--text-muted);
      font-size: 11px;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .reorder-group {
      display: flex;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .btn-icon-action {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: all 0.15s ease;
    }

    .btn-icon-action:hover:not(:disabled) {
      background: var(--border-default);
      color: var(--text-primary);
    }

    .btn-icon-action:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-icon-action svg {
      width: 14px;
      height: 14px;
    }

    .delete-action {
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
    }

    .delete-action:hover {
      background: var(--accent-danger-light);
      color: var(--accent-danger);
    }

    .queue-footer {
      padding: 16px 20px 18px;
      border-top: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .feedback-banner {
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feedback-banner.success {
      background-color: var(--accent-success-light);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
    }

    .feedback-banner.error {
      background-color: var(--accent-danger-light);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .feedback-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .export-button {
      width: 100%;
      padding: 13px 20px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
      box-shadow: var(--shadow-md);
    }

    .btn-svg-icon {
      width: 18px;
      height: 18px;
    }

    .settings-status-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 7px 12px;
      border-radius: var(--radius-md);
      font-size: 11.5px;
      font-weight: 500;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .settings-status-btn:hover {
      background-color: rgba(255, 255, 255, 0.06);
      border-color: var(--border-medium);
      color: var(--text-primary);
    }

    .settings-status-btn.custom {
      background-color: rgba(30, 64, 175, 0.12);
      border-color: rgba(37, 99, 235, 0.35);
      color: #93c5fd;
    }

    .settings-status-btn.custom:hover {
      background-color: rgba(30, 64, 175, 0.2);
      border-color: rgba(37, 99, 235, 0.55);
      color: #bfdbfe;
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .default-indicator .status-icon {
      width: 13px;
      height: 13px;
      color: #10b981;
    }

    .custom-indicator .custom-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #3b82f6;
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
    }

    .status-text {
      flex: 1;
      text-align: center;
      letter-spacing: 0.01em;
      line-height: 1.3;
    }

    .status-chevron {
      width: 13px;
      height: 13px;
      opacity: 0.45;
      transition: transform 0.2s ease, opacity 0.2s ease;
      flex-shrink: 0;
    }

    .settings-status-btn:hover .status-chevron {
      opacity: 0.9;
      transform: translateX(2px);
    }

    .button-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class PlaylistQueueComponent {
  @Output() openSettings = new EventEmitter<void>();

  private readonly songService = inject(SongService);
  private readonly pptxService = inject(PptxExportService);
  private readonly settingsService = inject(SettingsService);
  readonly i18n = inject(TranslationService);

  readonly t = this.i18n.t;
  readonly playlist = this.songService.playlist;
  readonly settings = this.settingsService.settings;
  readonly isDefaultSettings = this.settingsService.isDefault;
  readonly isGenerating = signal<boolean>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly feedbackType = signal<'success' | 'error'>('success');

  // Computed lyric slide count
  readonly lyricSlidesCount = computed(() => {
    return this.playlist().reduce((sum, item) => sum + item.song.stanzaCount, 0);
  });

  // Computed total slides count: Lyric slides + blank slide before first song, between songs, and after last song (respecting settings)
  readonly totalEstimatedSlides = computed(() => {
    const items = this.playlist();
    if (items.length === 0) return 0;
    const s = this.settings();
    let blankSlides = 0;
    if (s.blankSlideStartEnd) {
      blankSlides += 2;
    }
    if (s.blankSlideBetweenSongs && items.length > 1) {
      blankSlides += (items.length - 1);
    }
    return this.lyricSlidesCount() + blankSlides;
  });

  onMoveUp(index: number): void {
    this.songService.moveSongUp(index);
  }

  onMoveDown(index: number): void {
    this.songService.moveSongDown(index);
  }

  onRemoveItem(playlistId: string): void {
    this.songService.removeFromPlaylist(playlistId);
  }

  onClearPlaylist(): void {
    this.songService.clearPlaylist();
  }

  onOpenLyrics(song: Song): void {
    this.songService.openLyrics(song);
  }

  async onGeneratePresentation(): Promise<void> {
    const items = this.playlist();
    if (items.length === 0) return;

    this.isGenerating.set(true);
    this.feedbackMessage.set(null);

    try {
      const filename = await this.pptxService.downloadPresentation(items, {
        settings: this.settings()
      });
      this.feedbackType.set('success');
      this.feedbackMessage.set(this.t().exportSuccessMsg(filename));

      // Clear feedback after 4 seconds
      setTimeout(() => {
        this.feedbackMessage.set(null);
      }, 4000);
    } catch (err: any) {
      console.error('[PlaylistQueueComponent] Error generating presentation:', err);
      this.feedbackType.set('error');
      this.feedbackMessage.set(err.message || this.t().exportErrorGeneric);
    } finally {
      this.isGenerating.set(false);
    }
  }
}

