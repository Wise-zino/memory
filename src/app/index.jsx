import { C } from '@/constants/theme';
import HomeScreen from '@/screens/HomeScreen';
import MentalMathScreen from '@/screens/MentalMathScreen';
import SavedQuizzesScreen from '@/screens/SavedQuizzesScreen';
import SentenceRecallScreen from '@/screens/SentenceRecallScreen';
import WordSequenceScreen from '@/screens/WordSequenceScreen';
import { loadSaved, persistSaved } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function MemoryApp() {
  const [screen, setScreen] = useState('home');
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [replayData, setReplayData] = useState(null);

  // Load saved quizzes on mount
  useEffect(() => {
    loadSaved().then(setSavedQuizzes).catch(() => {});
  }, []);

  const handleSave = async (quiz) => {
    const updated = [quiz, ...savedQuizzes];
    setSavedQuizzes(updated);
    await persistSaved(updated);
    Alert.alert('Saved! ', 'This quiz has been saved for later.');
  };

  const handleDelete = async (index) => {
    Alert.alert('Delete Quiz', 'Are you sure you want to delete this saved quiz?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = savedQuizzes.filter((_, i) => i !== index);
          setSavedQuizzes(updated);
          await persistSaved(updated);
        }
      }
    ]);
  };

  const handleReplay = (quiz) => {
    setReplayData(quiz);
    setScreen(quiz.type);
  };

  const navigate = (dest) => { setReplayData(null); setScreen(dest); };
  const goHome = () => { setReplayData(null); setScreen('home'); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {screen === 'home'           && <HomeScreen onNavigate={navigate} />}
      {screen === 'word_sequence'  && <WordSequenceScreen onBack={goHome} onSave={handleSave} />}
      {screen === 'sentence_recall'&& <SentenceRecallScreen onBack={goHome} onSave={handleSave} />}
      {screen === 'mental_math'    && <MentalMathScreen onBack={goHome} />}
      {screen === 'saved_quizzes'  && (
        <SavedQuizzesScreen
          onBack={goHome}
          savedQuizzes={savedQuizzes}
          onDelete={handleDelete}
          onReplay={handleReplay}
        />
      )}
    </SafeAreaView>
  );
}
