import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SongRequestPayload, SongRequestResponse } from '../models/song-request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestSongService {
  private readonly endpoint = environment.formEndpoint || 'https://api.web3forms.com/submit';
  private readonly accessKey = environment.web3FormsAccessKey;

  /**
   * Submit a song request using Web3Forms or Formspree via browser fetch
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

    // Check if access key is still the default placeholder
    if (!this.accessKey || this.accessKey === 'YOUR_ACCESS_KEY_HERE') {
      console.warn(
        '[RequestSongService] Web3Forms access key is not set. Set web3FormsAccessKey in src/environments/environment.ts to receive emails.'
      );
    }

    const body: Record<string, any> = {
      access_key: this.accessKey,
      subject: `New Song Request: ${title}`,
      from_name: payload.submitterName?.trim() || 'Lyrics Presentation App',
      song_title: title,
      lyrics: lyrics,
      submitter_name: payload.submitterName?.trim() || 'Anonymous',
      submitter_email: payload.submitterEmail?.trim() || 'Not provided',
      notes: payload.notes?.trim() || 'No additional notes',
      submitted_at: new Date().toISOString()
    };

    if (payload.submitterEmail?.trim()) {
      body['replyto'] = payload.submitterEmail.trim();
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

      if (response.ok && (data.success !== false)) {
        return {
          success: true,
          message: 'Song request submitted successfully! It will be reviewed and added to the repository.'
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

  /**
   * Get the current configured access key
   */
  getAccessKey(): string {
    return this.accessKey;
  }

  /**
   * Get the current submission endpoint
   */
  getEndpoint(): string {
    return this.endpoint;
  }
}
