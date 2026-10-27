import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SongCatalogComponent } from './components/song-catalog/song-catalog.component';
import { SongService } from './services/song.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SongCatalogComponent],
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
              <div class="queue-placeholder">
                <div class="placeholder-content">
                  <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="m9 8 6 4-6 4Z"/>
                  </svg>
                  <h3>Presentation Queue</h3>
                  <p>Select songs from the catalog on the left to build your PowerPoint slide deck.</p>
                </div>
              </div>
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

    .queue-placeholder {
      flex: 1;
      background-color: var(--bg-surface);
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      text-align: center;
    }

    .placeholder-content {
      max-width: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
    }

    .placeholder-icon {
      width: 48px;
      height: 48px;
      color: var(--border-default);
    }

    .placeholder-content h3 {
      font-size: 1.1rem;
      color: var(--text-secondary);
    }

    .placeholder-content p {
      font-size: 13px;
      line-height: 1.5;
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
