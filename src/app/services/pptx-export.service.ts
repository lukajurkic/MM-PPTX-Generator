import { Injectable } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { PlaylistItem } from '../models/song.model';
import { SKAC_LOGO_BASE64 } from '../constants/skac-logo.constant';

export interface PptxExportOptions {
  filename?: string;
  includeBlankSlideBetweenSongs?: boolean;
  includeLogo?: boolean;
  includeSideTitle?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PptxExportService {
  readonly defaultFontFace = 'Verdana';
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
   * Builds the configured PptxGenJS instance for the playlist:
   * - 16:9 widescreen layout with solid black background
   * - Bold centered white lyrics in Verdana font
   * - Rotated 90° counter-clockwise (270°) muted song title along the right edge
   * - SKAC logo in the bottom-right corner of each lyric slide
   * - Clean solid black blank transition slide between songs
   */
  buildPresentation(playlist: PlaylistItem[], options: PptxExportOptions = {}): pptxgen {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    const includeBlankSlides = options.includeBlankSlideBetweenSongs !== false;
    const includeLogo = options.includeLogo !== false;
    const includeSideTitle = options.includeSideTitle !== false;

    playlist.forEach((item, songIndex) => {
      const song = item.song;

      // Add one slide per stanza
      song.stanzas.forEach(stanza => {
        const slide = pres.addSlide();
        slide.background = { color: this.defaultBackgroundColor };

        // 1. Main lyric typography: Verdana, ALL CAPS, bold, white, centered
        const allCapsText = stanza.toUpperCase();
        const fontSize = this.calculateOptimalFontSize(stanza);

        slide.addText(allCapsText, {
          x: '5%',
          y: '5%',
          w: '86%',
          h: '90%',
          fontFace: this.defaultFontFace,
          fontSize,
          color: this.defaultTextColor,
          bold: true,
          align: 'center',
          valign: 'middle',
          breakLine: true
        });

        // 2. Rotated song title on the right edge: grayed out, rotated 90° to the left (270°)
        if (includeSideTitle && song.title) {
          const titleText = song.title.toUpperCase();
          const titleFontSize = titleText.length > 30 ? 10 : 12;

          slide.addText(titleText, {
            x: 7.5,
            y: 2.0,
            w: 4.0,
            h: 0.5,
            fontFace: this.defaultFontFace,
            fontSize: titleFontSize,
            color: this.sideTitleTextColor,
            bold: false,
            align: 'center',
            valign: 'middle',
            rotate: 270
          });
        }

        // 3. SKAC logo in bottom-right corner of the slide
        if (includeLogo) {
          slide.addImage({
            data: SKAC_LOGO_BASE64,
            x: 9.15,
            y: 4.75,
            w: 0.65,
            h: 0.68
          });
        }
      });

      // Insert a single blank solid black slide between distinct songs (clean transition without logo/title)
      if (includeBlankSlides && songIndex < playlist.length - 1) {
        const blankSlide = pres.addSlide();
        blankSlide.background = { color: this.defaultBackgroundColor };
      }
    });

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
   * Dynamic font sizing (36–44pt) with auto-fit logic based on line count and line length
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
