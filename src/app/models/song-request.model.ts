export interface SongRequestPayload {
  title: string;
  lyrics: string;
  submitterName?: string;
  submitterEmail?: string;
  notes?: string;
}

export interface SongRequestResponse {
  success: boolean;
  message: string;
}
