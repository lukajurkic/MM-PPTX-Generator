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
      fileName: 'Amazing Grace.json',
      stanzaCount: 4,
      preview: 'Amazing grace how sweet the sound',
      categories: ['Slavljenje', 'Zahvala'],
      massSections: ['Ulazna'],
      stanzas: ['Stanza 1', 'Stanza 2', 'Stanza 3', 'Stanza 4']
    },
    {
      id: 'how-great-thou-art',
      title: 'How Great Thou Art',
      slug: 'how-great-thou-art',
      fileName: 'How Great Thou Art.json',
      stanzaCount: 4,
      preview: 'O Lord, my God, when I in awesome wonder',
      categories: ['Meditativne'],
      massSections: ['Pričesna'],
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

  it('should filter songs by category', () => {
    component.onToggleCategory('Meditativne');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.song-item');
    expect(items.length).toBe(1);
    expect(compiled.querySelector('.song-title')?.textContent).toContain('How Great Thou Art');
  });

  it('should filter songs by mass section', () => {
    component.onToggleMassSection('Ulazna');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.song-item');
    expect(items.length).toBe(1);
    expect(compiled.querySelector('.song-title')?.textContent).toContain('Amazing Grace');
  });

  it('should clear all active filters when onClearAllFilters is called', () => {
    component.onToggleCategory('Slavljenje');
    component.onToggleMassSection('Ulazna');
    component.onSearchChange('grace');
    fixture.detectChanges();

    expect(songService.activeFilterCount()).toBe(3);

    component.onClearAllFilters();
    fixture.detectChanges();

    expect(songService.activeFilterCount()).toBe(0);
    expect(songService.searchQuery()).toBe('');
    expect(songService.selectedCategories().length).toBe(0);
    expect(songService.selectedMassSections().length).toBe(0);
  });

  it('should open lyrics modal when song card is clicked', () => {
    spyOn(songService, 'openLyrics');
    const compiled = fixture.nativeElement as HTMLElement;
    const songInfo = compiled.querySelector('.song-info.clickable') as HTMLElement;
    expect(songInfo).toBeTruthy();

    songInfo.click();
    expect(songService.openLyrics).toHaveBeenCalledWith(sampleSongs[0]);
  });

  describe('Empty Song option', () => {
    it('should render empty song item in catalog list by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emptyItem = compiled.querySelector('.empty-song-item');
      expect(emptyItem).toBeTruthy();
      expect(emptyItem?.textContent).toContain('Prazna pjesma');
      expect(emptyItem?.textContent).toContain('Crni slajd');
    });

    it('should open empty song modal when empty song item or add button is clicked', () => {
      expect(component.isEmptySongModalOpen()).toBeFalse();

      component.onOpenEmptySongModal();
      fixture.detectChanges();

      expect(component.isEmptySongModalOpen()).toBeTrue();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-empty-song-modal')).toBeTruthy();
    });

    it('should call songService.addEmptySong and close modal when confirmed', () => {
      spyOn(songService, 'addEmptySong');
      component.isEmptySongModalOpen.set(true);

      component.onConfirmEmptySong({ title: 'Moja tiha pjesma', slideCount: 5 });

      expect(songService.addEmptySong).toHaveBeenCalledWith('Moja tiha pjesma', 5);
      expect(component.isEmptySongModalOpen()).toBeFalse();
    });

    it('should show empty song option when search query matches prazna or empty', () => {
      component.onSearchChange('prazna');
      expect(component.shouldShowEmptySongItem()).toBeTrue();

      component.onSearchChange('empty');
      expect(component.shouldShowEmptySongItem()).toBeTrue();

      component.onSearchChange('something-completely-unrelated');
      expect(component.shouldShowEmptySongItem()).toBeFalse();
    });

    it('should hide empty song option when mass section filter is active', () => {
      component.onToggleMassSection('Ulazna');
      expect(component.shouldShowEmptySongItem()).toBeFalse();
    });
  });
});

