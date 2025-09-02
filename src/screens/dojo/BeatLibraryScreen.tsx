// src/screens/dojo/BeatLibraryScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { BeatRepository } from '../../data/repositories/BeatRepository';
import { Beat } from '../../data/models/Beat';
import { EditBeatModal } from '../../components/EditBeatModal';

type BeatLibraryNavProp = NativeStackNavigationProp<RootStackParamList, 'BeatLibrary'>;

const BeatLibraryScreen = () => {
  const navigation = useNavigation<BeatLibraryNavProp>();
  const [allBeats, setAllBeats] = useState<Beat[]>([]);
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBeatToEdit, setSelectedBeatToEdit] = useState<Beat | null>(null);

  const fetchBeats = async () => {
    try {
      setIsLoading(true);
      const beats = await BeatRepository.getAllBeats();
      setAllBeats(beats);
      setFilteredBeats(beats);
    } catch (error) {
      Alert.alert("Errore", "Impossibile caricare la libreria.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBeats();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredBeats(allBeats);
    } else {
      const lowercasedQuery = query.toLowerCase();
      const filtered = allBeats.filter(beat =>
        beat.title.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredBeats(filtered);
    }
  };

  const handleSelectBeat = (beat: Beat) => {
    navigation.navigate('TrainingSetup', { selectedBeat: beat });
  };

  const handleLongPressBeat = (beat: Beat) => {
    setSelectedBeatToEdit(beat);
    setModalVisible(true);
  };

  const handleSaveChanges = async (updatedBeat: Beat) => {
    try {
        await BeatRepository.updateBeat(updatedBeat);
        setModalVisible(false);
        setSelectedBeatToEdit(null);
        Alert.alert("Successo", "Beat aggiornato correttamente.");
        await fetchBeats(); // Ricarica la lista
    } catch (error) {
        Alert.alert("Errore", "Impossibile aggiornare il beat.");
    }
  };

  const handleDeleteBeat = async (beatId: number) => {
    try {
        await BeatRepository.deleteBeat(beatId);
        setModalVisible(false);
        setSelectedBeatToEdit(null);
        Alert.alert("Successo", "Beat eliminato.");
        await fetchBeats(); // Ricarica la lista
    } catch (error) {
        Alert.alert("Errore", "Impossibile eliminare il beat.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Libreria Beat</Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Cerca un beat..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#00FF7F" />
      ) : (
        <FlatList
          data={filteredBeats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.beatItem}
              onPress={() => handleSelectBeat(item)}
              onLongPress={() => handleLongPressBeat(item)}
            >
              <Text style={styles.beatItemTitle}>{item.title}</Text>
              <Text style={styles.beatItemBpm}>{item.bpm} BPM</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>La tua libreria è vuota.</Text>}
        />
      )}
      <EditBeatModal 
        isVisible={isModalVisible}
        beat={selectedBeatToEdit}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveChanges}
        onDelete={handleDeleteBeat}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { color: '#007BFF', fontSize: 18 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  searchInput: { backgroundColor: '#282828', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  beatItem: { backgroundColor: '#333', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  beatItemTitle: { color: '#FFFFFF', fontSize: 18 },
  beatItemBpm: { color: '#999', fontSize: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
});

export default BeatLibraryScreen;