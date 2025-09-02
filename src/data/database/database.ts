import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHEMA_SQL } from './schema';

SQLite.enablePromise(true);

const DATABASE_NAME = "punchlab.sqlite";
const DB_INITIALIZED_KEY = '@databaseInitialized';

let db;

export const getDBConnection = async () => {
  if (db) {
    return db;
  }

  // Apriamo (o creiamo) il database
  const database = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
  console.log("Database aperto/creato.");

  // Controlliamo se è la prima volta che avviamo l'app
  const isInitialized = await AsyncStorage.getItem(DB_INITIALIZED_KEY);

  if (isInitialized !== 'true') {
    // Prima volta in assoluto: popoliamo il database
    try {
      console.log("Prima esecuzione, popolo il database dallo schema SQL...");
      // Dividiamo lo schema in singole istruzioni SQL
      const statements = SCHEMA_SQL.split(';\n').filter(s => s.trim().length > 0);
      
      // Eseguiamo tutte le istruzioni in una singola transazione
      await database.transaction(tx => {
        statements.forEach(statement => {
          tx.executeSql(statement);
        });
      });

      // Salviamo una "bandierina" per non ripetere l'operazione
      await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
      console.log("Popolamento del database completato con successo!");
    } catch (error) {
      console.error("ERRORE DURANTE IL POPOLAMENTO DEL DATABASE:", error);
      throw error;
    }
  } else {
    console.log("Il database è già inizializzato.");
  }

  db = database;
  return db;
};