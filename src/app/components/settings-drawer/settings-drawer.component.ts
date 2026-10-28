import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import {
  COLOR_PRESETS,
  PresentationSettings,
  SUPPORTED_FONTS
} from '../../constants/presentation-settings.constant';
import { SKAC_LOGO_BASE64 } from '../../constants/skac-logo.constant';

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="drawer-backdrop fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-drawer-title"
      (click)="onBackdropClick($event)"
    >
      <aside class="drawer-panel slide-in" (click)="$event.stopPropagation()">
        <!-- Drawer Header -->
        <header class="drawer-header">
          <div class="header-titles">
            <div class="header-title-row">
              <div class="header-icon-box" aria-hidden="true">
                <svg class="header-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h2 id="settings-drawer-title" class="drawer-title">{{ t().settingsTitle }}</h2>
            </div>
            <p class="drawer-subtitle">{{ t().settingsSubtitle }}</p>
          </div>
          <button
            type="button"
            class="close-btn"
            (click)="onClose()"
            [attr.aria-label]="t().closeSettingsBtn"
            [title]="t().closeSettingsBtn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- Drawer Body -->
        <div class="drawer-body custom-scrollbar">
          <!-- 1. Live Slide Preview Card -->
          <section class="settings-group preview-group">
            <span class="group-label">{{ t().previewSection }}</span>
            <div
              class="preview-stage"
              [class.aspect-4-3]="settings().aspectRatio === '4x3'"
              [style.background-color]="settings().backgroundColor"
            >
              <!-- Sample lyric text -->
              <div
                class="preview-lyrics"
                [style.font-family]="settings().fontFamily"
                [style.color]="settings().textColor"
                [style.font-weight]="settings().bold ? 'bold' : 'normal'"
                [style.font-style]="settings().italic ? 'italic' : 'normal'"
              >
                ISUS MOJ LJUBI ME
              </div>

              <!-- Rotated side title preview -->
              @if (settings().showSideTitle) {
                <div
                  class="preview-side-title"
                  [style.font-family]="settings().sideTitleFontFamily"
                  [style.right.px]="calculatePreviewSideOffset()"
                >
                  SLAVLJENJE
                </div>
              }

              <!-- Corner logo preview -->
              @if (settings().showLogo) {
                <img
                  class="preview-logo"
                  [src]="logoSrc"
                  alt="SKAC Preview"
                  [style.opacity]="(100 - settings().logoTransparency) / 100"
                  [style.transform]="'scale(' + settings().logoScalePercent / 100 + ')'"
                />
              }
            </div>
          </section>

          <!-- 2. Aspect Ratio Section -->
          <section class="settings-group">
            <h3 class="group-title">{{ t().aspectRatioSection }}</h3>
            <div class="aspect-ratio-grid">
              <button
                type="button"
                class="aspect-btn"
                [class.active]="settings().aspectRatio === '16x9'"
                (click)="onSetAspectRatio('16x9')"
              >
                <div class="aspect-icon-box aspect-16-9-box"></div>
                <div class="aspect-details">
                  <span class="aspect-name">{{ t().aspectRatio169Label }}</span>
                  <span class="aspect-dim">10" × 5.625" (Widescreen)</span>
                </div>
              </button>

              <button
                type="button"
                class="aspect-btn"
                [class.active]="settings().aspectRatio === '4x3'"
                (click)="onSetAspectRatio('4x3')"
              >
                <div class="aspect-icon-box aspect-4-3-box"></div>
                <div class="aspect-details">
                  <span class="aspect-name">{{ t().aspectRatio43Label }}</span>
                  <span class="aspect-dim">10" × 7.5" (Standard)</span>
                </div>
              </button>
            </div>
          </section>

          <!-- 3. Slide Transitions Section -->
          <section class="settings-group">
            <h3 class="group-title">{{ t().blankSlidesSection }}</h3>
            <div class="toggle-list">
              <label class="toggle-row">
                <span class="toggle-text">{{ t().blankSlideBetweenSongsLabel }}</span>
                <input
                  type="checkbox"
                  class="custom-switch"
                  [checked]="settings().blankSlideBetweenSongs"
                  (change)="onToggleBlankBetween($event)"
                />
              </label>

              <label class="toggle-row">
                <span class="toggle-text">{{ t().blankSlideStartEndLabel }}</span>
                <input
                  type="checkbox"
                  class="custom-switch"
                  [checked]="settings().blankSlideStartEnd"
                  (change)="onToggleBlankStartEnd($event)"
                />
              </label>
            </div>
          </section>

          <!-- 4. Typography & Colors Section -->
          <section class="settings-group">
            <h3 class="group-title">{{ t().typographySection }}</h3>

            <!-- Font Family -->
            <div class="control-row">
              <label for="font-family-select" class="control-label">{{ t().fontFamilyLabel }}</label>
              <select
                id="font-family-select"
                class="form-select"
                [ngModel]="settings().fontFamily"
                (ngModelChange)="onSetFontFamily($event)"
              >
                @for (font of supportedFonts; track font) {
                  <option [value]="font" [style.font-family]="font">{{ font }}</option>
                }
              </select>
            </div>

            <!-- Text Formatting (Bold / Italic) -->
            <div class="control-block">
              <label class="control-label">{{ t().textStyleLabel }}</label>
              <div class="style-toggle-group">
                <button
                  type="button"
                  class="style-toggle-btn"
                  [class.active]="settings().bold"
                  (click)="onToggleBold()"
                  [attr.aria-pressed]="settings().bold"
                  [title]="t().boldTooltip"
                >
                  <span class="btn-letter bold-letter" aria-hidden="true">B</span>
                  <span>{{ t().boldLabel }}</span>
                </button>

                <button
                  type="button"
                  class="style-toggle-btn"
                  [class.active]="settings().italic"
                  (click)="onToggleItalic()"
                  [attr.aria-pressed]="settings().italic"
                  [title]="t().italicTooltip"
                >
                  <span class="btn-letter italic-letter" aria-hidden="true">I</span>
                  <span>{{ t().italicLabel }}</span>
                </button>
              </div>
            </div>

            <!-- Font Size & Auto-fit -->
            <div class="control-block">
              <div class="control-label-row">
                <label for="font-size-slider" class="control-label">{{ t().fontSizeLabel }}</label>
                <span class="control-value-badge">
                  {{ settings().autoFontSize ? t().autoFontSizeLabel : settings().fontSizeOverride + ' pt' }}
                </span>
              </div>

              <div class="auto-toggle-row">
                <label class="inline-checkbox-label">
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    [checked]="settings().autoFontSize"
                    (change)="onToggleAutoFontSize($event)"
                  />
                  <span>{{ t().autoFontSizeLabel }}</span>
                </label>
              </div>

              @if (!settings().autoFontSize) {
                <div class="slider-wrapper">
                  <input
                    id="font-size-slider"
                    type="range"
                    min="32"
                    max="48"
                    step="1"
                    class="form-slider"
                    [ngModel]="settings().fontSizeOverride"
                    (ngModelChange)="onSetFontSize($event)"
                  />
                  <div class="slider-ticks">
                    <span>32pt</span>
                    <span>40pt</span>
                    <span>48pt</span>
                  </div>
                </div>
              }
            </div>

            <!-- Background Color -->
            <div class="control-block">
              <div class="control-label-row">
                <label for="bg-color-input" class="control-label">{{ t().backgroundColorLabel }}</label>
                <span class="color-hex-tag">{{ settings().backgroundColor }}</span>
              </div>
              <div class="color-picker-row">
                <input
                  id="bg-color-input"
                  type="color"
                  class="native-color-picker"
                  [ngModel]="settings().backgroundColor"
                  (ngModelChange)="onSetBackgroundColor($event)"
                />
                <div class="swatches-row">
                  @for (preset of colorPresets.background; track preset.hex) {
                    <button
                      type="button"
                      class="color-swatch-btn"
                      [style.background-color]="preset.hex"
                      [class.active]="settings().backgroundColor.toLowerCase() === preset.hex.toLowerCase()"
                      [title]="preset.label"
                      (click)="onSetBackgroundColor(preset.hex)"
                    ></button>
                  }
                </div>
              </div>
            </div>

            <!-- Text Color -->
            <div class="control-block">
              <div class="control-label-row">
                <label for="text-color-input" class="control-label">{{ t().textColorLabel }}</label>
                <span class="color-hex-tag">{{ settings().textColor }}</span>
              </div>
              <div class="color-picker-row">
                <input
                  id="text-color-input"
                  type="color"
                  class="native-color-picker"
                  [ngModel]="settings().textColor"
                  (ngModelChange)="onSetTextColor($event)"
                />
                <div class="swatches-row">
                  @for (preset of colorPresets.text; track preset.hex) {
                    <button
                      type="button"
                      class="color-swatch-btn"
                      [style.background-color]="preset.hex"
                      [class.active]="settings().textColor.toLowerCase() === preset.hex.toLowerCase()"
                      [title]="preset.label"
                      (click)="onSetTextColor(preset.hex)"
                    ></button>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- 5. Side Title Section -->
          <section class="settings-group">
            <div class="group-header-toggle">
              <h3 class="group-title">{{ t().sideTitleSection }}</h3>
              <input
                type="checkbox"
                class="custom-switch"
                [checked]="settings().showSideTitle"
                (change)="onToggleSideTitle($event)"
              />
            </div>

            @if (settings().showSideTitle) {
              <div class="sub-controls fade-in">
                <!-- Side title font -->
                <div class="control-row">
                  <label for="side-font-select" class="control-label">{{ t().sideTitleFontLabel }}</label>
                  <select
                    id="side-font-select"
                    class="form-select"
                    [ngModel]="settings().sideTitleFontFamily"
                    (ngModelChange)="onSetSideTitleFont($event)"
                  >
                    @for (font of supportedFonts; track font) {
                      <option [value]="font" [style.font-family]="font">{{ font }}</option>
                    }
                  </select>
                </div>

                <!-- Side title font size -->
                <div class="control-block">
                  <div class="control-label-row">
                    <label for="side-size-slider" class="control-label">{{ t().sideTitleSizeLabel }}</label>
                    <span class="control-value-badge">{{ settings().sideTitleFontSize }} pt</span>
                  </div>
                  <input
                    id="side-size-slider"
                    type="range"
                    min="8"
                    max="18"
                    step="1"
                    class="form-slider"
                    [ngModel]="settings().sideTitleFontSize"
                    (ngModelChange)="onSetSideTitleFontSize($event)"
                  />
                  <div class="slider-ticks">
                    <span>8pt</span>
                    <span>11pt</span>
                    <span>18pt</span>
                  </div>
                </div>

                <!-- Side title horizontal offset -->
                <div class="control-block">
                  <div class="control-label-row">
                    <label for="side-offset-slider" class="control-label">{{ t().sideTitleOffsetLabel }}</label>
                    <span class="control-value-badge">{{ settings().sideTitleHorizontalOffsetCm.toFixed(1) }} cm</span>
                  </div>
                  <input
                    id="side-offset-slider"
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.1"
                    class="form-slider"
                    [ngModel]="settings().sideTitleHorizontalOffsetCm"
                    (ngModelChange)="onSetSideTitleOffset($event)"
                  />
                  <div class="slider-ticks">
                    <span>0 cm (Rub)</span>
                    <span>1.5 cm</span>
                    <span>3.0 cm</span>
                  </div>
                </div>
              </div>
            }
          </section>

          <!-- 6. Corner Logo Section -->
          <section class="settings-group">
            <div class="group-header-toggle">
              <h3 class="group-title">{{ t().logoSection }}</h3>
              <input
                type="checkbox"
                class="custom-switch"
                [checked]="settings().showLogo"
                (change)="onToggleLogo($event)"
              />
            </div>

            @if (settings().showLogo) {
              <div class="sub-controls fade-in">
                <!-- Logo scale slider -->
                <div class="control-block">
                  <div class="control-label-row">
                    <label for="logo-scale-slider" class="control-label">{{ t().logoSizeLabel }}</label>
                    <span class="control-value-badge">{{ settings().logoScalePercent }}%</span>
                  </div>
                  <input
                    id="logo-scale-slider"
                    type="range"
                    min="50"
                    max="180"
                    step="5"
                    class="form-slider"
                    [ngModel]="settings().logoScalePercent"
                    (ngModelChange)="onSetLogoScale($event)"
                  />
                  <div class="slider-ticks">
                    <span>50%</span>
                    <span>100% (Zadano)</span>
                    <span>180%</span>
                  </div>
                </div>

                <!-- Logo transparency slider -->
                <div class="control-block">
                  <div class="control-label-row">
                    <label for="logo-transparency-slider" class="control-label">{{ t().logoTransparencyLabel }}</label>
                    <span class="control-value-badge">{{ settings().logoTransparency }}%</span>
                  </div>
                  <input
                    id="logo-transparency-slider"
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    class="form-slider"
                    [ngModel]="settings().logoTransparency"
                    (ngModelChange)="onSetLogoTransparency($event)"
                  />
                  <div class="slider-ticks">
                    <span>0% (Puno)</span>
                    <span>35% (Zadano)</span>
                    <span>90% (Blago)</span>
                  </div>
                </div>
              </div>
            }
          </section>
        </div>

        <!-- Drawer Footer -->
        <footer class="drawer-footer">
          <button
            type="button"
            class="btn btn-secondary reset-btn"
            (click)="onResetToDefaults()"
            [title]="t().resetSettingsBtn"
          >
            <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            <span>{{ t().resetSettingsBtn }}</span>
          </button>

          <button
            type="button"
            class="btn btn-primary close-footer-btn"
            (click)="onClose()"
          >
            {{ t().closeSettingsBtn }}
          </button>
        </footer>
      </aside>
    </div>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(2, 6, 23, 0.72);
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
      z-index: 120;
      display: flex;
      justify-content: flex-end;
    }

    .drawer-panel {
      background-color: var(--bg-surface);
      border-left: 1px solid var(--border-default);
      width: 100%;
      max-width: 500px;
      height: 100vh;
      box-shadow: var(--shadow-lg), -10px 0 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    /* Header */
    .drawer-header {
      padding: 20px 24px;
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
      gap: 4px;
      min-width: 0;
    }

    .header-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon-box {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      background: rgba(7, 77, 151, 0.2);
      border: 1px solid rgba(7, 77, 151, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #93c5fd;
      flex-shrink: 0;
    }

    .header-svg {
      width: 18px;
      height: 18px;
    }

    .drawer-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .drawer-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    .close-btn {
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
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }

    .close-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Body */
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .settings-group {
      background-color: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .group-title {
      font-size: 0.88rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin: 0;
    }

    .group-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .group-header-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Live Preview Stage */
    .preview-stage {
      position: relative;
      width: 100%;
      height: 140px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 28px;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .preview-stage.aspect-4-3 {
      height: 170px;
    }

    .preview-lyrics {
      font-size: 1rem;
      font-weight: 700;
      text-align: center;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      z-index: 2;
      user-select: none;
    }

    .preview-side-title {
      position: absolute;
      top: 50%;
      transform: translateY(-50%) rotate(-90deg);
      transform-origin: center center;
      font-size: 7px;
      font-weight: 500;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      pointer-events: none;
      z-index: 2;
    }

    .preview-logo {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 20px;
      height: 21px;
      pointer-events: none;
      z-index: 2;
      transform-origin: bottom right;
    }

    /* Aspect Ratio Grid */
    .aspect-ratio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .aspect-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--text-secondary);
      text-align: center;
    }

    .aspect-btn:hover {
      border-color: var(--border-default);
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
    }

    .aspect-btn.active {
      background: rgba(7, 77, 151, 0.18);
      border-color: var(--accent-primary);
      color: #bfdbfe;
      box-shadow: 0 0 12px rgba(7, 77, 151, 0.3);
    }

    .aspect-icon-box {
      border: 2px solid currentColor;
      border-radius: 3px;
      opacity: 0.8;
    }

    .aspect-16-9-box {
      width: 44px;
      height: 25px;
    }

    .aspect-4-3-box {
      width: 36px;
      height: 27px;
    }

    .aspect-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .aspect-name {
      font-size: 0.85rem;
      font-weight: 600;
    }

    .aspect-dim {
      font-size: 0.7rem;
      opacity: 0.65;
    }

    /* Toggle switches */
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-text {
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .custom-switch {
      width: 38px;
      height: 22px;
      appearance: none;
      background-color: var(--bg-surface-elevated);
      border: 1px solid var(--border-default);
      border-radius: 9999px;
      position: relative;
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .custom-switch::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #94a3b8;
      top: 2px;
      left: 2px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .custom-switch:checked {
      background-color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .custom-switch:checked::before {
      transform: translateX(16px);
      background-color: #ffffff;
    }

    /* Controls & Sliders */
    .control-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .control-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .control-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .control-value-badge {
      font-size: 0.75rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 600;
      color: #93c5fd;
      background: rgba(7, 77, 151, 0.15);
      border: 1px solid rgba(7, 77, 151, 0.3);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .form-select {
      width: 100%;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 0.88rem;
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .form-select:focus {
      border-color: var(--accent-primary);
    }

    /* Style Toggle Group (Bold & Italic) */
    .style-toggle-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .style-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .style-toggle-btn:hover {
      border-color: var(--border-default);
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
    }

    .style-toggle-btn.active {
      background: rgba(7, 77, 151, 0.2);
      border-color: var(--accent-primary);
      color: #bfdbfe;
      box-shadow: 0 0 10px rgba(7, 77, 151, 0.25);
    }

    .btn-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      font-size: 13px;
      line-height: 1;
      flex-shrink: 0;
    }

    .style-toggle-btn.active .btn-letter {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: #ffffff;
    }

    .bold-letter {
      font-weight: 800;
    }

    .italic-letter {
      font-weight: 600;
      font-style: italic;
      font-family: Georgia, serif;
    }

    .auto-toggle-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .inline-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .custom-checkbox {
      width: 16px;
      height: 16px;
      accent-color: var(--accent-primary);
      cursor: pointer;
    }

    .slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-slider {
      width: 100%;
      accent-color: var(--accent-primary);
      height: 6px;
      border-radius: 9999px;
      background: var(--bg-surface-elevated);
      outline: none;
      cursor: pointer;
    }

    .slider-ticks {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    /* Color picker & Swatches */
    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .native-color-picker {
      width: 38px;
      height: 38px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      padding: 2px;
      background: var(--bg-surface);
      cursor: pointer;
      flex-shrink: 0;
    }

    .color-hex-tag {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .swatches-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .color-swatch-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }

    .color-swatch-btn:hover {
      transform: scale(1.15);
    }

    .color-swatch-btn.active {
      border-color: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
      transform: scale(1.1);
    }

    /* Sub controls */
    .sub-controls {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-top: 6px;
      border-top: 1px dashed var(--border-subtle);
    }

    /* Footer */
    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn-svg {
      width: 15px;
      height: 15px;
    }

    .reset-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      padding: 8px 14px;
    }

    .close-footer-btn {
      min-width: 110px;
    }
  `]
})
export class SettingsDrawerComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly i18n = inject(TranslationService);

  @Output() close = new EventEmitter<void>();

  readonly settings = this.settingsService.settings;
  readonly t = this.i18n.t;
  readonly supportedFonts = SUPPORTED_FONTS;
  readonly colorPresets = COLOR_PRESETS;
  readonly logoSrc = SKAC_LOGO_BASE64;

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

  onSetAspectRatio(ratio: '16x9' | '4x3'): void {
    this.settingsService.updateSettings({ aspectRatio: ratio });
  }

  onToggleBlankBetween(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateSettings({ blankSlideBetweenSongs: input.checked });
  }

  onToggleBlankStartEnd(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateSettings({ blankSlideStartEnd: input.checked });
  }

  onSetFontFamily(font: string): void {
    this.settingsService.updateSettings({ fontFamily: font });
  }

  onToggleBold(): void {
    this.settingsService.updateSettings({ bold: !this.settings().bold });
  }

  onToggleItalic(): void {
    this.settingsService.updateSettings({ italic: !this.settings().italic });
  }

  onToggleAutoFontSize(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateSettings({ autoFontSize: input.checked });
  }

  onSetFontSize(size: number): void {
    this.settingsService.updateSettings({ fontSizeOverride: Number(size) });
  }

  onSetBackgroundColor(color: string): void {
    this.settingsService.updateSettings({ backgroundColor: color });
  }

  onSetTextColor(color: string): void {
    this.settingsService.updateSettings({ textColor: color });
  }

  onToggleSideTitle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateSettings({ showSideTitle: input.checked });
  }

  onSetSideTitleFont(font: string): void {
    this.settingsService.updateSettings({ sideTitleFontFamily: font });
  }

  onSetSideTitleFontSize(size: number): void {
    this.settingsService.updateSettings({ sideTitleFontSize: Number(size) });
  }

  onSetSideTitleOffset(offset: number): void {
    this.settingsService.updateSettings({ sideTitleHorizontalOffsetCm: Number(offset) });
  }

  onToggleLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsService.updateSettings({ showLogo: input.checked });
  }

  onSetLogoScale(scale: number): void {
    this.settingsService.updateSettings({ logoScalePercent: Number(scale) });
  }

  onSetLogoTransparency(transparency: number): void {
    this.settingsService.updateSettings({ logoTransparency: Number(transparency) });
  }

  onResetToDefaults(): void {
    this.settingsService.resetToDefaults();
  }

  calculatePreviewSideOffset(): number {
    // 0 cm = 8px offset, 3 cm = 32px offset
    const cm = this.settings().sideTitleHorizontalOffsetCm || 0;
    return Math.round(8 + cm * 8);
  }
}
