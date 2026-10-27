import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestSongService } from '../../services/request-song.service';
import { SongRequestPayload } from '../../models/song-request.model';

@Component({
  selector: 'app-request-song-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="modal-backdrop fade-in"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-dialog fade-in" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-titles">
            <h2 id="modal-title" class="modal-title">Request a New Song</h2>
            <p class="modal-subtitle">
              Submit song details to send a request to <strong>{{ recipientEmail }}</strong>.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            (click)="onClose()"
            aria-label="Close dialog"
            title="Close (ESC)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Success Alert Message -->
        @if (successMessage()) {
          <div class="alert alert-success fade-in" role="alert">
            <div class="alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div class="alert-content">
              <strong>Request Sent!</strong>
              <p>{{ successMessage() }}</p>
            </div>
          </div>
        }

        <!-- Error Alert Message -->
        @if (errorMessage()) {
          <div class="alert alert-error fade-in" role="alert">
            <div class="alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="alert-content">
              <strong>Submission Failed</strong>
              <p>{{ errorMessage() }}</p>
            </div>
          </div>
        }

        <!-- Modal Form -->
        <form class="modal-form" (ngSubmit)="onSubmit()">
          <!-- Song Title (Required) -->
          <div class="form-group">
            <label for="song-title" class="form-label">
              Song Title <span class="required" title="Required field">*</span>
            </label>
            <input
              id="song-title"
              type="text"
              name="title"
              class="form-input"
              [(ngModel)]="form.title"
              placeholder="e.g., Blessed Be Your Name"
              required
              [disabled]="isSubmitting()"
            />
          </div>

          <!-- Lyrics (Required, Multiline) -->
          <div class="form-group">
            <div class="label-row">
              <label for="song-lyrics" class="form-label">
                Lyrics <span class="required" title="Required field">*</span>
              </label>
              <span class="hint-text">Separate stanzas by empty lines for slides</span>
            </div>
            <textarea
              id="song-lyrics"
              name="lyrics"
              class="form-textarea lyrics-textarea"
              [(ngModel)]="form.lyrics"
              placeholder="Enter or paste lyrics here...&#10;&#10;Separate each verse and chorus with a blank line to divide into presentation slides."
              rows="6"
              required
              [disabled]="isSubmitting()"
            ></textarea>
          </div>

          <!-- Submitter Name & Email (Optional) -->
          <div class="form-row">
            <div class="form-group">
              <label for="submitter-name" class="form-label">
                Your Name <span class="optional">(optional)</span>
              </label>
              <input
                id="submitter-name"
                type="text"
                name="submitterName"
                class="form-input"
                [(ngModel)]="form.submitterName"
                placeholder="e.g., John Doe"
                [disabled]="isSubmitting()"
              />
            </div>

            <div class="form-group">
              <label for="submitter-email" class="form-label">
                Your Email <span class="optional">(optional)</span>
              </label>
              <input
                id="submitter-email"
                type="email"
                name="submitterEmail"
                class="form-input"
                [(ngModel)]="form.submitterEmail"
                placeholder="e.g., name@example.com"
                [disabled]="isSubmitting()"
              />
            </div>
          </div>

          <!-- Additional Notes (Optional) -->
          <div class="form-group">
            <label for="notes" class="form-label">
              Notes or Author Info <span class="optional">(optional)</span>
            </label>
            <input
              id="notes"
              type="text"
              name="notes"
              class="form-input"
              [(ngModel)]="form.notes"
              placeholder="e.g., Christian praise hymn, artist/key info"
              [disabled]="isSubmitting()"
            />
          </div>

          <!-- Modal Actions Footer -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="onClose()"
              [disabled]="isSubmitting()"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-primary submit-btn"
              [disabled]="!isFormValid() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <div class="button-spinner"></div>
                <span>Sending Request...</span>
              } @else {
                <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>Send Song Request</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-dialog {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      max-width: 580px;
      width: 100%;
      box-shadow: var(--shadow-lg), var(--shadow-glow);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-subtitle {
      font-size: 13px;
      color: var(--text-muted);
    }

    .modal-subtitle strong {
      color: var(--accent-primary);
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

    .alert {
      margin: 16px 24px 0;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
    }

    .alert-success {
      background-color: var(--accent-success-light);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
    }

    .alert-error {
      background-color: var(--accent-danger-light);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .alert-icon svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .alert-content strong {
      display: block;
      margin-bottom: 2px;
    }

    .modal-form {
      padding: 20px 24px 24px;
      display: flex;
      flex-direction: column;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .hint-text {
      font-size: 11px;
      color: var(--text-muted);
    }

    .optional {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 400;
    }

    .lyrics-textarea {
      min-height: 140px;
      font-family: inherit;
      line-height: 1.45;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .submit-btn {
      padding: 10px 20px;
      font-weight: 600;
    }

    .btn-icon-svg {
      width: 15px;
      height: 15px;
    }

    .button-spinner {
      width: 15px;
      height: 15px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export class RequestSongModalComponent {
  private readonly requestService = inject(RequestSongService);

  @Output() close = new EventEmitter<void>();

  readonly recipientEmail = this.requestService.getRecipientEmail();
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  form: SongRequestPayload = {
    title: '',
    lyrics: '',
    submitterName: '',
    submitterEmail: '',
    notes: ''
  };

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(): void {
    if (!this.isSubmitting()) {
      this.onClose();
    }
  }

  isFormValid(): boolean {
    return Boolean(this.form.title?.trim() && this.form.lyrics?.trim());
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isSubmitting()) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const response = await this.requestService.submitSongRequest(this.form);
      this.successMessage.set(response.message);

      // Reset form after successful submission
      this.form = {
        title: '',
        lyrics: '',
        submitterName: '',
        submitterEmail: '',
        notes: ''
      };

      // Auto close dialog after 3 seconds on success
      setTimeout(() => {
        if (this.successMessage()) {
          this.onClose();
        }
      }, 3000);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Submission failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

