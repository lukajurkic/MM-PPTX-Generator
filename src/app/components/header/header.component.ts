import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../../services/song.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Brand & Title -->
        <div class="brand-section">
          <div class="brand-icon-wrapper" aria-hidden="true">
            <!-- Projector Screen / Presentation Icon -->
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h20"/>
              <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
              <path d="m7 21 5-5 5 5"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">PPTX Lyrics Maker</h1>
            <p class="brand-subtitle">Widescreen Presentation Generator</p>
          </div>
        </div>

        <!-- Meta Badge & Actions -->
        <div class="actions-section">
          <div class="badge badge-primary song-count-badge" title="Total songs indexed in repository">
            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span>{{ songCount() }} {{ songCount() === 1 ? 'Song' : 'Songs' }} Available</span>
          </div>

          <button
            type="button"
            class="btn btn-primary request-btn"
            (click)="onRequestNewSong()"
            aria-label="Request a new song to be added"
          >
            <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            <span>Request New Song</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: var(--shadow-sm);
    }

    .header-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border: 1px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-glow);
    }

    .brand-icon {
      width: 24px;
      height: 24px;
      color: #a5b4fc;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(to right, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .song-count-badge {
      padding: 6px 12px;
      font-size: 13px;
    }

    .badge-icon {
      width: 14px;
      height: 14px;
    }

    .request-btn {
      padding: 8px 16px;
      font-size: 13px;
    }

    .btn-icon-svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 640px) {
      .header-container {
        padding: 12px 16px;
      }

      .brand-title {
        font-size: 1.1rem;
      }

      .brand-subtitle {
        display: none;
      }

      .song-count-badge {
        display: none;
      }

      .request-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly songService = inject(SongService);

  @Output() openRequestModal = new EventEmitter<void>();

  // Reactive song count
  readonly songCount = computed(() => this.songService.songs().length);

  onRequestNewSong(): void {
    this.openRequestModal.emit();
  }
}

