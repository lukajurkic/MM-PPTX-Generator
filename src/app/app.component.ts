import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SongCatalogComponent } from './components/song-catalog/song-catalog.component';
import { PlaylistQueueComponent } from './components/playlist-queue/playlist-queue.component';
import { SongService } from './services/song.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SongCatalogComponent, PlaylistQueueComponent],
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
  `]
})
export class AppComponent implements OnInit {
  private readonly songService = inject(SongService);

  isRequestModalOpen = signal(false);

  ngOnInit(): void {
    // Automatically load songs on app startup
    this.songService.loadSongs().subscribe();
  }

  onRequestModalOpen(): void {
    this.isRequestModalOpen.set(true);
  }
}
