// src/components/BpmInputModal.tsx

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';

interface BpmInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (title: string, bpm: number) => void;
}

export const BpmInputModal = ({ isVisible, onClose, onSubmit }: BpmInputModalProps) => {
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState('');

  const handleSubmit = () => {
    const bpmNumber = parseInt(bpm, 10);
    if (title.trim() && !isNaN(bpmNumber) && bpmNumber > 0 && bpmNumber < 300) {
      onSubmit(title.trim(), bpmNumber);
      // Reset fields for the next use
      setTitle('');
      setBpm('');
    } else {
      Alert.alert('Input non valido', 'Per favore, inserisci un titolo e un valore di BPM corretto (es. 90).');
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dettagli del Beat</Text>
          <TextInput
            style={styles.input}
            placeholder="Titolo del Beat"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
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
            <Button title="Annulla" onPress={onClose} color="#FF5555" />
            <Button title="Salva Beat" onPress={handleSubmit} />
          </View>
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
});