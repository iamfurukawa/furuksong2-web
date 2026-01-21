export interface Sound {
  id: string;
  name: string;
  url: string;
  playCount: number;
  createdAt: number;
  categories: Category[];
}

export interface Category {
  id: string;
  label: string;
}

export interface SoundListResponse {
  sounds: Sound[];
}
