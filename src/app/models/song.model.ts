export interface Song {
  id: string;
  title: string;
  slug: string;
  fileName: string;
  stanzaCount: number;
  preview: string;
  stanzas: string[];
}

export interface PlaylistItem {
  playlistId: string;
  song: Song;
}
