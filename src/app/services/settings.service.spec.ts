import { TestBed } from '@angular/core/testing';
import { SettingsService, SETTINGS_STORAGE_KEY } from './settings.service';
import { DEFAULT_PRESENTATION_SETTINGS } from '../constants/presentation-settings.constant';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created with repository defaults when localStorage is empty', () => {
    expect(service).toBeTruthy();
    expect(service.settings()).toEqual(DEFAULT_PRESENTATION_SETTINGS);
  });

  it('should update settings and persist to localStorage', () => {
    service.updateSettings({
      aspectRatio: '4x3',
      textColor: '#fcd34d',
      backgroundColor: '#074d97',
      showLogo: false
    });

    const current = service.settings();
    expect(current.aspectRatio).toBe('4x3');
    expect(current.textColor).toBe('#fcd34d');
    expect(current.backgroundColor).toBe('#074d97');
    expect(current.showLogo).toBe(false);

    // Verify localStorage persistence
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    expect(stored.aspectRatio).toBe('4x3');
    expect(stored.textColor).toBe('#fcd34d');
    expect(stored.showLogo).toBe(false);
  });

  it('should sanitize out-of-range numeric settings', () => {
    service.updateSettings({
      fontSizeOverride: 100, // max 48
      sideTitleFontSize: 2, // min 8
      sideTitleHorizontalOffsetCm: 10, // max 3.0
      logoScalePercent: 300, // max 180
      logoTransparency: -10 // min 0
    });

    const current = service.settings();
    expect(current.fontSizeOverride).toBe(48);
    expect(current.sideTitleFontSize).toBe(8);
    expect(current.sideTitleHorizontalOffsetCm).toBe(3.0);
    expect(current.logoScalePercent).toBe(180);
    expect(current.logoTransparency).toBe(0);
  });

  it('should reset settings to defaults and clean localStorage', () => {
    service.updateSettings({
      aspectRatio: '4x3',
      backgroundColor: '#111827'
    });
    expect(service.settings().aspectRatio).toBe('4x3');

    service.resetToDefaults();
    expect(service.settings()).toEqual(DEFAULT_PRESENTATION_SETTINGS);
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('should compute isDefault correctly when settings are default or modified', () => {
    expect(service.isDefault()).toBeTrue();

    service.updateSettings({ aspectRatio: '4x3' });
    expect(service.isDefault()).toBeFalse();

    service.resetToDefaults();
    expect(service.isDefault()).toBeTrue();

    service.updateSettings({ backgroundColor: '#111827' });
    expect(service.isDefault()).toBeFalse();

    service.updateSettings({ backgroundColor: '#000000' });
    expect(service.isDefault()).toBeTrue();

    service.updateSettings({ showLogo: false });
    expect(service.isDefault()).toBeFalse();

    service.resetToDefaults();
    expect(service.isDefault()).toBeTrue();
  });

  it('should fall back gracefully if stored JSON in localStorage is invalid', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, 'invalid-json{{{');
    const freshService = new SettingsService();
    expect(freshService.settings()).toEqual(DEFAULT_PRESENTATION_SETTINGS);
  });
});

