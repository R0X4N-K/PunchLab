// babel.config.js

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // MODIFICA QUESTA RIGA
    'react-native-worklets/plugin', // USA QUESTO AL POSTO DI 'react-native-reanimated/plugin'
  ],
};