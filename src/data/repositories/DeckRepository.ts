import { getDBConnection } from '../database/database';
import { Deck } from '../models/Deck';

export const DeckRepository = {
  async getAllDecks(): Promise<Deck[]> {
    const db = await getDBConnection();
    const [results] = await db.executeSql("SELECT id, title FROM decks");
    const decks: Deck[] = [];
    results.rows.raw().forEach(row => decks.push(row));
    return decks;
  },
};