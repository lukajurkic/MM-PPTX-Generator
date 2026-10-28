import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlaylistQueueComponent } from './playlist-queue.component';
import { SongService } from '../../services/song.service';
import { PptxExportService } from '../../services/pptx-export.service';
import { SettingsService } from '../../services/settings.service';
import { Song } from '../../models/song.model';

describe('PlaylistQueueComponent', () => {
  let component: PlaylistQueueComponent;
  let fixture: ComponentFixture<PlaylistQueueComponent>;
  let songService: SongService;
  let pptxService: PptxExportService;
  let settingsService: SettingsService;

  const sampleSong1: Song = {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    slug: 'amazing-grace',
    fileName: 'Amazing Grace.json',
    stanzaCount: 4,
    preview: 'Amazing grace how sweet the sound',
    categories: ['Slavljenje'],
    massSections: ['Ulazna'],
    stanzas: ['S1', 'S2', 'S3', 'S4']
  };

  const sampleSong2: Song = {
    id: 'how-great-thou-art',
    title: 'How Great Thou Art',
    slug: 'how-great-thou-art',
    fileName: 'How Great Thou Art.json',
    stanzaCount: 4,
    preview: 'O Lord, my God',
    categories: ['Zahvala'],
    massSections: ['Pričesna'],
    stanzas: ['S1', 'S2', 'S3', 'S4']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistQueueComponent, HttpClientTestingModule],
      providers: [SongService, PptxExportService, SettingsService]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistQueueComponent);
    component = fixture.componentInstance;
    songService = TestBed.inject(SongService);
    pptxService = TestBed.inject(PptxExportService);
    settingsService = TestBed.inject(SettingsService);
    songService.clearPlaylist();
    settingsService.resetToDefaults();
    fixture.detectChanges();
  });

  it('should render empty state when playlist is empty', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-queue-state')).toBeTruthy();
    expect(compiled.querySelector('.export-button')?.hasAttribute('disabled')).toBeTrue();
  });

  it('should render items, summary metrics, and enable export button when songs are added', () => {
    songService.addToPlaylist(sampleSong1);
    songService.addToPlaylist(sampleSong2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-queue-state')).toBeFalsy();

    const items = compiled.querySelectorAll('.queue-item');
    expect(items.length).toBe(2);

    // Number badges
    expect(items[0].querySelector('.order-badge')?.textContent?.trim()).toBe('1');
    expect(items[1].querySelector('.order-badge')?.textContent?.trim()).toBe('2');

    // Summary calculation: 4 + 4 lyrics + 3 blank slides (before, between, after) = 11 total slides
    expect(component.lyricSlidesCount()).toBe(8);
    expect(component.totalEstimatedSlides()).toBe(11);
    expect(compiled.querySelector('.export-button')?.hasAttribute('disabled')).toBeFalse();
  });

  it('should invoke reordering methods when up/down buttons clicked', () => {
    spyOn(songService, 'moveSongUp');
    spyOn(songService, 'moveSongDown');

    songService.addToPlaylist(sampleSong1);
    songService.addToPlaylist(sampleSong2);
    fixture.detectChanges();

    component.onMoveUp(1);
    expect(songService.moveSongUp).toHaveBeenCalledWith(1);

    component.onMoveDown(0);
    expect(songService.moveSongDown).toHaveBeenCalledWith(0);
  });

  it('should call downloadPresentation and display success feedback', async () => {
    songService.addToPlaylist(sampleSong1);
    fixture.detectChanges();

    spyOn(pptxService, 'downloadPresentation').and.returnValue(Promise.resolve('2026-10-27.pptx'));

    await component.onGeneratePresentation();
    fixture.detectChanges();

    expect(pptxService.downloadPresentation).toHaveBeenCalled();
    expect(component.feedbackType()).toBe('success');
    expect(component.feedbackMessage()).toContain('2026-10-27.pptx');
  });

  it('should open lyrics modal when item details is clicked in queue', () => {
    songService.addToPlaylist(sampleSong1);
    fixture.detectChanges();

    spyOn(songService, 'openLyrics');
    const compiled = fixture.nativeElement as HTMLElement;
    const itemDetails = compiled.querySelector('.item-details.clickable') as HTMLElement;
    expect(itemDetails).toBeTruthy();

    itemDetails.click();
    expect(songService.openLyrics).toHaveBeenCalledWith(sampleSong1);
  });

  it('should adjust totalEstimatedSlides when blank slide settings change', () => {
    songService.addToPlaylist(sampleSong1);
    songService.addToPlaylist(sampleSong2);
    fixture.detectChanges();

    // Default: 8 lyrics + 3 blank slides (intro, between, outro) = 11 slides
    expect(component.totalEstimatedSlides()).toBe(11);

    // Disable blank slide between songs: 8 lyrics + 2 blank slides (intro, outro) = 10 slides
    settingsService.updateSettings({ blankSlideBetweenSongs: false });
    fixture.detectChanges();
    expect(component.totalEstimatedSlides()).toBe(10);

    // Disable all blank slides: 8 lyrics + 0 blank slides = 8 slides
    settingsService.updateSettings({ blankSlideStartEnd: false });
    fixture.detectChanges();
    expect(component.totalEstimatedSlides()).toBe(8);
  });

  it('should display default status indicator when settings are at default values', () => {
    settingsService.resetToDefaults();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusBtn = compiled.querySelector('.settings-status-btn') as HTMLButtonElement;
    expect(statusBtn).toBeTruthy();
    expect(statusBtn.classList.contains('custom')).toBeFalse();
    expect(statusBtn.querySelector('.default-indicator')).toBeTruthy();
    expect(statusBtn.textContent).toContain('Zadane postavke aktivne');
  });

  it('should display custom status indicator when custom settings are active', () => {
    settingsService.updateSettings({ aspectRatio: '4x3' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusBtn = compiled.querySelector('.settings-status-btn') as HTMLButtonElement;
    expect(statusBtn).toBeTruthy();
    expect(statusBtn.classList.contains('custom')).toBeTrue();
    expect(statusBtn.querySelector('.custom-indicator')).toBeTruthy();
    expect(statusBtn.textContent).toContain('Prilagođene postavke aktivne');
  });

  it('should emit openSettings event when status button is clicked', () => {
    spyOn(component.openSettings, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    const statusBtn = compiled.querySelector('.settings-status-btn') as HTMLButtonElement;
    expect(statusBtn).toBeTruthy();

    statusBtn.click();
    expect(component.openSettings.emit).toHaveBeenCalled();
  });
});


