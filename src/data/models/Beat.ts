// src/data/models/Beat.ts

export interface Beat {
  id: number;
  title: string;
  bpm: number;
  file_path: string; // Using snake_case to match the working implementation
  userId?: number;
}