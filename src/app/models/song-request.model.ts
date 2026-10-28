export interface SongRequestPayload {
  title: string;
  lyrics: string;
  category?: string;
  categories?: string[];
  massSection?: string;
  massSections?: string[];
  submitterName?: string;
  submitterEmail?: string;
  notes?: string;
}

export interface SongRequestResponse {
  success: boolean;
  message: string;
}
