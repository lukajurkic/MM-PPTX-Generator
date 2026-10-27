export interface SongRequestPayload {
  title: string;
  lyrics: string;
  category?: string;
  massSection?: string;
  submitterName?: string;
  submitterEmail?: string;
  notes?: string;
}

export interface SongRequestResponse {
  success: boolean;
  message: string;
}
