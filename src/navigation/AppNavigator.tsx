// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TrainingSetupScreen from '../screens/dojo/TrainingSetupScreen';
import TrainingScreen from '../screens/dojo/TrainingScreen';
import BeatLibraryScreen from '../screens/dojo/BeatLibraryScreen'; // NUOVO

import { Beat } from '../data/models/Beat';
import { Prompt } from '../data/models/Prompt';
import { TrainingMode } from '../config/trainingModes';

export type RootStackParamList = {
  TrainingSetup: { selectedBeat?: Beat }; // MODIFICA: Può ricevere un beat come parametro
  Training: {
    mode: TrainingMode;
    beat: Beat;
    prompts: Prompt[];
    deckName: string;
  };
  BeatLibrary: undefined; // NUOVO: La nuova schermata per la libreria
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="TrainingSetup" component={TrainingSetupScreen} />
          <Stack.Screen name="BeatLibrary" component={BeatLibraryScreen} />
          <Stack.Screen name="Training" component={TrainingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;