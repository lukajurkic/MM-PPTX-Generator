import { TestBed } from '@angular/core/testing';
import { PptxExportService } from './pptx-export.service';
import { PlaylistItem } from '../models/song.model';

describe('PptxExportService', () => {
  let service: PptxExportService;

  const mockPlaylist: PlaylistItem[] = [
    {
      playlistId: 'song-1',
      song: {
        id: 'amazing-grace',
        title: 'Amazing Grace',
        slug: 'amazing-grace',
        fileName: 'Amazing Grace.json',
        stanzaCount: 2,
        preview: 'Amazing grace how sweet the sound',
        categories: ['Slavljenje'],
        massSections: ['Ulazna'],
        stanzas: [
          'Amazing grace how sweet the sound\nThat saved a wretch like me',
          'I once was lost, but now I am found\nWas blind, but now I see'
        ]
      }
    },
    {
      playlistId: 'song-2',
      song: {
        id: 'how-great-thou-art',
        title: 'How Great Thou Art',
        slug: 'how-great-thou-art',
        fileName: 'How Great Thou Art.json',
        stanzaCount: 1,
        preview: 'O Lord, my God, when I in awesome wonder',
        categories: ['Zahvala'],
        massSections: ['Pričesna'],
        stanzas: [
          'O Lord, my God, when I in awesome wonder\nConsider all the worlds Thy Hands have made'
        ]
      }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PptxExportService]
    });
    service = TestBed.inject(PptxExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format default date filename as YYYY-MM-DD.pptx', () => {
    const testDate = new Date(2026, 9, 27); // Month index 9 = October
    const filename = service.getDefaultFilename(testDate);
    expect(filename).toBe('2026-10-27.pptx');
  });

  it('should calculate optimal font size between 36 and 44pt', () => {
    // Short 2-line stanza
    const shortStanza = 'Amazing grace how sweet the sound\nThat saved a wretch like me';
    expect(service.calculateOptimalFontSize(shortStanza)).toBe(44);

    // 4-line standard stanza
    const mediumStanza = 'Line 1\nLine 2\nLine 3\nLine 4';
    expect(service.calculateOptimalFontSize(mediumStanza)).toBe(40);

    // 6-line longer stanza
    const longerStanza = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6';
    expect(service.calculateOptimalFontSize(longerStanza)).toBe(36);
  });

  it('should build presentation with 16:9 layout and blank transition slides', () => {
    const pres = service.buildPresentation(mockPlaylist);
    expect(pres).toBeTruthy();
    expect(pres.layout).toBe('LAYOUT_16x9');

    // 2 stanzas from song 1 + 1 blank slide + 1 stanza from song 2 = 4 total slides
    // In pptxgenjs, pres.slides contains all slides
    expect((pres as any).slides.length).toBe(4);
  });

  it('should throw an error if attempting to export an empty playlist', async () => {
    await expectAsync(service.downloadPresentation([])).toBeRejectedWithError(
      'Playlist is empty. Please select at least one song.'
    );
  });
});

