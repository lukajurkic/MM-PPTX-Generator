import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SongService } from './services/song.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="app-layout">
      <!-- Responsive Header -->
      <app-header (openRequestModal)="onRequestModalOpen()"></app-header>

      <!-- Main Application Workspace -->
      <main class="main-content">
        <div class="content-container">
          <div class="workspace-placeholder">
            <p>Ready to load song catalog and presentation queue.</p>
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

    .workspace-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-lg);
      padding: 40px;
    }
  `]
})
export class AppComponent implements OnInit {
  private readonly songService = inject(SongService);

  isRequestModalOpen = signal(false);

  ngOnInit(): void {
    // Automatically load songs from assets/songs/index.json on startup
    this.songService.loadSongs().subscribe();
  }

  onRequestModalOpen(): void {
    this.isRequestModalOpen.set(true);
  }
}
