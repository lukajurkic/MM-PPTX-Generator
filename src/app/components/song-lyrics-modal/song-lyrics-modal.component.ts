import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-song-lyrics-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-backdrop fade-in"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-modal-title"
    >
      <div class="modal-dialog fade-in" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-titles">
            <div class="title-with-badge">
              <h2 id="lyrics-modal-title" class="modal-title">{{ song.title }}</h2>
              <span class="badge badge-primary stanza-badge">
                {{ t().slidesCount(song.stanzaCount) }}
              </span>
            </div>

            <!-- Metadata Tags Row (Categories & Mass Sections) -->
            @if ((song.massSections && song.massSections.length > 0) || (song.categories && song.categories.length > 0)) {
              <div class="song-tags-row">
                @for (sec of song.massSections; track sec) {
                  <span class="tag-badge badge-mass-section">
                    {{ sec }}
                  </span>
                }
                @for (cat of song.categories; track cat) {
                  <span class="tag-badge badge-category">
                    {{ cat }}
                  </span>
                }
              </div>
            }
          </div>

          <button
            type="button"
            class="close-button"
            (click)="onClose()"
            [attr.aria-label]="t().modalCloseTooltip"
            [title]="t().modalCloseTooltip"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body: Stanzas List or Empty Song Notice -->
        <div class="modal-body custom-scrollbar">
          @if (song.isEmptySong) {
            <div class="empty-song-notice">
              <div class="empty-notice-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <rect width="18" height="14" x="3" y="5" rx="2"/>
                  <path d="M7 15h4"/>
                </svg>
              </div>
              <h3 class="notice-title">{{ t().emptySongLyricsNoticeTitle }}</h3>
              <p class="notice-desc">{{ t().emptySongLyricsNoticeDesc(song.stanzaCount) }}</p>
            </div>
          } @else {
            <div class="stanzas-grid">
              @for (stanza of song.stanzas; track stanza; let i = $index) {
                <div class="stanza-card">
                  <div class="stanza-header">
                    <span class="stanza-number-badge">
                      <svg class="stanza-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <path d="M7 8h10M7 12h10M7 16h6"/>
                      </svg>
                      {{ t().stanzaLabel(i + 1) }}
                    </span>
                  </div>
                  <div class="stanza-lyrics">{{ stanza }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Modal Actions Footer -->
        <div class="modal-footer">
          @if (!song.isEmptySong) {
            <!-- Copy Lyrics Action -->
            <button
              type="button"
              class="btn btn-secondary copy-btn"
              [class.btn-copied]="copied()"
              (click)="onCopyLyrics()"
              [title]="t().copyLyricsBtn"
            >
              @if (copied()) {
                <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span>{{ t().lyricsCopiedNotice }}</span>
              } @else {
                <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span>{{ t().copyLyricsBtn }}</span>
              }
            </button>
          }

          <div class="footer-primary-actions">
            <!-- Add to Playlist Button -->
            <button
              type="button"
              class="btn btn-primary add-playlist-btn"
              (click)="onAddToPlaylist()"
              [title]="t().addToPlaylistBtn"
            >
              @if (isSongInPlaylist()) {
                <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span>{{ t().addedToPlaylistBtn(songOccurrence()) }}</span>
              } @else {
                <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>{{ t().addToPlaylistBtn }}</span>
              }
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="btn btn-secondary close-btn"
              (click)="onClose()"
            >
              {{ t().closeBtn }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(2, 6, 23, 0.78);
      backdrop-filter: blur(4px);
      z-index: 110;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-dialog {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      max-width: 680px;
      width: 100%;
      box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      max-height: 88vh;
      overflow: hidden;
    }

    .modal-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      background: var(--bg-surface);
      flex-shrink: 0;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      word-break: break-word;
    }

    .stanza-badge {
      font-size: 12px;
      padding: 3px 10px;
      font-weight: 600;
    }

    .song-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      line-height: 1.2;
    }

    .badge-mass-section {
      background: rgba(14, 165, 233, 0.14);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }

    .badge-category {
      background: rgba(7, 77, 151, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(7, 77, 151, 0.45);
    }

    .close-button {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .close-button:hover {
      background: var(--border-default);
      color: var(--text-primary);
    }

    .close-button svg {
      width: 16px;
      height: 16px;
    }

    .modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--bg-app);
    }

    .empty-song-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 36px 20px;
      background: var(--bg-surface);
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-md);
      margin: auto 0;
    }

    .empty-notice-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(7, 77, 151, 0.15);
      color: #93c5fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }

    .empty-notice-icon svg {
      width: 24px;
      height: 24px;
    }

    .notice-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .notice-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      max-width: 420px;
      line-height: 1.45;
    }

    .stanzas-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stanza-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s ease;
    }

    .stanza-card:hover {
      border-color: var(--border-default);
    }

    .stanza-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stanza-number-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-primary);
      background: rgba(59, 130, 246, 0.1);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .stanza-icon {
      width: 12px;
      height: 12px;
    }

    .stanza-lyrics {
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.65;
      color: var(--text-primary);
      white-space: pre-line;
      word-break: break-word;
      font-weight: 400;
      padding-left: 2px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .footer-primary-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-svg {
      width: 15px;
      height: 15px;
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      padding: 8px 14px;
    }

    .btn-copied {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.4);
      color: #4ade80;
    }

    .add-playlist-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-weight: 600;
    }

    .close-btn {
      font-weight: 500;
    }

    @media (max-width: 640px) {
      .modal-footer {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .footer-primary-actions {
        flex-direction: column;
        width: 100%;
      }

      .footer-primary-actions .btn,
      .copy-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SongLyricsModalComponent implements OnDestroy {
  @Input({ required: true }) song!: Song;
  @Output() close = new EventEmitter<void>();

  private readonly songService = inject(SongService);
  private readonly i18n = inject(TranslationService);

  readonly t = this.i18n.t;
  readonly copied = signal<boolean>(false);
  private copyTimeout: any = null;

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
    this.songService.closeLyrics();
  }

  onAddToPlaylist(): void {
    if (this.song) {
      this.songService.addToPlaylist(this.song);
    }
  }

  isSongInPlaylist(): boolean {
    return this.song ? this.songService.isSongSelected(this.song.id) : false;
  }

  songOccurrence(): number {
    return this.song ? this.songService.getSongOccurrenceCount(this.song.id) : 0;
  }

  async onCopyLyrics(): Promise<void> {
    if (!this.song) return;

    const fullText = `${this.song.title}\n\n${(this.song.stanzas || []).join('\n\n')}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.copied.set(true);
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copied.set(false);
      }, 2500);
    } catch (err) {
      console.error('[SongLyricsModal] Failed to copy lyrics:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }
}
