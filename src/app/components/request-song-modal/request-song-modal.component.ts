import { Component, EventEmitter, HostListener, OnDestroy, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestSongService } from '../../services/request-song.service';
import { TranslationService } from '../../services/translation.service';
import { SongRequestPayload } from '../../models/song-request.model';
import { PRESET_CATEGORIES, PRESET_MASS_SECTIONS } from '../../constants/song-metadata.constants';

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
            <h2 id="modal-title" class="modal-title">{{ t().modalTitle }}</h2>
            <p class="modal-subtitle">
              {{ t().modalSubtitle(recipientEmail) }} <strong>{{ recipientEmail }}</strong>.
            </p>
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

        <!-- Success Alert Message -->
        @if (successMessage()) {
          <div class="alert alert-success fade-in" role="alert">
            <div class="alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div class="alert-content">
              <strong>{{ t().requestSentAlertTitle }}</strong>
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
              <strong>{{ t().requestFailedAlertTitle }}</strong>
              <p>{{ errorMessage() }}</p>
            </div>
          </div>
        }

        <!-- Modal Form -->
        <form class="modal-form" (ngSubmit)="onSubmit()">
          <!-- Song Title (Required) -->
          <div class="form-group">
            <label for="song-title" class="form-label">
              {{ t().fieldSongTitle }} <span class="required" title="Required">*</span>
            </label>
            <input
              id="song-title"
              type="text"
              name="title"
              class="form-input"
              [(ngModel)]="form.title"
              [placeholder]="t().fieldSongTitlePlaceholder"
              required
              [disabled]="isSubmitting()"
            />
          </div>

          <!-- Metadata: Category & Mass Section (Multi-select dropdown & custom entry) -->
          <div class="form-row">
            <!-- Category Group -->
            <div class="form-group custom-select-group">
              <label class="form-label">
                {{ t().fieldCategory }} <span class="optional">{{ t().optionalMark }}</span>
              </label>

              <!-- Selected Categories Chips Above -->
              @if (selectedCategories().length > 0) {
                <div class="selected-chips-container" role="list" aria-label="Selected categories">
                  @for (cat of selectedCategories(); track cat) {
                    <span class="selected-chip" role="listitem">
                      <span class="chip-text">{{ cat }}</span>
                      <button
                        type="button"
                        class="chip-remove-btn"
                        (click)="removeCategory(cat)"
                        [disabled]="isSubmitting()"
                        [attr.aria-label]="'Remove ' + cat"
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </span>
                  }
                </div>
              }

              <!-- Multi-select Dropdown -->
              <div class="dropdown-wrapper">
                <button
                  type="button"
                  class="dropdown-trigger"
                  [class.active]="isCategoryDropdownOpen()"
                  (click)="toggleCategoryDropdown($event)"
                  [disabled]="isSubmitting()"
                  aria-haspopup="listbox"
                  [attr.aria-expanded]="isCategoryDropdownOpen()"
                >
                  <span class="dropdown-trigger-text">
                    {{ selectedCategories().length > 0 ? (selectedCategories().length + ' ' + t().selectedCountLabel) : t().selectCategoriesPlaceholder }}
                  </span>
                  <svg class="chevron-svg" [class.rotated]="isCategoryDropdownOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                @if (isCategoryDropdownOpen()) {
                  <div class="dropdown-menu fade-in" (click)="$event.stopPropagation()" role="listbox">
                    <div class="dropdown-options-list">
                      @for (cat of availableCategories(); track cat) {
                        <button
                          type="button"
                          class="dropdown-option-item"
                          [class.selected]="isCategorySelected(cat)"
                          (click)="toggleCategory(cat)"
                          role="option"
                          [attr.aria-selected]="isCategorySelected(cat)"
                        >
                          <span class="custom-checkbox" [class.checked]="isCategorySelected(cat)">
                            @if (isCategorySelected(cat)) {
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                            }
                          </span>
                          <span class="option-text">{{ cat }}</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Custom Entry Field Underneath -->
              <div class="custom-input-row">
                <input
                  type="text"
                  class="form-input custom-entry-input"
                  [(ngModel)]="customCategoryInput"
                  [ngModelOptions]="{standalone: true}"
                  [placeholder]="t().fieldCategoryCustomPlaceholder"
                  (keydown.enter)="$event.preventDefault(); addCustomCategory()"
                  [disabled]="isSubmitting()"
                />
                <button
                  type="button"
                  class="btn-add-custom"
                  (click)="addCustomCategory()"
                  [disabled]="isSubmitting() || !customCategoryInput.trim()"
                  [title]="t().addBtn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span>{{ t().addBtn }}</span>
                </button>
              </div>

              <span class="hint-subtext">{{ t().fieldCategoryHint }}</span>
            </div>

            <!-- Mass Section Group -->
            <div class="form-group custom-select-group">
              <label class="form-label">
                {{ t().fieldMassSection }} <span class="optional">{{ t().optionalMark }}</span>
              </label>

              <!-- Selected Mass Sections Chips Above -->
              @if (selectedMassSections().length > 0) {
                <div class="selected-chips-container" role="list" aria-label="Selected mass sections">
                  @for (sec of selectedMassSections(); track sec) {
                    <span class="selected-chip" role="listitem">
                      <span class="chip-text">{{ sec }}</span>
                      <button
                        type="button"
                        class="chip-remove-btn"
                        (click)="removeMassSection(sec)"
                        [disabled]="isSubmitting()"
                        [attr.aria-label]="'Remove ' + sec"
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </span>
                  }
                </div>
              }

              <!-- Multi-select Dropdown -->
              <div class="dropdown-wrapper">
                <button
                  type="button"
                  class="dropdown-trigger"
                  [class.active]="isMassSectionDropdownOpen()"
                  (click)="toggleMassSectionDropdown($event)"
                  [disabled]="isSubmitting()"
                  aria-haspopup="listbox"
                  [attr.aria-expanded]="isMassSectionDropdownOpen()"
                >
                  <span class="dropdown-trigger-text">
                    {{ selectedMassSections().length > 0 ? (selectedMassSections().length + ' ' + t().selectedCountLabel) : t().selectMassSectionsPlaceholder }}
                  </span>
                  <svg class="chevron-svg" [class.rotated]="isMassSectionDropdownOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                @if (isMassSectionDropdownOpen()) {
                  <div class="dropdown-menu fade-in" (click)="$event.stopPropagation()" role="listbox">
                    <div class="dropdown-options-list">
                      @for (sec of availableMassSections(); track sec) {
                        <button
                          type="button"
                          class="dropdown-option-item"
                          [class.selected]="isMassSectionSelected(sec)"
                          (click)="toggleMassSection(sec)"
                          role="option"
                          [attr.aria-selected]="isMassSectionSelected(sec)"
                        >
                          <span class="custom-checkbox" [class.checked]="isMassSectionSelected(sec)">
                            @if (isMassSectionSelected(sec)) {
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                            }
                          </span>
                          <span class="option-text">{{ sec }}</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Custom Entry Field Underneath -->
              <div class="custom-input-row">
                <input
                  type="text"
                  class="form-input custom-entry-input"
                  [(ngModel)]="customMassSectionInput"
                  [ngModelOptions]="{standalone: true}"
                  [placeholder]="t().fieldMassSectionCustomPlaceholder"
                  (keydown.enter)="$event.preventDefault(); addCustomMassSection()"
                  [disabled]="isSubmitting()"
                />
                <button
                  type="button"
                  class="btn-add-custom"
                  (click)="addCustomMassSection()"
                  [disabled]="isSubmitting() || !customMassSectionInput.trim()"
                  [title]="t().addBtn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span>{{ t().addBtn }}</span>
                </button>
              </div>

              <span class="hint-subtext">{{ t().fieldMassSectionHint }}</span>
            </div>
          </div>

          <!-- Lyrics (Required, Multiline) -->
          <div class="form-group">
            <div class="label-row">
              <label for="song-lyrics" class="form-label">
                {{ t().fieldLyrics }} <span class="required" title="Required">*</span>
              </label>
              <span class="hint-text">{{ t().fieldLyricsHint }}</span>
            </div>
            <textarea
              id="song-lyrics"
              name="lyrics"
              class="form-textarea lyrics-textarea"
              [(ngModel)]="form.lyrics"
              [placeholder]="t().fieldLyricsPlaceholder"
              rows="6"
              required
              [disabled]="isSubmitting()"
            ></textarea>
          </div>

          <!-- Submitter Name & Email (Optional) -->
          <div class="form-row">
            <div class="form-group">
              <label for="submitter-name" class="form-label">
                {{ t().fieldSubmitterName }} <span class="optional">{{ t().optionalMark }}</span>
              </label>
              <input
                id="submitter-name"
                type="text"
                name="submitterName"
                class="form-input"
                [(ngModel)]="form.submitterName"
                [placeholder]="t().fieldSubmitterNamePlaceholder"
                [disabled]="isSubmitting()"
              />
            </div>

            <div class="form-group">
              <label for="submitter-email" class="form-label">
                {{ t().fieldSubmitterEmail }} <span class="optional">{{ t().optionalMark }}</span>
              </label>
              <input
                id="submitter-email"
                type="email"
                name="submitterEmail"
                class="form-input"
                [(ngModel)]="form.submitterEmail"
                [placeholder]="t().fieldSubmitterEmailPlaceholder"
                [disabled]="isSubmitting()"
              />
            </div>
          </div>

          <!-- Additional Notes (Optional) -->
          <div class="form-group">
            <label for="notes" class="form-label">
              {{ t().fieldNotes }} <span class="optional">{{ t().optionalMark }}</span>
            </label>
            <input
              id="notes"
              type="text"
              name="notes"
              class="form-input"
              [(ngModel)]="form.notes"
              [placeholder]="t().fieldNotesPlaceholder"
              [disabled]="isSubmitting()"
            />
          </div>

          <!-- GitHub Issue Shortcut Option (Feature 13) -->
          <div class="github-issue-shortcut">
            <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span class="github-hint-text">{{ t().submitViaGitHubHint }}</span>
            <a
              href="https://github.com/lukajurkic/MM-PPTX-Generator/issues/new?template=song_request.yml"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
            >
              <span>{{ t().submitViaGitHubLink }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
            </a>
          </div>

          <!-- Modal Actions Footer -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="onClose()"
              [disabled]="isSubmitting()"
            >
              {{ t().cancelBtn }}
            </button>

            <button
              type="submit"
              class="btn btn-primary submit-btn"
              [disabled]="!isFormValid() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <div class="button-spinner"></div>
                <span>{{ t().sendingRequestBtn }}</span>
              } @else {
                <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>{{ t().sendRequestBtn }}</span>
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

    .hint-subtext {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .github-issue-shortcut {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      margin-top: 4px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-sm);
      font-size: 12px;
      flex-wrap: wrap;
    }

    .github-icon {
      width: 15px;
      height: 15px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .github-hint-text {
      color: var(--text-muted);
    }

    .github-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #93c5fd;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .github-link:hover {
      color: #bfdbfe;
      text-decoration: underline;
    }

    .github-link svg {
      width: 11px;
      height: 11px;
    }

    .custom-select-group {
      position: relative;
    }

    .selected-chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .selected-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      background: rgba(7, 77, 151, 0.25);
      border: 1px solid rgba(7, 77, 151, 0.5);
      border-radius: var(--radius-sm);
      font-size: 11px;
      color: #93c5fd;
      font-weight: 500;
      animation: fadeIn 0.15s ease-out;
    }

    .chip-remove-btn {
      background: transparent;
      border: none;
      color: #93c5fd;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      width: 14px;
      height: 14px;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.15s ease;
    }

    .chip-remove-btn:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .chip-remove-btn svg {
      width: 10px;
      height: 10px;
    }

    .dropdown-wrapper {
      position: relative;
      width: 100%;
    }

    .dropdown-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .dropdown-trigger:hover:not(:disabled) {
      border-color: var(--accent-primary);
    }

    .dropdown-trigger.active {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(7, 77, 151, 0.25);
    }

    .dropdown-trigger-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    .chevron-svg {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      transition: transform 0.2s ease;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .chevron-svg.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 50;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lg);
      max-height: 180px;
      overflow-y: auto;
      padding: 4px;
    }

    .dropdown-options-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .dropdown-option-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.1s ease;
    }

    .dropdown-option-item:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .dropdown-option-item.selected {
      color: #60a5fa;
      font-weight: 500;
    }

    .custom-checkbox {
      width: 15px;
      height: 15px;
      border: 1px solid var(--border-default);
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--bg-input);
      color: transparent;
    }

    .custom-checkbox.checked {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: #ffffff;
    }

    .custom-checkbox svg {
      width: 10px;
      height: 10px;
    }

    .custom-input-row {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      align-items: center;
    }

    .custom-entry-input {
      flex: 1;
      padding: 7px 10px;
      font-size: 12px;
      min-width: 0;
    }

    .btn-add-custom {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 7px 10px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }

    .btn-add-custom:hover:not(:disabled) {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: #ffffff;
    }

    .btn-add-custom:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-add-custom svg {
      width: 12px;
      height: 12px;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export class RequestSongModalComponent implements OnDestroy {
  private readonly requestService = inject(RequestSongService);
  readonly i18n = inject(TranslationService);

  @Output() close = new EventEmitter<void>();

  readonly t = this.i18n.t;
  readonly recipientEmail = this.requestService.getRecipientEmail();
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly presetCategories = PRESET_CATEGORIES;
  readonly presetMassSections = PRESET_MASS_SECTIONS;

  readonly selectedCategories = signal<string[]>([]);
  readonly selectedMassSections = signal<string[]>([]);
  readonly availableCategories = signal<string[]>([...this.presetCategories]);
  readonly availableMassSections = signal<string[]>([...this.presetMassSections]);

  customCategoryInput = '';
  customMassSectionInput = '';

  readonly isCategoryDropdownOpen = signal<boolean>(false);
  readonly isMassSectionDropdownOpen = signal<boolean>(false);

  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  form: SongRequestPayload = {
    title: '',
    category: '',
    categories: [],
    massSection: '',
    massSections: [],
    lyrics: '',
    submitterName: '',
    submitterEmail: '',
    notes: ''
  };

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.isCategoryDropdownOpen() || this.isMassSectionDropdownOpen()) {
      this.isCategoryDropdownOpen.set(false);
      this.isMassSectionDropdownOpen.set(false);
      return;
    }
    if (!this.isSubmitting()) {
      this.onClose();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.dropdown-wrapper')) {
      this.isCategoryDropdownOpen.set(false);
      this.isMassSectionDropdownOpen.set(false);
    }
  }

  toggleCategoryDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCategoryDropdownOpen.update(v => !v);
    if (this.isCategoryDropdownOpen()) {
      this.isMassSectionDropdownOpen.set(false);
    }
  }

  toggleMassSectionDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isMassSectionDropdownOpen.update(v => !v);
    if (this.isMassSectionDropdownOpen()) {
      this.isCategoryDropdownOpen.set(false);
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  toggleCategory(category: string): void {
    if (this.isCategorySelected(category)) {
      this.removeCategory(category);
    } else {
      this.selectedCategories.update(list => [...list, category]);
    }
  }

  removeCategory(category: string): void {
    this.selectedCategories.update(list => list.filter(c => c !== category));
  }

  addCustomCategory(): void {
    const raw = this.customCategoryInput.trim();
    if (!raw) return;

    const items = raw.includes(',')
      ? raw.split(',').map(s => s.trim()).filter(Boolean)
      : [raw];

    for (const item of items) {
      if (!this.selectedCategories().includes(item)) {
        this.selectedCategories.update(list => [...list, item]);
      }
      if (!this.availableCategories().includes(item)) {
        this.availableCategories.update(list => [...list, item]);
      }
    }

    this.customCategoryInput = '';
  }

  isMassSectionSelected(section: string): boolean {
    return this.selectedMassSections().includes(section);
  }

  toggleMassSection(section: string): void {
    if (this.isMassSectionSelected(section)) {
      this.removeMassSection(section);
    } else {
      this.selectedMassSections.update(list => [...list, section]);
    }
  }

  removeMassSection(section: string): void {
    this.selectedMassSections.update(list => list.filter(s => s !== section));
  }

  addCustomMassSection(): void {
    const raw = this.customMassSectionInput.trim();
    if (!raw) return;

    const items = raw.includes(',')
      ? raw.split(',').map(s => s.trim()).filter(Boolean)
      : [raw];

    for (const item of items) {
      if (!this.selectedMassSections().includes(item)) {
        this.selectedMassSections.update(list => [...list, item]);
      }
      if (!this.availableMassSections().includes(item)) {
        this.availableMassSections.update(list => [...list, item]);
      }
    }

    this.customMassSectionInput = '';
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
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const categories = this.selectedCategories().length > 0
      ? this.selectedCategories()
      : (this.form.category ? this.form.category.split(',').map(s => s.trim()).filter(Boolean) : []);

    const massSections = this.selectedMassSections().length > 0
      ? this.selectedMassSections()
      : (this.form.massSection ? this.form.massSection.split(',').map(s => s.trim()).filter(Boolean) : []);

    const payload: SongRequestPayload = {
      ...this.form,
      categories,
      massSections,
      category: categories.join(', '),
      massSection: massSections.join(', ')
    };

    try {
      const response = await this.requestService.submitSongRequest(payload);
      this.successMessage.set(response.message);

      // Reset form after successful submission
      this.form = {
        title: '',
        category: '',
        categories: [],
        massSection: '',
        massSections: [],
        lyrics: '',
        submitterName: '',
        submitterEmail: '',
        notes: ''
      };
      this.selectedCategories.set([]);
      this.selectedMassSections.set([]);
      this.customCategoryInput = '';
      this.customMassSectionInput = '';
      this.isCategoryDropdownOpen.set(false);
      this.isMassSectionDropdownOpen.set(false);

      // Auto close dialog after 3 seconds on success
      this.autoCloseTimer = setTimeout(() => {
        if (this.successMessage()) {
          this.onClose();
        }
      }, 3000);
    } catch (err: any) {
      this.errorMessage.set(err.message || this.t().requestFailedAlertTitle);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

