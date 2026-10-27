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

  it('should build presentation with 16:9 layout, SKAC logo, rotated side title, and blank transition slides', () => {
    const pres = service.buildPresentation(mockPlaylist);
    expect(pres).toBeTruthy();
    expect(pres.layout).toBe('LAYOUT_16x9');

    // 1 leading blank slide + 2 stanzas from song 1 + 1 blank slide + 1 stanza from song 2 + 1 trailing blank slide = 6 total slides
    const slides = (pres as any).slides;
    expect(slides.length).toBe(6);

    // Slide 1 (Leading blank slide before first song): Should contain 0 objects (solid black)
    expect(slides[0]._slideObjects.length).toBe(0);

    // Slide 2 (Lyric slide for Song 1, Stanza 1): Should contain lyric text, rotated side title, and SKAC logo (3 objects)
    expect(slides[1]._slideObjects.length).toBe(3);

    // Slide 3 (Lyric slide for Song 1, Stanza 2): Should contain lyric text, rotated side title, and SKAC logo (3 objects)
    expect(slides[2]._slideObjects.length).toBe(3);

    // Slide 4 (Blank transition slide between songs): Should contain 0 objects (solid black)
    expect(slides[3]._slideObjects.length).toBe(0);

    // Slide 5 (Lyric slide from song 2): Should contain lyric text, rotated side title, and SKAC logo (3 objects)
    expect(slides[4]._slideObjects.length).toBe(3);

    // Slide 6 (Trailing blank slide after last song): Should contain 0 objects (solid black)
    expect(slides[5]._slideObjects.length).toBe(0);
  });

  it('should respect includeLogo and includeSideTitle options when set to false', () => {
    const pres = service.buildPresentation(mockPlaylist, {
      includeLogo: false,
      includeSideTitle: false
    });
    const slides = (pres as any).slides;
    // Slide 1 is leading blank slide (0 objects)
    expect(slides[0]._slideObjects.length).toBe(0);
    // Slide 2 is lyric slide with only the lyric text (1 object)
    expect(slides[1]._slideObjects.length).toBe(1);
  });

  it('should omit blank slides when includeBlankSlides is false', () => {
    const pres = service.buildPresentation(mockPlaylist, {
      includeBlankSlides: false
    });
    const slides = (pres as any).slides;
    // 2 stanzas from song 1 + 1 stanza from song 2 = 3 lyric slides (no leading, between, or trailing blanks)
    expect(slides.length).toBe(3);
    expect(slides[0]._slideObjects.length).toBe(3);
    expect(slides[1]._slideObjects.length).toBe(3);
    expect(slides[2]._slideObjects.length).toBe(3);
  });

  it('should throw an error if attempting to export an empty playlist', async () => {
    await expectAsync(service.downloadPresentation([])).toBeRejectedWithError(
      'Playlist is empty. Please select at least one song.'
    );
  });
});

