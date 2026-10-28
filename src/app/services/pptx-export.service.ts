import { Injectable } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { PlaylistItem } from '../models/song.model';
import { SKAC_LOGO_BASE64 } from '../constants/skac-logo.constant';
import {
  DEFAULT_PRESENTATION_SETTINGS,
  PresentationSettings
} from '../constants/presentation-settings.constant';

export interface PptxExportOptions {
  filename?: string;
  settings?: PresentationSettings;
  /** Legacy compatibility options */
  includeBlankSlides?: boolean;
  includeBlankSlideBetweenSongs?: boolean;
  includeLogo?: boolean;
  includeSideTitle?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PptxExportService {
  readonly defaultFontFace = 'Times New Roman';
  readonly defaultBackgroundColor = '000000';
  readonly defaultTextColor = 'FFFFFF';
  readonly sideTitleTextColor = '64748B'; // Muted subtle slate gray

  /**
   * Formats a date into YYYY-MM-DD.pptx
   */
  getDefaultFilename(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}.pptx`;
  }

  /**
   * Builds the configured PptxGenJS instance for the playlist using presentation settings:
   * - Configurable aspect ratio (16:9 widescreen or 4:3 standard)
   * - Configurable solid background color & text typography/color
   * - Configurable font face and fixed/auto sizing (32–48pt)
   * - Rotated 90° CCW (270°) side song title with configurable font, size, and horizontal offset
   * - SKAC logo in bottom-right corner with configurable scale and transparency
   * - Configurable blank slide transitions (intro/outro and between songs)
   */
  buildPresentation(playlist: PlaylistItem[], options: PptxExportOptions = {}): pptxgen {
    const pres = new pptxgen();

    // Resolve active settings with fallback to defaults
    const settings: PresentationSettings = {
      ...DEFAULT_PRESENTATION_SETTINGS,
      ...(options.settings || {})
    };

    // Honor legacy options if explicitly provided
    if (options.includeBlankSlides !== undefined) {
      settings.blankSlideStartEnd = options.includeBlankSlides;
      settings.blankSlideBetweenSongs = options.includeBlankSlides;
    }
    if (options.includeBlankSlideBetweenSongs !== undefined) {
      settings.blankSlideBetweenSongs = options.includeBlankSlideBetweenSongs;
    }
    if (options.includeLogo !== undefined) {
      settings.showLogo = options.includeLogo;
    }
    if (options.includeSideTitle !== undefined) {
      settings.showSideTitle = options.includeSideTitle;
    }

    // Configure Slide Dimensions & Layout based on Aspect Ratio
    let slideWidth = 10.0;
    let slideHeight = 5.625;

    if (settings.aspectRatio === '4x3') {
      pres.layout = 'LAYOUT_4x3';
      slideWidth = 10.0;
      slideHeight = 7.5;
    } else {
      pres.layout = 'LAYOUT_16x9';
      slideWidth = 10.0;
      slideHeight = 5.625;
    }

    // Clean colors (strip '#' for PptxGenJS)
    const bgColor = (settings.backgroundColor || '#000000').replace(/^#/, '');
    const textColor = (settings.textColor || '#ffffff').replace(/^#/, '');
    const lyricsFontFace = settings.fontFamily || this.defaultFontFace;

    // Calculate uniform auto-fit font size across all stanzas in the presentation
    // so that the entire text has a consistent, uniform font size based on the longest stanza
    const effectiveFontSize = settings.autoFontSize
      ? this.calculateUniformAutoFontSize(playlist)
      : settings.fontSizeOverride;

    // 1. Insert leading blank slide before the first song if enabled
    if (settings.blankSlideStartEnd && playlist.length > 0) {
      const leadingSlide = pres.addSlide();
      leadingSlide.background = { color: bgColor };
    }

    // 2. Iterate through playlist and stanzas
    playlist.forEach((item, songIndex) => {
      const song = item.song;

      // Add one slide per stanza
      song.stanzas.forEach(stanza => {
        const slide = pres.addSlide();
        slide.background = { color: bgColor };

        // Main lyric typography
        const allCapsText = stanza.toUpperCase();

        slide.addText(allCapsText, {
          x: '5%',
          y: '5%',
          w: '86%',
          h: '90%',
          fontFace: lyricsFontFace,
          fontSize: effectiveFontSize,
          color: textColor,
          bold: settings.bold ?? false,
          italic: settings.italic ?? false,
          align: 'center',
          valign: 'middle',
          breakLine: true
        });

        // Rotated side song title on the right edge
        if (settings.showSideTitle && song.title) {
          const titleText = song.title.toUpperCase();
          const titleFont = settings.sideTitleFontFamily || this.defaultFontFace;
          const titleFontSize = settings.sideTitleFontSize || (titleText.length > 30 ? 10 : 12);

          // Convert horizontal offset from cm to inches (1 inch = 2.54 cm)
          // Default baseline X on 10" width slide is 7.45 (with width 4.4, rotated 270)
          const offsetInches = (settings.sideTitleHorizontalOffsetCm || 0) / 2.54;
          const titleX = Math.max(0, 7.45 - offsetInches);

          // Center vertically depending on slide height (16:9 = 5.625", 4:3 = 7.5")
          const titleY = slideHeight / 2 - 0.2;

          slide.addText(titleText, {
            x: Number(titleX.toFixed(3)),
            y: Number(titleY.toFixed(3)),
            w: 4.4,
            h: 0.4,
            fontFace: titleFont,
            fontSize: titleFontSize,
            color: this.sideTitleTextColor,
            bold: false,
            align: 'center',
            valign: 'middle',
            rotate: 270
          });
        }

        // Corner SKAC logo watermark
        if (settings.showLogo) {
          const scale = (settings.logoScalePercent || 100) / 100;
          const logoW = Number((0.56 * scale).toFixed(3));
          const logoH = Number((0.59 * scale).toFixed(3));

          // Position in bottom-right corner relative to slide bounds
          const marginRight = 0.12;
          const marginBottom = 0.105;
          const logoX = Math.max(0, Number((slideWidth - logoW - marginRight).toFixed(3)));
          const logoY = Math.max(0, Number((slideHeight - logoH - marginBottom).toFixed(3)));

          const transparency = Math.max(0, Math.min(90, settings.logoTransparency ?? 35));

          slide.addImage({
            data: SKAC_LOGO_BASE64,
            x: logoX,
            y: logoY,
            w: logoW,
            h: logoH,
            transparency
          });
        }
      });

      // Insert blank slide between distinct songs if enabled
      if (settings.blankSlideBetweenSongs && songIndex < playlist.length - 1) {
        const blankSlide = pres.addSlide();
        blankSlide.background = { color: bgColor };
      }
    });

    // 3. Insert trailing blank slide after the last song if enabled
    if (settings.blankSlideStartEnd && playlist.length > 0) {
      const trailingSlide = pres.addSlide();
      trailingSlide.background = { color: bgColor };
    }

    return pres;
  }

  /**
   * Triggers generation and file download of the PowerPoint presentation
   */
  async downloadPresentation(playlist: PlaylistItem[], options: PptxExportOptions = {}): Promise<string> {
    if (!playlist || playlist.length === 0) {
      throw new Error('Playlist is empty. Please select at least one song.');
    }

    let filename = options.filename?.trim() || this.getDefaultFilename();
    if (!filename.toLowerCase().endsWith('.pptx')) {
      filename += '.pptx';
    }

    const pres = this.buildPresentation(playlist, options);
    await pres.writeFile({ fileName: filename });
    return filename;
  }

  /**
   * Calculates uniform font size across all stanzas in the entire playlist.
   * Finds the smallest font size required by any stanza so that the longest stanza
   * fits cleanly, and applies that uniform font size to the whole presentation.
   */
  calculateUniformAutoFontSize(playlist: PlaylistItem[]): number {
    const allStanzas = playlist.flatMap(item => item.song.stanzas);
    if (allStanzas.length === 0) {
      return 40;
    }
    return Math.min(...allStanzas.map(s => this.calculateOptimalFontSize(s)));
  }

  /**
   * Dynamic font sizing (32–44pt) with auto-fit logic based on line count and line length
   */
  calculateOptimalFontSize(stanza: string): number {
    const lines = stanza.split('\n').map(l => l.trim()).filter(Boolean);
    const lineCount = lines.length;
    const maxLineLength = Math.max(...lines.map(l => l.length), 0);

    if (lineCount <= 2 && maxLineLength <= 35) {
      return 44;
    } else if (lineCount <= 4 && maxLineLength <= 45) {
      return 40;
    } else if (lineCount <= 6 && maxLineLength <= 55) {
      return 36;
    } else {
      return 32;
    }
  }
}
