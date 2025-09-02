// src/hooks/useBeatPicker.ts

import { useState } from 'react';
import { Alert } from 'react-native';
import { pick, keepLocalCopy, DocumentPickerResponse, types } from '@react-native-documents/picker';
import { Beat } from '../data/models/Beat';

export function useBeatPicker() {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isBpmModalVisible, setBpmModalVisible] = useState(false);
  const [pickedFile, setPickedFile] = useState<DocumentPickerResponse | null>(null);

  const pickBeat = async () => {
    try {
      const [file] = await pick({ multiple: false, type: [types.audio] });

      const [localCopy] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name ?? 'beat-file.mp3' }],
        destination: 'documentDirectory',
      });

      setPickedFile({ ...file, uri: localCopy.uri });
      setBpmModalVisible(true);

    } catch (err: any) {
      if (!err?.message?.includes('cancelled') && !err?.message?.includes('cancel')) {
        Alert.alert('Errore', 'Non è stato possibile selezionare il file. Riprova.');
        console.error('Picker Error:', err);
      } else {
        console.log('User cancelled the picker.');
      }
    }
  };

  /**
   * Questa è la funzione chiave.
   * Crea l'oggetto 'Beat' completo e lo salva nello stato.
   */
  const handleBeatSubmission = (title: string, bpm: number) => {
    if (!pickedFile) return;

    // L'ERRORE ERA QUI: L'OGGETTO VENIVA CREATO SENZA QUESTA PROPRIETÀ.
    // Questa versione è quella corretta e completa.
    setSelectedBeat({
      id: Date.now(),
      title,
      bpm,
      file_path: pickedFile.uri, // <-- QUESTA RIGA È FONDAMENTALE
    });

    setBpmModalVisible(false);
    setPickedFile(null);
  };

  const closePicker = () => {
    setBpmModalVisible(false);
    setPickedFile(null);
  };

  return { selectedBeat, isBpmModalVisible, pickBeat, handleBeatSubmission, closePicker };
}