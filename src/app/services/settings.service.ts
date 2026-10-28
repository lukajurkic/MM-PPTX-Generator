import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_PRESENTATION_SETTINGS,
  PresentationSettings,
  SUPPORTED_FONTS
} from '../constants/presentation-settings.constant';

export const SETTINGS_STORAGE_KEY = 'pptx_presentation_settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  /**
   * Reactive signal holding current presentation configuration
   */
  readonly settings = signal<PresentationSettings>(this.loadInitialSettings());

  /**
   * Updates one or more settings and automatically persists to localStorage
   */
  updateSettings(partial: Partial<PresentationSettings>): void {
    const updated: PresentationSettings = {
      ...this.settings(),
      ...partial
    };

    // Sanitize values
    this.sanitizeSettings(updated);

    this.settings.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Resets all settings back to the repository defaults and removes custom overrides from localStorage
   */
  resetToDefaults(): void {
    const defaults = { ...DEFAULT_PRESENTATION_SETTINGS };
    this.settings.set(defaults);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (e) {
      console.warn('[SettingsService] Failed to clear settings from localStorage:', e);
    }
  }

  /**
   * Loads initial settings from localStorage, falling back to DEFAULT_PRESENTATION_SETTINGS
   */
  private loadInitialSettings(): PresentationSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          const merged: PresentationSettings = {
            ...DEFAULT_PRESENTATION_SETTINGS,
            ...parsed
          };
          this.sanitizeSettings(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('[SettingsService] Could not parse stored settings, falling back to defaults:', e);
    }

    return { ...DEFAULT_PRESENTATION_SETTINGS };
  }

  /**
   * Persists settings to localStorage safely
   */
  private saveToStorage(settings: PresentationSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[SettingsService] Failed to save settings to localStorage:', e);
    }
  }

  /**
   * Validates and constrains numeric ranges and types
   */
  private sanitizeSettings(s: PresentationSettings): void {
    // Aspect ratio
    if (s.aspectRatio !== '16x9' && s.aspectRatio !== '4x3') {
      s.aspectRatio = '16x9';
    }

    // Font size override (32pt to 48pt)
    if (typeof s.fontSizeOverride !== 'number' || isNaN(s.fontSizeOverride)) {
      s.fontSizeOverride = 40;
    } else {
      s.fontSizeOverride = Math.max(32, Math.min(48, Math.round(s.fontSizeOverride)));
    }

    // Side title font size (8pt to 20pt)
    if (typeof s.sideTitleFontSize !== 'number' || isNaN(s.sideTitleFontSize)) {
      s.sideTitleFontSize = 11;
    } else {
      s.sideTitleFontSize = Math.max(8, Math.min(20, Math.round(s.sideTitleFontSize)));
    }

    // Side title horizontal offset cm (0.0 to 3.0 cm)
    if (typeof s.sideTitleHorizontalOffsetCm !== 'number' || isNaN(s.sideTitleHorizontalOffsetCm)) {
      s.sideTitleHorizontalOffsetCm = 0.0;
    } else {
      s.sideTitleHorizontalOffsetCm = Math.max(0.0, Math.min(3.0, Number(s.sideTitleHorizontalOffsetCm.toFixed(1))));
    }

    // Logo scale percent (50% to 180%)
    if (typeof s.logoScalePercent !== 'number' || isNaN(s.logoScalePercent)) {
      s.logoScalePercent = 100;
    } else {
      s.logoScalePercent = Math.max(50, Math.min(180, Math.round(s.logoScalePercent)));
    }

    // Logo transparency (0% to 90%)
    if (typeof s.logoTransparency !== 'number' || isNaN(s.logoTransparency)) {
      s.logoTransparency = 35;
    } else {
      s.logoTransparency = Math.max(0, Math.min(90, Math.round(s.logoTransparency)));
    }

    // Color hex sanity
    if (!s.backgroundColor || !s.backgroundColor.startsWith('#')) {
      s.backgroundColor = '#000000';
    }
    if (!s.textColor || !s.textColor.startsWith('#')) {
      s.textColor = '#ffffff';
    }
  }
}
