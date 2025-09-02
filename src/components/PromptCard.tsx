// src/components/PromptCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Prompt } from '../data/models/Prompt';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface PromptCardProps {
  prompt: Prompt;
  onSwipe: (direction: 'left' | 'right') => void;
  isFirstCard: boolean;
}

export const PromptCard = ({ prompt, onSwipe, isFirstCard }: PromptCardProps) => {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Limita lo swipe a destra per la prima card
      if (isFirstCard && event.translationX > 0) {
        translateX.value = event.translationX / 4;
        return;
      }
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD && !isFirstCard) {
        // Comunica lo swipe a destra (indietro)
        runOnJS(onSwipe)('right');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Comunica lo swipe a sinistra (avanti)
        runOnJS(onSwipe)('left');
      } else {
        // Torna al centro se lo swipe non è sufficiente
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.promptText}>{prompt.content}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
    card: {
      width: '90%',
      height: 280,
      backgroundColor: '#3A3A3C',
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
    },
    promptText: {
      color: '#FFFFFF',
      fontSize: 34,
      fontWeight: '600',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
});