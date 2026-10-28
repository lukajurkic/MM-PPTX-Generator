import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SongRequestPayload, SongRequestResponse } from '../models/song-request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestSongService {
  private readonly endpoint = environment.formEndpoint || 'https://formsubmit.co/ajax/lukajurkic1@gmail.com';
  private readonly accessKey = environment.web3FormsAccessKey;
  private readonly recipientEmail = environment.recipientEmail || 'lukajurkic1@gmail.com';

  /**
   * Submit a song request via browser fetch to forward to the maintainer's email
   */
  async submitSongRequest(payload: SongRequestPayload): Promise<SongRequestResponse> {
    const title = payload.title?.trim();
    const lyrics = payload.lyrics?.trim();

    if (!title) {
      throw new Error('Song title is required.');
    }
    if (!lyrics) {
      throw new Error('Song lyrics are required.');
    }

    const isFormSubmit = this.endpoint.includes('formsubmit.co');
    const categoriesFormatted = payload.categories && payload.categories.length > 0
      ? payload.categories.join(', ')
      : (payload.category?.trim() || 'Not specified');

    const massSectionsFormatted = payload.massSections && payload.massSections.length > 0
      ? payload.massSections.join(', ')
      : (payload.massSection?.trim() || 'Not specified');

    let body: Record<string, any>;

    if (isFormSubmit) {
      body = {
        _subject: `New Song Request: ${title}`,
        _template: 'table',
        _captcha: 'false',
        'Song Title': title,
        'Category': categoriesFormatted,
        'Mass Section': massSectionsFormatted,
        'Lyrics': lyrics,
        'Submitter Name': payload.submitterName?.trim() || 'Anonymous',
        'Submitter Email': payload.submitterEmail?.trim() || 'Not provided',
        'Notes': payload.notes?.trim() || 'No additional notes',
        'Submitted At': new Date().toLocaleString()
      };
      if (payload.submitterEmail?.trim()) {
        body['_replyto'] = payload.submitterEmail.trim();
      }
    } else {
      body = {
        access_key: this.accessKey,
        subject: `New Song Request: ${title}`,
        from_name: payload.submitterName?.trim() || 'Lyrics Presentation App',
        song_title: title,
        category: categoriesFormatted,
        mass_section: massSectionsFormatted,
        lyrics: lyrics,
        submitter_name: payload.submitterName?.trim() || 'Anonymous',
        submitter_email: payload.submitterEmail?.trim() || 'Not provided',
        notes: payload.notes?.trim() || 'No additional notes',
        submitted_at: new Date().toISOString()
      };
      if (payload.submitterEmail?.trim()) {
        body['replyto'] = payload.submitterEmail.trim();
      }
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success !== false && data.success !== 'false')) {
        return {
          success: true,
          message: `Your song request has been sent to ${this.recipientEmail}! It will be reviewed and added to the repository.`
        };
      } else {
        const errorMsg = data.message || `Submission failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('[RequestSongService] Submission error:', err);
      throw new Error(err.message || 'Unable to submit song request. Please check your internet connection and try again.');
    }
  }

  getRecipientEmail(): string {
    return this.recipientEmail;
  }

  getEndpoint(): string {
    return this.endpoint;
  }
}
