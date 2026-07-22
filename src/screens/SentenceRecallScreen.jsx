import Badge from '@/components/Badge';
import Btn from '@/components/Btn';
import CircleTimer from '@/components/CircleTimer';
import { C } from "@/constants/theme";
import { pick, shuffle } from "@/utils/helpers";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


let _sentenceData = null;

const getSentenceSets = () => {
  if (!_sentenceData) _sentenceData = require('../data/sentences.json');
  return _sentenceData;
};

// ─────────────────────────────────────────────
// SCREEN: SENTENCE RECALL
// ─────────────────────────────────────────────
export default function SentenceRecallScreen ({ onBack, onSave }) {
  const [phase, setPhase] = useState('config');
  const [difficulty, setDifficulty] = useState('easy');
  const [duration, setDuration] = useState(60);
  const [sentences, setSentences] = useState([]);
  const [questions, setQuestions] = useState([]); // [{n, options, answer}]
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    const set = pick(getSentenceSets()[difficulty]);
    setSentences(set);
    setTimeLeft(duration);
    setPhase('memorize');
  };

  useEffect(() => {
    if (phase === 'memorize') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current); buildQuestions(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, sentences]);

  const buildQuestions = useCallback(() => {
    const qs = sentences.map((correct, idx) => {
      const others = shuffle(sentences.filter((_, i) => i !== idx)).slice(0, 3);
      const includeNone = Math.random() > 0.6; // 40% chance "None of these" is the answer
      let options, answer;
      if (includeNone) {
        options = shuffle([...others, '— None of these —']);
        answer = '— None of these —';
      } else {
        options = shuffle([correct, ...others.slice(0, 3)]);
        answer = correct;
      }
      return { n: idx + 1, options, answer };
    });
    setQuestions(qs);
    setQIndex(0);
    setAnswers([]);
    setPhase('quiz');
  }, [sentences]);

  const answerQ = (choice) => {
    const newAnswers = [...answers, { chosen: choice, correct: questions[qIndex].answer }];
    setAnswers(newAnswers);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      setPhase('result');
    }
  };

  const saveQuiz = () => {
    onSave({ type: 'sentence_recall', difficulty, duration, sentences, createdAt: Date.now() });
  };

  if (phase === 'config') return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>‹ Back</Text></TouchableOpacity>
      <Text style={styles.screenTitle}> Sentence Recall</Text>
      <Text style={styles.screenDesc}>Memorize a set of sentences and their positions. Then answer: "Which sentence was in position N?"</Text>

      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.row}>
        {['easy','medium','hard'].map((d) => (
          <TouchableOpacity key={d} onPress={() => setDifficulty(d)} style={[styles.chip, difficulty === d && styles.chipActive]}>
            <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{d.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Memorization Time</Text>
      <View style={styles.row}>
        {[45,60,90,120].map((s) => (
          <TouchableOpacity key={s} onPress={() => setDuration(s)} style={[styles.chip, duration === s && styles.chipActive]}>
            <Text style={[styles.chipText, duration === s && styles.chipTextActive]}>{s}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 32 }}>
        <Btn label="Start Challenge" onPress={start} variant="teal" />
      </View>
    </ScrollView>
  );

  if (phase === 'memorize') return (
    <View style={[styles.screen]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.memorizeHeader}>
          <Text style={styles.screenTitle}> Memorize Positions</Text>
          <CircleTimer seconds={timeLeft} total={duration} color={C.teal} />
        </View>
        <ScrollView contentContainerStyle={styles.padded}>
          {sentences.map((s, i) => (
            <View key={i} style={styles.sentenceCard}>
              <View style={styles.sentenceNum}>
                <Text style={styles.sentenceNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.sentenceText}>{s}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.padded}>
          <Btn label="I'm Ready — Skip Timer" onPress={() => { clearInterval(timerRef.current); buildQuestions(); }} variant="ghost" />
        </View>
      </SafeAreaView>
    </View>
  );

  if (phase === 'quiz') {
    const q = questions[qIndex];
    return (
      <View style={[styles.screen]}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.padded}>
            <View style={styles.quizProgress}>
              <Text style={styles.quizProgressText}>Question {qIndex + 1} of {questions.length}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${((qIndex) / questions.length) * 100}%` }]} />
              </View>
            </View>

            <Text style={styles.screenTitle}>Which sentence was</Text>
            <Text style={[styles.screenTitle, { color: C.teal, fontSize: 36 }]}>#{q.n} (position {q.n})?</Text>
            <Text style={styles.screenDesc}>Select the sentence that appeared in that position. Choose "None of these" if none match.</Text>

            {q.options.map((opt, i) => (
              <TouchableOpacity key={i} onPress={() => answerQ(opt)} activeOpacity={0.8} style={styles.optionCard}>
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (phase === 'result') {
    const correct = answers.filter((a) => a.chosen === a.correct).length;
    const pct = Math.round((correct / answers.length) * 100);
    const resultColor = pct >= 80 ? C.green : pct >= 50 ? C.gold : C.red;
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
        <Text style={styles.screenTitle}>Result</Text>
        <View style={[styles.resultCard, { borderColor: resultColor }]}>
          <Text style={[styles.resultScore, { color: resultColor }]}>{pct}%</Text>
          <Text style={styles.resultSubtitle}>{correct} / {answers.length} correct</Text>
          <Badge label={pct >= 80 ? 'Sharp Mind!' : pct >= 50 ? 'Good Effort' : 'Try Again'} color={resultColor} />
        </View>

        {questions.map((q, i) => {
          const a = answers[i];
          const ok = a.chosen === a.correct;
          return (
            <View key={i} style={[styles.sentenceCard, { backgroundColor: ok ? C.greenSoft + '44' : C.redSoft + '44', marginBottom: 10 }]}>
              <View style={[styles.sentenceNum, { backgroundColor: ok ? C.green + '55' : C.red + '55' }]}>
                <Text style={styles.sentenceNumText}>#{q.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Correct:</Text>
                <Text style={styles.sentenceText}>{q.answer}</Text>
                {!ok && <><Text style={[styles.label, { color: C.red, marginTop: 6 }]}>You chose:</Text><Text style={[styles.sentenceText, { color: C.red }]}>{a.chosen}</Text></>}
              </View>
            </View>
          );
        })}

        <View style={{ gap: 10, marginTop: 20 }}>
          <Btn label="Save This Quiz" onPress={saveQuiz} variant="gold" />
          <Btn label="Play Again" onPress={() => setPhase('config')} variant="teal" />
          <Btn label="‹ Home" onPress={onBack} variant="ghost" />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: C.bg
  },
  padded: { 
    padding: 20
  },
  backBtn: { 
    marginBottom: 12 
  },
  backText: { 
    color: C.accent, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  screenTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: C.text, 
    marginBottom: 8 
  },
  screenDesc: { 
    fontSize: 14, 
    color: C.textMid, 
    lineHeight: 21, 
    marginBottom: 20 
  },
  label: { 
    fontSize: 12, 
    color: C.textDim, 
    fontWeight: '700', 
    letterSpacing: 1, 
    textTransform: 'uppercase', 
    marginBottom: 10, 
    marginTop: 16 
  },
  row: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginBottom: 4 
  },
  chip: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: C.card, 
    borderWidth: 1, 
    borderColor: C.border 
  },
  chipActive: { 
    backgroundColor: C.accentSoft, 
    borderColor: C.accent 
  },
  chipText:{ 
    color: C.textMid, 
    fontSize: 13, 
    fontWeight: '600' 
  },
  chipTextActive: { 
    color: C.accent 
  },
  badge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginTop: 10 
  },
  badgeText: { 
    fontSize: 13, 
    fontWeight: '700' 
  },
  resultCard: { 
    backgroundColor: C.card, 
    borderRadius: 18, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 24, 
    borderWidth: 2 
  },
  resultScore: { 
    fontSize: 56, 
    fontWeight: '900' 
  },
  resultSubtitle: { 
    color: C.textMid, 
    fontSize: 15, 
    marginTop: 4 
  },
  memorizeHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20 
  },
  sentenceCard: { 
    flexDirection: 'row', 
    backgroundColor: C.card, 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 10, 
    alignItems: 'flex-start' 
  },
  sentenceNum: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: C.tealSoft, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12, 
    marginTop: 2 
  },
  sentenceNumText: { 
    color: C.teal, 
    fontSize: 14, 
    fontWeight: '800' 
  },
  sentenceText: { 
    flex: 1, 
    color: C.text, 
    fontSize: 15, 
    lineHeight: 22 
  },
  quizProgress: { 
    marginBottom: 20 
  },
  quizProgressText: { 
    color: C.textMid, 
    fontSize: 13, 
    marginBottom: 8 
  },
  progressBarBg: { 
    height: 4, 
    backgroundColor: C.border, 
    borderRadius: 2 
  },
  progressBarFill: { 
    height: 4, 
    backgroundColor: C.accent, 
    borderRadius: 2 
  },
  optionCard: { 
    backgroundColor: C.card, 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: C.border, 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  optionLetter: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: C.accentSoft, 
    color: C.accent, 
    fontSize: 13, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 28, 
    marginRight: 12 
  },
  optionText: { 
    flex: 1, 
    color: C.text, 
    fontSize: 15, 
    lineHeight: 22 
  },
  resultCard: { 
    backgroundColor: C.card, 
    borderRadius: 18, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 24, 
    borderWidth: 2 
  },
  resultScore: { 
    fontSize: 56, 
    fontWeight: '900' 
  },
  resultSubtitle: { 
    color: C.textMid, 
    fontSize: 15, 
    marginTop: 4 
  },
  
})