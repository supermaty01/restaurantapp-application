import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///documents/',
  cacheDirectory: 'file:///cache/',
}));
