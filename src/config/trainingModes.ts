// src/config/trainingModes.ts

/**
 * Defines the structure for a single training mode.
 */
export interface TrainingMode {
  id: string;
  name: string;
  description: string;
}

/**
 * A static list of available training modes in the app.
 * This can be easily extended in the future.
 */
export const TRAINING_MODES: TrainingMode[] = [
  {
    id: 'theme_change',
    name: 'Cambio Tema',
    description: 'Improvvisa su temi che cambiano a intervalli regolari.',
  },
  {
    id: 'word_insertion',
    name: 'Incastro di Parole',
    description: 'Integra nel flow le parole che appaiono a schermo.',
  },
  {
    id: 'four_bar_drill',
    name: 'Drill 4/4',
    description: 'Scrivi o improvvisa 4 barre partendo da uno stimolo.',
  },
];