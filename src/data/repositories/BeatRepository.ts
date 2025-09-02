// src/data/repositories/BeatRepository.ts

import { getDBConnection } from '../database/database';
import { Beat } from '../models/Beat';

type BeatToCreate = Omit<Beat, 'id'>;

export const BeatRepository = {
  async getAllBeats(): Promise<Beat[]> {
    const db = await getDBConnection();
    const [results] = await db.executeSql("SELECT id, title, bpm, file_path FROM beats ORDER BY title ASC");
    
    const beats: Beat[] = [];
    results.rows.raw().forEach(row => beats.push(row));
    return beats;
  },

  async createBeat(beat: BeatToCreate): Promise<number> {
    const { title, bpm, filePath, userId } = beat;
    const db = await getDBConnection();
    
    const [results] = await db.executeSql(
      "INSERT INTO beats (title, bpm, file_path, user_id) VALUES (?, ?, ?, ?)",
      [title, bpm, filePath, userId]
    );

    return results.insertId;
  },

  /**
   * NUOVO: Aggiorna un beat esistente nel database.
   */
  async updateBeat(beat: Beat): Promise<void> {
    const { id, title, bpm } = beat;
    const db = await getDBConnection();
    await db.executeSql(
      "UPDATE beats SET title = ?, bpm = ? WHERE id = ?",
      [title, bpm, id]
    );
  },

  /**
   * NUOVO: Cancella un beat dal database usando il suo ID.
   */
  async deleteBeat(id: number): Promise<void> {
    const db = await getDBConnection();
    await db.executeSql("DELETE FROM beats WHERE id = ?", [id]);
  },
};