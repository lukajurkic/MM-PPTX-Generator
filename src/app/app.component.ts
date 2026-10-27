import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SongCatalogComponent } from './components/song-catalog/song-catalog.component';
import { PlaylistQueueComponent } from './components/playlist-queue/playlist-queue.component';
import { RequestSongModalComponent } from './components/request-song-modal/request-song-modal.component';
import { SongLyricsModalComponent } from './components/song-lyrics-modal/song-lyrics-modal.component';
import { SongService } from './services/song.service';
import { APP_VERSION } from '../environments/version';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SongCatalogComponent,
    PlaylistQueueComponent,
    RequestSongModalComponent,
    SongLyricsModalComponent
  ],
  template: `
    <div class="app-layout">
      <!-- Responsive Header -->
      <app-header (openRequestModal)="onRequestModalOpen()"></app-header>

      <!-- Main Application Two-Panel Workspace -->
      <main class="main-content">
        <div class="content-container">
          <div class="two-panel-grid">
            <!-- Left Panel: Song Catalog (Task 4.2) -->
            <section class="panel-section" aria-label="Song Catalog">
              <app-song-catalog></app-song-catalog>
            </section>

            <!-- Right Panel: Playlist Presentation Queue (Task 4.3) -->
            <section class="panel-section" aria-label="Presentation Playlist Queue">
              <app-playlist-queue></app-playlist-queue>
            </section>
          </div>
        </div>
      </main>

      <!-- Song Request Modal Dialog (Task 4.4) -->
      @if (isRequestModalOpen()) {
        <app-request-song-modal (close)="onRequestModalClose()"></app-request-song-modal>
      }

      <!-- Song Lyrics Preview Modal Dialog (Task 6.7) -->
      @if (activeLyricsSong(); as song) {
        <app-song-lyrics-modal [song]="song" (close)="onCloseLyrics()"></app-song-lyrics-modal>
      }

      <!-- Application Footer with Version -->
      <footer class="app-footer">
        <div class="footer-container">
          <p class="footer-text">
            <span>SKAC Osijek • PPTX Lyrics Presentation Web Maker</span>
            <span class="footer-dot">•</span>
            <span class="footer-version">v{{ appVersion }}</span>
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-app);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .content-container {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 24px;
      flex: 1;
      display: flex;
    }

    .two-panel-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
      flex: 1;
    }

    .panel-section {
      height: 100%;
      min-height: 520px;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 900px) {
      .content-container {
        padding: 16px;
      }

      .two-panel-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .app-footer {
      border-top: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      padding: 14px 24px;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1440px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .footer-dot {
      opacity: 0.4;
    }

    .footer-version {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 500;
      color: var(--text-secondary);
    }
  `]
})
export class AppComponent implements OnInit {
  private readonly songService = inject(SongService);
  readonly appVersion = APP_VERSION;

  readonly isRequestModalOpen = signal<boolean>(false);
  readonly activeLyricsSong = this.songService.activeLyricsSong;

  ngOnInit(): void {
    // Automatically load songs on app startup
    this.songService.loadSongs().subscribe();
  }

  onRequestModalOpen(): void {
    this.isRequestModalOpen.set(true);
  }

  onRequestModalClose(): void {
    this.isRequestModalOpen.set(false);
  }

  onCloseLyrics(): void {
    this.songService.closeLyrics();
  }
}
