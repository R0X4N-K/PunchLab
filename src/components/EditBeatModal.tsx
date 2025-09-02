// src/components/EditBeatModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Beat } from '../data/models/Beat';

interface EditBeatModalProps {
  isVisible: boolean;
  beat: Beat | null;
  onClose: () => void;
  onSave: (updatedBeat: Beat) => void;
  onDelete: (beatId: number) => void;
}

export const EditBeatModal = ({ isVisible, beat, onClose, onSave, onDelete }: EditBeatModalProps) => {
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState('');

  useEffect(() => {
    if (beat) {
      setTitle(beat.title);
      setBpm(beat.bpm.toString());
    }
  }, [beat]);

  const handleSave = () => {
    const bpmNumber = parseInt(bpm, 10);
    if (beat && title.trim() && !isNaN(bpmNumber) && bpmNumber > 0) {
      onSave({ ...beat, title: title.trim(), bpm: bpmNumber });
    } else {
      Alert.alert('Input non valido', 'Per favore, inserisci un titolo e un BPM corretti.');
    }
  };

  const handleDelete = () => {
    if (beat) {
        Alert.alert(
            "Conferma Eliminazione",
            `Sei sicuro di voler eliminare "${beat.title}"?`,
            [
                { text: "Annulla", style: "cancel" },
                { text: "Elimina", style: "destructive", onPress: () => onDelete(beat.id) }
            ]
        );
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifica Beat</Text>
          <TextInput
            style={styles.input}
            placeholder="Titolo del Beat"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="BPM (es. 90)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={bpm}
            onChangeText={setBpm}
          />
          <View style={styles.buttonContainer}>
            <Button title="Annulla" onPress={onClose} color="#999" />
            <Button title="Salva Modifiche" onPress={handleSave} />
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Elimina Beat</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { width: '85%', backgroundColor: '#282828', padding: 20, borderRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: '#FFFFFF', borderRadius: 5, padding: 10, marginBottom: 15 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  deleteButton: { marginTop: 20, alignItems: 'center' },
  deleteButtonText: { color: '#FF5555', fontSize: 16 },
});