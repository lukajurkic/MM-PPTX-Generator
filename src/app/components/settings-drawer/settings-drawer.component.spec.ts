import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsDrawerComponent } from './settings-drawer.component';
import { SettingsService } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import { DEFAULT_PRESENTATION_SETTINGS } from '../../constants/presentation-settings.constant';

describe('SettingsDrawerComponent', () => {
  let component: SettingsDrawerComponent;
  let fixture: ComponentFixture<SettingsDrawerComponent>;
  let settingsService: SettingsService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsDrawerComponent],
      providers: [SettingsService, TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsDrawerComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the settings drawer component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all settings sections and live preview stage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.preview-stage')).toBeTruthy();
    expect(compiled.querySelectorAll('.settings-group').length).toBeGreaterThanOrEqual(5);
  });

  it('should switch aspect ratio between 16:9 and 4:3', () => {
    expect(settingsService.settings().aspectRatio).toBe('16x9');
    component.onSetAspectRatio('4x3');
    expect(settingsService.settings().aspectRatio).toBe('4x3');
    component.onSetAspectRatio('16x9');
    expect(settingsService.settings().aspectRatio).toBe('16x9');
  });

  it('should update font family and colors', () => {
    component.onSetFontFamily('Arial');
    component.onSetTextColor('#fcd34d');
    component.onSetBackgroundColor('#074d97');

    const s = settingsService.settings();
    expect(s.fontFamily).toBe('Arial');
    expect(s.textColor).toBe('#fcd34d');
    expect(s.backgroundColor).toBe('#074d97');
  });

  it('should toggle bold and italic text styles', () => {
    expect(settingsService.settings().bold).toBeFalse();
    expect(settingsService.settings().italic).toBeFalse();

    component.onToggleBold();
    expect(settingsService.settings().bold).toBeTrue();

    component.onToggleItalic();
    expect(settingsService.settings().italic).toBeTrue();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const previewLyrics = compiled.querySelector('.preview-lyrics') as HTMLElement;
    expect(previewLyrics.style.fontWeight).toBe('bold');
    expect(previewLyrics.style.fontStyle).toBe('italic');
  });

  it('should update side title font size and horizontal offset', () => {
    component.onSetSideTitleFontSize(14);
    component.onSetSideTitleOffset(1.5);

    const s = settingsService.settings();
    expect(s.sideTitleFontSize).toBe(14);
    expect(s.sideTitleHorizontalOffsetCm).toBe(1.5);
  });

  it('should reset all settings back to defaults when reset button is clicked', () => {
    component.onSetAspectRatio('4x3');
    component.onSetBackgroundColor('#111827');
    expect(settingsService.settings().aspectRatio).toBe('4x3');

    component.onResetToDefaults();
    expect(settingsService.settings()).toEqual(DEFAULT_PRESENTATION_SETTINGS);
  });

  it('should emit close event on close button click and escape key', () => {
    spyOn(component.close, 'emit');

    component.onClose();
    expect(component.close.emit).toHaveBeenCalledTimes(1);

    component.handleEscape();
    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });
});
