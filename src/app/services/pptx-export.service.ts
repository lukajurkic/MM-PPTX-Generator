import { Injectable } from '@angular/core';
import pptxgen from 'pptxgenjs';
import { PlaylistItem } from '../models/song.model';

export interface PptxExportOptions {
  filename?: string;
  includeBlankSlideBetweenSongs?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PptxExportService {
  readonly defaultFontFace = 'Verdana';
  readonly defaultBackgroundColor = '000000';
  readonly defaultTextColor = 'FFFFFF';

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
   * Builds the configured PptxGenJS instance for the playlist
   */
  buildPresentation(playlist: PlaylistItem[], options: PptxExportOptions = {}): pptxgen {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    const includeBlankSlides = options.includeBlankSlideBetweenSongs !== false;

    playlist.forEach((item, songIndex) => {
      const song = item.song;

      // Add one slide per stanza
      song.stanzas.forEach(stanza => {
        const slide = pres.addSlide();
        slide.background = { color: this.defaultBackgroundColor };

        // Typography settings: Verdana, ALL CAPS, bold, white, centered
        const allCapsText = stanza.toUpperCase();
        const fontSize = this.calculateOptimalFontSize(stanza);

        slide.addText(allCapsText, {
          x: '5%',
          y: '5%',
          w: '90%',
          h: '90%',
          fontFace: this.defaultFontFace,
          fontSize,
          color: this.defaultTextColor,
          bold: true,
          align: 'center',
          valign: 'middle',
          breakLine: true
        });
      });

      // Insert a single blank black slide between distinct songs
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

