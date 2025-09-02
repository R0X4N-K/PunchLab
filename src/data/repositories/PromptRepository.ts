// src/data/repositories/PromptRepository.ts

import { getDBConnection } from '../database/database';
import { Prompt } from '../models/Prompt';
import { Deck } from '../models/Deck'; // Import the Deck model

export const PromptRepository = {
  /**
   * Retrieves ALL prompts from the database.
   * Note: This is memory-intensive and should be used sparingly.
   * @returns A promise that resolves to an array of all Prompt objects.
   */
  async getAllPrompts(): Promise<Prompt[]> {
    const db = await getDBConnection();
    const [results] = await db.executeSql("SELECT id, content, type FROM prompts");
    
    const prompts: Prompt[] = [];
    results.rows.raw().forEach(row => prompts.push(row));
    return prompts;
  },

  /**
   * NEW: Searches for decks where the title EXACTLY matches a given topic.
   * The search is case-insensitive.
   * @param topic - The search term (e.g., "Fisica", "Storia").
   * @returns A promise that resolves to an array of matching Deck objects.
   */
  async getDecksByTopic(topic: string): Promise<Deck[]> {
    const db = await getDBConnection();
    // MODIFICA: Ora cerchiamo una corrispondenza esatta, non una sottostringa.
    const searchTerm = topic.toLowerCase();
    
    const [results] = await db.executeSql(
      // MODIFICA: Usiamo '=' invece di 'LIKE' per una maggiore precisione e performance.
      "SELECT id, title FROM decks WHERE LOWER(title) = ?",
      [searchTerm]
    );
    
    const decks: Deck[] = [];
    results.rows.raw().forEach(row => decks.push(row));
    return decks;
  },

  /**
   * NEW: Retrieves all prompts associated with a given list of deck IDs.
   * This is efficient for fetching training session data.
   * @param deckIds - An array of deck IDs.
   * @returns A promise that resolves to an array of unique Prompt objects.
   */
  async getPromptsByDeckIds(deckIds: number[]): Promise<Prompt[]> {
    if (deckIds.length === 0) {
      return [];
    }

    const db = await getDBConnection();
    // Create a string of placeholders (?,?,?) for the IN clause
    const placeholders = deckIds.map(() => '?').join(',');
    
    const query = `
      SELECT DISTINCT p.id, p.content, p.type
      FROM prompts p
      JOIN deck_prompts dp ON p.id = dp.prompt_id
      WHERE dp.deck_id IN (${placeholders})
    `;

    const [results] = await db.executeSql(query, deckIds);
    
    const prompts: Prompt[] = [];
    results.rows.raw().forEach(row => prompts.push(row));
    return prompts;
  },
};