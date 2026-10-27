import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SongLyricsModalComponent } from './song-lyrics-modal.component';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/song.model';

describe('SongLyricsModalComponent', () => {
  let component: SongLyricsModalComponent;
  let fixture: ComponentFixture<SongLyricsModalComponent>;
  let songService: SongService;

  const sampleSong: Song = {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    slug: 'amazing-grace',
    fileName: 'Amazing Grace.json',
    stanzaCount: 2,
    preview: 'Amazing grace how sweet the sound',
    categories: ['Slavljenje', 'Zahvala'],
    massSections: ['Ulazna'],
    stanzas: [
      'Amazing grace how sweet the sound\nThat saved a wretch like me',
      'I once was lost, but now I am found\nWas blind, but now I see'
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongLyricsModalComponent, HttpClientTestingModule],
      providers: [SongService]
    }).compileComponents();

    fixture = TestBed.createComponent(SongLyricsModalComponent);
    component = fixture.componentInstance;
    component.song = sampleSong;
    songService = TestBed.inject(SongService);
    fixture.detectChanges();
  });

  it('should create and render song title and metadata badges', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.modal-title')?.textContent?.trim()).toBe('Amazing Grace');
    const tags = compiled.querySelectorAll('.tag-badge');
    expect(tags.length).toBe(3); // 1 mass section + 2 categories
  });

  it('should render all stanzas in stanza cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.stanza-card');
    expect(cards.length).toBe(2);

    expect(cards[0].querySelector('.stanza-lyrics')?.textContent?.trim()).toContain('Amazing grace how sweet');
    expect(cards[1].querySelector('.stanza-lyrics')?.textContent?.trim()).toContain('I once was lost');
  });

  it('should add song to playlist when Add button is clicked', () => {
    spyOn(songService, 'addToPlaylist').and.callThrough();
    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('.add-playlist-btn') as HTMLButtonElement;

    addBtn.click();
    expect(songService.addToPlaylist).toHaveBeenCalledWith(sampleSong);
    expect(songService.playlistCount()).toBe(1);
  });

  it('should emit close event and call songService.closeLyrics on close button click', () => {
    spyOn(component.close, 'emit');
    spyOn(songService, 'closeLyrics');

    const compiled = fixture.nativeElement as HTMLElement;
    const closeBtn = compiled.querySelector('.close-button') as HTMLButtonElement;
    closeBtn.click();

    expect(component.close.emit).toHaveBeenCalled();
    expect(songService.closeLyrics).toHaveBeenCalled();
  });

  it('should close on Escape key press', () => {
    spyOn(component, 'onClose');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(component.onClose).toHaveBeenCalled();
  });

  it('should copy lyrics to clipboard on copy button click', async () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    await component.onCopyLyrics();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `Amazing Grace\n\nAmazing grace how sweet the sound\nThat saved a wretch like me\n\nI once was lost, but now I am found\nWas blind, but now I see`
    );
    expect(component.copied()).toBeTrue();
  });
});

