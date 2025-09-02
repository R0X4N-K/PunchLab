// src/screens/dojo/TrainingSetupScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native'; // NUOVO
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

import { BpmInputModal } from '../../components/BpmInputModal';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { TRAINING_MODES, TrainingMode } from '../../config/trainingModes';
import { PromptRepository } from '../../data/repositories/PromptRepository';
import { BeatRepository } from '../../data/repositories/BeatRepository';
import { Prompt } from '../../data/models/Prompt';
import { Beat } from '../../data/models/Beat';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainingSetup'>;

const TrainingSetupScreen = ({ navigation }: Props) => {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isBpmModalVisible, setBpmModalVisible] = useState(false);
  const [pickedFileUri, setPickedFileUri] = useState<string | null>(null);

  // NUOVO: Hook per ricevere i parametri dalla navigazione
  const route = useRoute<RouteProp<RootStackParamList, 'TrainingSetup'>>();

  // NUOVO: Effetto che si attiva quando torniamo dalla BeatLibrary
  useEffect(() => {
    if (route.params?.selectedBeat) {
      setSelectedBeat(route.params.selectedBeat);
    }
  }, [route.params?.selectedBeat]);


  const pickBeat = async () => {
    try {
      const [file] = await pick({ multiple: false, type: [types.audio] });
      if (!file || !file.uri) return;

      const fileName = file.name ?? `beat-${Date.now()}.mp3`;
      const destinationPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.copyFile(file.uri, destinationPath);

      setPickedFileUri(`file://${destinationPath}`);
      setBpmModalVisible(true);
    } catch (err: any) {
      if (!err?.message?.includes('cancelled')) {
        Alert.alert('Errore', 'Non è stato possibile selezionare il file.');
      }
    }
  };

  const handleBeatSubmission = async (title: string, bpm: number) => {
    if (!pickedFileUri) return;

    try {
      const beatToSave = { title, bpm, filePath: pickedFileUri };
      const newId = await BeatRepository.createBeat(beatToSave);
      
      // Seleziona automaticamente il beat appena creato per la sessione corrente
      setSelectedBeat({ ...beatToSave, id: newId, file_path: beatToSave.filePath });
      Alert.alert('Successo', 'Beat aggiunto alla tua libreria e selezionato!');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare il beat.');
    } finally {
      setBpmModalVisible(false);
      setPickedFileUri(null);
    }
  };

  // ... (tutta la logica per mode, topic, prompts rimane invariata)
  const [selectedMode, setSelectedMode] = useState<TrainingMode | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const topics = ["Sostantivi", "Aggettivi", "Verbi", "Emozioni", "Fisica", "Biologia", "Medicina", "Astronomia", "Informatica", "Storia", "Arte", "Musica", "Cinema", "Filosofia", "Psicologia", "Cibo", "Sport", "Moda", "Crimini", "Guerra"];
  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoadingPrompts(true);
    setPrompts([]);
    try {
      const decksFound = await PromptRepository.getDecksByTopic(topic);
      if (decksFound.length > 0) {
        const deckIds = decksFound.map(deck => deck.id);
        const promptsFound = await PromptRepository.getPromptsByDeckIds(deckIds);
        setPrompts(promptsFound);
      }
    } catch (error) {
      console.error("Failed to fetch prompts for topic:", error);
    } finally {
      setIsLoadingPrompts(false);
    }
  };
  const handleStartTraining = () => {
    if (selectedMode && selectedBeat && prompts.length > 0 && selectedTopic) {
      navigation.navigate('Training', {
        mode: selectedMode,
        beat: selectedBeat,
        prompts: prompts,
        deckName: selectedTopic,
      });
    } else {
        Alert.alert('Manca qualcosa!', 'Assicurati di aver selezionato modalità, beat e mazzo.');
    }
  };
  const isReady = selectedMode !== null && selectedBeat !== null && prompts.length > 0;
  // ...

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Training Setup</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Scegli la Modalità</Text>
          <View style={styles.grid}>
            {TRAINING_MODES.map(mode => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.chip, selectedMode?.id === mode.id && styles.chipSelected]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text style={styles.chipText}>{mode.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NUOVA SEZIONE BEAT SEMPLIFICATA */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Scegli il Beat</Text>
            {selectedBeat ? (
                <View style={styles.selectionBox}>
                    <Text style={styles.selectionTextMain}>{selectedBeat.title}</Text>
                    <Text style={styles.selectionTextSub}>{selectedBeat.bpm} BPM</Text>
                </View>
            ) : (
                <Text style={styles.placeholderText}>Nessun beat selezionato</Text>
            )}
            <View style={styles.buttonGroup}>
                <Button title="Scegli dalla Libreria" onPress={() => navigation.navigate('BeatLibrary')} />
                <Button title="Aggiungi Nuovo Beat" onPress={pickBeat} />
            </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Scegli il Mazzo</Text>
          <View style={styles.grid}>
            {topics.map(topic => (
              <TouchableOpacity
                key={topic}
                style={[styles.chip, selectedTopic === topic && styles.chipSelected]}
                onPress={() => handleTopicSelect(topic)}
              >
                <Text style={styles.chipText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {isLoadingPrompts && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 10 }}/>}
          {prompts.length > 0 && !isLoadingPrompts && (
            <Text style={styles.selectionTextStatus}>{prompts.length} prompt caricati.</Text>
          )}
        </View>

        <View style={styles.startButtonContainer}>
            <TouchableOpacity
              style={[styles.startButton, !isReady && styles.startButtonDisabled]}
              disabled={!isReady}
              onPress={handleStartTraining}
            >
              <Text style={styles.startButtonText}>Avvia Allenamento</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      <BpmInputModal
        isVisible={isBpmModalVisible}
        onClose={() => setBpmModalVisible(false)}
        onSubmit={handleBeatSubmission}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginVertical: 20, textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 20 },
  sectionTitle: { fontSize: 22, color: '#FFFFFF', marginBottom: 15, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, margin: 5 },
  chipSelected: { backgroundColor: '#007BFF' },
  chipText: { color: '#FFFFFF', fontSize: 14 },
  
  // Stili per la nuova sezione beat
  selectionBox: { backgroundColor: '#282828', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  selectionTextMain: { color: '#00FF7F', fontSize: 18, fontWeight: 'bold' },
  selectionTextSub: { color: '#00FF7F', fontSize: 14 },
  placeholderText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginBottom: 15, fontSize: 16 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around' },
  selectionTextStatus: { color: '#00FF7F', fontSize: 16, marginTop: 10, textAlign: 'center', fontStyle: 'italic' },
  
  startButtonContainer: { padding: 20 },
  startButton: { backgroundColor: '#00FF7F', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: '#555' },
  startButtonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
});

export default TrainingSetupScreen;