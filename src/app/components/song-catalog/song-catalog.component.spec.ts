import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { SongCatalogComponent } from './song-catalog.component';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/song.model';

describe('SongCatalogComponent', () => {
  let component: SongCatalogComponent;
  let fixture: ComponentFixture<SongCatalogComponent>;
  let songService: SongService;

  const sampleSongs: Song[] = [
    {
      id: 'amazing-grace',
      title: 'Amazing Grace',
      slug: 'amazing-grace',
      fileName: 'Amazing Grace.txt',
      stanzaCount: 4,
      preview: 'Amazing grace how sweet the sound',
      stanzas: ['Stanza 1', 'Stanza 2', 'Stanza 3', 'Stanza 4']
    },
    {
      id: 'how-great-thou-art',
      title: 'How Great Thou Art',
      slug: 'how-great-thou-art',
      fileName: 'How Great Thou Art.txt',
      stanzaCount: 4,
      preview: 'O Lord, my God, when I in awesome wonder',
      stanzas: ['Stanza 1', 'Stanza 2', 'Stanza 3', 'Stanza 4']
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongCatalogComponent, HttpClientTestingModule, FormsModule],
      providers: [SongService]
    }).compileComponents();

    fixture = TestBed.createComponent(SongCatalogComponent);
    component = fixture.componentInstance;
    songService = TestBed.inject(SongService);

    // Mock loaded songs directly on the service
    (songService as any).songsSignal.set(sampleSongs);
    fixture.detectChanges();
  });

  it('should create the component and render song list', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.song-item');
    expect(items.length).toBe(2);
    expect(compiled.querySelector('.live-counter')?.textContent).toContain('2 od 2');
  });

  it('should filter songs when typing into search input', () => {
    component.onSearchChange('grace');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.song-item');
    expect(items.length).toBe(1);
    expect(compiled.querySelector('.song-title')?.textContent).toContain('Amazing Grace');
  });

  it('should show clear button when search is active and clear when clicked', () => {
    component.onSearchChange('test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const clearBtn = compiled.querySelector('.clear-search-btn') as HTMLButtonElement;
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(songService.searchQuery()).toBe('');
    expect(compiled.querySelector('.clear-search-btn')).toBeFalsy();
  });

  it('should add song to playlist and update button state when add button clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstAddBtn = compiled.querySelector('.add-btn') as HTMLButtonElement;
    expect(firstAddBtn.textContent).toContain('Dodaj');

    firstAddBtn.click();
    fixture.detectChanges();

    expect(songService.playlistCount()).toBe(1);
    expect(firstAddBtn.textContent).toContain('Dodano (1)');
    expect(firstAddBtn.classList.contains('in-playlist')).toBeTrue();
  });
});

