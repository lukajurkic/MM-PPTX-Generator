import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SongService } from './song.service';
import { Song } from '../models/song.model';

describe('SongService', () => {
  let service: SongService;
  let httpMock: HttpTestingController;

  const mockSongs: Song[] = [
    {
      id: 'amazing-grace',
      title: 'Amazing Grace',
      slug: 'amazing-grace',
      fileName: 'Amazing Grace.json',
      stanzaCount: 4,
      preview: 'Amazing grace how sweet the sound',
      categories: ['Slavljenje', 'Zahvala'],
      massSections: ['Ulazna'],
      stanzas: [
        'Amazing grace how sweet the sound\nThat saved a wretch like me',
        'I once was lost, but now I am found\nWas blind, but now I see'
      ]
    },
    {
      id: 'how-great-thou-art',
      title: 'How Great Thou Art',
      slug: 'how-great-thou-art',
      fileName: 'How Great Thou Art.json',
      stanzaCount: 4,
      preview: 'O Lord, my God, when I in awesome wonder',
      categories: ['Meditativne'],
      massSections: ['Pričesna', 'Klanjanje'],
      stanzas: [
        'O Lord, my God, when I in awesome wonder\nConsider all the worlds Thy Hands have made'
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SongService]
    });

    service = TestBed.inject(SongService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with initial empty state', () => {
    expect(service).toBeTruthy();
    expect(service.songs().length).toBe(0);
    expect(service.playlist().length).toBe(0);
    expect(service.playlistCount()).toBe(0);
    expect(service.totalPlaylistSlides()).toBe(0);
  });

  it('should load songs from assets/songs/index.json and cache them', () => {
    service.loadSongs().subscribe(songs => {
      expect(songs.length).toBe(2);
      expect(songs[0].title).toBe('Amazing Grace');
    });

    const req = httpMock.expectOne('assets/songs/index.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSongs);

    expect(service.songs().length).toBe(2);
    expect(service.filteredSongs().length).toBe(2);
  });

  it('should filter songs by title', () => {
    // Load mock data
    service.loadSongs().subscribe();
    httpMock.expectOne('assets/songs/index.json').flush(mockSongs);

    service.setSearchQuery('grace');
    expect(service.filteredSongs().length).toBe(1);
    expect(service.filteredSongs()[0].id).toBe('amazing-grace');
  });

  it('should filter songs by lyrics content', () => {
    service.loadSongs().subscribe();
    httpMock.expectOne('assets/songs/index.json').flush(mockSongs);

    service.setSearchQuery('blind');
    expect(service.filteredSongs().length).toBe(1);
    expect(service.filteredSongs()[0].id).toBe('amazing-grace');
  });

  it('should add songs to playlist and calculate stats correctly', () => {
    const item1 = service.addToPlaylist(mockSongs[0]);
    const item2 = service.addToPlaylist(mockSongs[1]);

    expect(service.playlistCount()).toBe(2);
    expect(service.totalPlaylistSlides()).toBe(8); // 4 + 4
    expect(service.isSongSelected('amazing-grace')).toBeTrue();
    expect(service.getSongOccurrenceCount('amazing-grace')).toBe(1);
  });

  it('should reorder playlist using moveSongUp and moveSongDown', () => {
    const item1 = service.addToPlaylist(mockSongs[0]);
    const item2 = service.addToPlaylist(mockSongs[1]);

    expect(service.playlist()[0].song.id).toBe('amazing-grace');
    expect(service.playlist()[1].song.id).toBe('how-great-thou-art');

    // Move second item up
    service.moveSongUp(1);
    expect(service.playlist()[0].song.id).toBe('how-great-thou-art');
    expect(service.playlist()[1].song.id).toBe('amazing-grace');

    // Move first item down
    service.moveSongDown(0);
    expect(service.playlist()[0].song.id).toBe('amazing-grace');
    expect(service.playlist()[1].song.id).toBe('how-great-thou-art');
  });

  it('should remove items and clear playlist', () => {
    const item1 = service.addToPlaylist(mockSongs[0]);
    const item2 = service.addToPlaylist(mockSongs[1]);

    service.removeFromPlaylist(item1.playlistId);
    expect(service.playlistCount()).toBe(1);
    expect(service.playlist()[0].song.id).toBe('how-great-thou-art');

    service.clearPlaylist();
    expect(service.playlistCount()).toBe(0);
  });

  it('should filter songs by selected category using OR logic', () => {
    service.loadSongs().subscribe();
    httpMock.expectOne('assets/songs/index.json').flush(mockSongs);

    service.toggleCategoryFilter('Meditativne');
    expect(service.filteredSongs().length).toBe(1);
    expect(service.filteredSongs()[0].id).toBe('how-great-thou-art');

    // Add another category (OR logic)
    service.toggleCategoryFilter('Slavljenje');
    expect(service.filteredSongs().length).toBe(2);

    // Toggle off Meditativne
    service.toggleCategoryFilter('Meditativne');
    expect(service.filteredSongs().length).toBe(1);
    expect(service.filteredSongs()[0].id).toBe('amazing-grace');
  });

  it('should filter songs by selected mass section using OR logic', () => {
    service.loadSongs().subscribe();
    httpMock.expectOne('assets/songs/index.json').flush(mockSongs);

    service.toggleMassSectionFilter('Klanjanje');
    expect(service.filteredSongs().length).toBe(1);
    expect(service.filteredSongs()[0].id).toBe('how-great-thou-art');

    service.clearMassSectionFilters();
    expect(service.filteredSongs().length).toBe(2);
  });

  it('should clear all filters', () => {
    service.loadSongs().subscribe();
    httpMock.expectOne('assets/songs/index.json').flush(mockSongs);

    service.setSearchQuery('grace');
    service.toggleCategoryFilter('Slavljenje');
    service.toggleMassSectionFilter('Ulazna');

    expect(service.activeFilterCount()).toBe(3);

    service.clearAllFilters();
    expect(service.activeFilterCount()).toBe(0);
    expect(service.searchQuery()).toBe('');
    expect(service.selectedCategories().length).toBe(0);
    expect(service.selectedMassSections().length).toBe(0);
    expect(service.filteredSongs().length).toBe(2);
  });

  it('should manage active lyrics modal state with openLyrics and closeLyrics', () => {
    expect(service.activeLyricsSong()).toBeNull();

    service.openLyrics(mockSongs[0]);
    expect(service.activeLyricsSong()).toEqual(mockSongs[0]);

    service.closeLyrics();
    expect(service.activeLyricsSong()).toBeNull();
  });
});

