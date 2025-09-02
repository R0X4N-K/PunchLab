// src/screens/dojo/TrainingScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Sound from 'react-native-sound';
import Animated, { SlideInRight, SlideOutLeft, SlideOutRight, SlideInLeft } from 'react-native-reanimated';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { Prompt } from '../../data/models/Prompt';
import { PromptCard } from '../../components/PromptCard';

const TrainingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Training'>>();
  const { mode, beat, prompts, deckName } = route.params;
  const filePath = beat.file_path;

  const [promptHistory, setPromptHistory] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'forward' | 'backward'>('forward');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const masterListRef = useRef<Prompt[]>([]);
  const soundRef = useRef<Sound | null>(null);
  const timersRef = useRef<{ prompt: NodeJS.Timeout | null, session: NodeJS.Timeout | null }>({ prompt: null, session: null });

  useEffect(() => {
    if (!prompts || prompts.length === 0) return;
    const shuffledPrompts = [...prompts];
    for (let i = shuffledPrompts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPrompts[i], shuffledPrompts[j]] = [shuffledPrompts[j], shuffledPrompts[i]];
    }
    masterListRef.current = shuffledPrompts;
    setPromptHistory([shuffledPrompts[0]]);
    setCurrentIndex(0);
  }, [prompts]);

  useEffect(() => {
    Sound.enable(true);
    const sound = new Sound(filePath, '', (error) => {
      if (error) { console.log('Failed to load the sound:', error); return; }
      sound.setNumberOfLoops(-1);
      soundRef.current = sound;
    });
    return () => {
      soundRef.current?.release();
      if (timersRef.current.prompt) clearInterval(timersRef.current.prompt);
      if (timersRef.current.session) clearInterval(timersRef.current.session);
    };
  }, [filePath]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') { // Avanti
      setSwipeDirection('forward');
      const canGoForwardInHistory = currentIndex < promptHistory.length - 1;
      const canAddNewCard = promptHistory.length < masterListRef.current.length;

      if (canGoForwardInHistory) {
        setCurrentIndex(prev => prev + 1);
      } else if (canAddNewCard) {
        // ## LOGICA RANDOM CORRETTA ##
        // Pesca una parola a caso che non sia già nella cronologia
        let nextPrompt;
        const historyIds = new Set(promptHistory.map(p => p.id));
        do {
            const randomIndex = Math.floor(Math.random() * masterListRef.current.length);
            nextPrompt = masterListRef.current[randomIndex];
        } while (historyIds.has(nextPrompt.id));

        setPromptHistory(prev => [...prev, nextPrompt]);
        setCurrentIndex(prev => prev + 1);
      }
    } else { // Indietro
      if (currentIndex > 0) {
        setSwipeDirection('backward');
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const advanceByTimer = () => {
    handleSwipe('left');
  }

  const handleTogglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
      if (timersRef.current.prompt) clearInterval(timersRef.current.prompt);
      if (timersRef.current.session) clearInterval(timersRef.current.session);
    } else {
      soundRef.current.play();
      timersRef.current.session = setInterval(() => setSessionTime(prev => prev + 1), 1000);
      timersRef.current.prompt = setInterval(advanceByTimer, 8000);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStopSession = () => {
    soundRef.current?.stop(() => {
      navigation.goBack();
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPrompt = promptHistory[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deckName}>{deckName}</Text>
        <Text style={styles.modeTitle}>{mode.name}</Text>
        <Text style={styles.timer}>{formatTime(sessionTime)}</Text>
      </View>
      
      <View style={styles.promptContainer}>
        {currentPrompt && (
          <Animated.View
            key={currentPrompt.id}
            style={styles.animatedContainer}
          >
            <PromptCard
              prompt={currentPrompt}
              onSwipe={handleSwipe}
              isFirstCard={currentIndex === 0}
            />
          </Animated.View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleTogglePlay}>
          <Text style={styles.controlButtonText}>{isPlaying ? 'Pausa' : 'Avvia'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleStopSession}>
          <Text style={styles.controlButtonText}>Termina</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'space-between' },
    header: { padding: 20, alignItems: 'center', zIndex: 1 },
    deckName: { color: '#BBBBBB', fontSize: 16, fontWeight: '500', marginBottom: 4, textTransform: 'uppercase' },
    modeTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    timer: { color: '#00FF7F', fontSize: 20, marginTop: 10 },
    promptContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    animatedContainer: { width: '100%', alignItems: 'center' },
    controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
    controlButton: { backgroundColor: '#282828', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
    controlButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default TrainingScreen;