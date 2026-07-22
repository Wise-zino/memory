import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateWrongAnswers = (correct, count = 3) => {
  const offsets = [-7, -3, 3, 7, -13, 13, -21, 21, 50, -50];
  const wrongs = shuffle(offsets)
    .map((o) => correct + o)
    .filter((v) => v > 0 && v !== correct)
    .slice(0, count);
  return wrongs;
};

export const STORAGE_KEY = '@neurospark_saved';

export const loadSaved = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const persistSaved = async (items) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    Alert.alert('Storage Error', 'Could not save. Please try again.');
  }
};
