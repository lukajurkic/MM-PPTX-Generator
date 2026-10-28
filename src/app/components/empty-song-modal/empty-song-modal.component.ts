import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-empty-song-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="modal-backdrop fade-in"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-labelledby="empty-song-modal-title"
    >
      <div class="modal-dialog fade-in" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-titles">
            <div class="title-with-icon">
              <span class="header-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="14" x="3" y="5" rx="2"/>
                  <path d="M7 15h4"/>
                </svg>
              </span>
              <h2 id="empty-song-modal-title" class="modal-title">
                {{ t().emptySongModalTitle }}
              </h2>
            </div>
            <p class="modal-subtitle">
              {{ t().emptySongModalSubtitle }}
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            (click)="onClose()"
            [attr.aria-label]="t().closeBtn"
            [title]="t().closeBtn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form class="modal-form" (ngSubmit)="onSubmit()">
          <!-- Song Title -->
          <div class="form-group">
            <label for="empty-song-title-input" class="form-label">
              {{ t().emptySongNameLabel }}
            </label>
            <input
              id="empty-song-title-input"
              type="text"
              class="form-input"
              [(ngModel)]="songTitle"
              name="songTitle"
              [placeholder]="t().emptySongNamePlaceholder"
              required
              autofocus
            />
          </div>

          <!-- Slide Count -->
          <div class="form-group">
            <label for="empty-song-slides-input" class="form-label">
              {{ t().emptySongSlideCountLabel }}
            </label>
            <div class="stepper-row">
              <button
                type="button"
                class="stepper-btn"
                (click)="decrement()"
                [disabled]="slideCount <= 1"
                aria-label="Decrease slide count"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>

              <input
                id="empty-song-slides-input"
                type="number"
                class="form-input stepper-input"
                [(ngModel)]="slideCount"
                name="slideCount"
                min="1"
                max="50"
                required
              />

              <button
                type="button"
                class="stepper-btn"
                (click)="increment()"
                [disabled]="slideCount >= 50"
                aria-label="Increase slide count"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
            <span class="field-hint">
              {{ t().emptySongDesc }}
            </span>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary cancel-btn"
              (click)="onClose()"
            >
              {{ t().emptySongCancelBtn }}
            </button>
            <button
              type="submit"
              class="btn btn-primary submit-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>{{ t().emptySongConfirmBtn }}</span>
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
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 16px;
    }

    .modal-dialog {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      background-color: var(--bg-surface-elevated);
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon-box {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: rgba(7, 77, 151, 0.2);
      border: 1px solid rgba(7, 77, 151, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #93c5fd;
      flex-shrink: 0;
    }

    .header-icon-box svg {
      width: 20px;
      height: 20px;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 6px 0 0 0;
      line-height: 1.45;
    }

    .close-button {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease, background-color 0.15s ease;
      flex-shrink: 0;
    }

    .close-button:hover {
      color: var(--text-primary);
      background-color: var(--bg-surface);
    }

    .close-button svg {
      width: 20px;
      height: 20px;
    }

    .modal-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-input {
      background-color: var(--bg-app);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      width: 100%;
    }

    .form-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(7, 77, 151, 0.25);
    }

    .stepper-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stepper-btn {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background-color: var(--bg-surface-elevated);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .stepper-btn:hover:not(:disabled) {
      border-color: var(--accent-primary);
      background-color: rgba(7, 77, 151, 0.15);
      color: #93c5fd;
    }

    .stepper-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .stepper-btn svg {
      width: 18px;
      height: 18px;
    }

    .stepper-input {
      text-align: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .field-hint {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .submit-btn svg {
      width: 18px;
      height: 18px;
    }

    .cancel-btn {
      padding: 10px 16px;
      font-size: 0.9rem;
    }

    .fade-in {
      animation: fadeIn 0.15s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class EmptySongModalComponent {
  private readonly i18n = inject(TranslationService);
  readonly t = this.i18n.t;

  @Output() confirm = new EventEmitter<{ title: string; slideCount: number }>();
  @Output() close = new EventEmitter<void>();

  songTitle = 'Prazna pjesma';
  slideCount = 1;

  constructor() {
    this.songTitle = this.t().emptySongTitle;
  }

  @HostListener('window:keydown.escape')
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
  }

  increment(): void {
    if (this.slideCount < 50) {
      this.slideCount++;
    }
  }

  decrement(): void {
    if (this.slideCount > 1) {
      this.slideCount--;
    }
  }

  onSubmit(): void {
    const cleanTitle = this.songTitle.trim() || this.t().emptySongTitle;
    const count = Math.max(1, Math.min(50, Math.round(this.slideCount) || 1));
    this.confirm.emit({
      title: cleanTitle,
      slideCount: count
    });
  }
}
