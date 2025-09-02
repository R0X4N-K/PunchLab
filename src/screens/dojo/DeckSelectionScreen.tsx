// src/screens/dojo/DeckSelectionScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
// REPOSITORY: Importiamo il nuovo PromptRepository
import { PromptRepository } from '../../data/repositories/PromptRepository';
// MODELLO: Importiamo il nuovo modello Prompt
import { Prompt } from '../../data/models/Prompt';

const DeckSelectionScreen = () => {
  // STATO: Ora usiamo un array di Prompt invece che di Deck
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        // LOGICA: Chiamiamo la nuova funzione per caricare i prompt
        const fetchedPrompts = await PromptRepository.getAllPrompts();
        setPrompts(fetchedPrompts);
      } catch (error) {
        console.error("Failed to fetch prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TITOLO: Aggiorniamo il titolo della schermata */}
      <Text style={styles.title}>Tutti i Prompt</Text>
      <FlatList
        // RENDER: Usiamo la lista di prompt
        data={prompts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.promptCard}>
            {/* Mostriamo il contenuto del prompt */}
            <Text style={styles.promptContent}>{item.content}</Text>
            {/* Mostriamo anche il tipo di prompt per chiarezza */}
            <Text style={styles.promptType}>{item.type}</Text>
          </View>
        )}
      />
    </View>
  );
};

// STILE: Aggiorniamo gli stili per i prompt
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  promptCard: { backgroundColor: '#282828', padding: 15, borderRadius: 10, marginBottom: 10 },
  promptContent: { color: '#FFFFFF', fontSize: 18 },
  promptType: { color: '#999999', fontSize: 14, marginTop: 5 }
});

export default DeckSelectionScreen;