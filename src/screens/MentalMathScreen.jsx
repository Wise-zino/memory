import Badge from '@/components/Badge';
import Btn from '@/components/Btn';
import { C } from "@/constants/theme";
import { shuffle } from "@/utils/helpers";
import { generateDistractors, generateMathBatch } from '@/utils/mathGenerator';
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function MentalMathScreen ({ onBack }) {
  const [phase, setPhase] = useState('config');
  const [difficulty, setDifficulty] = useState('easy');
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [qNum, setQNum] = useState(0);
  const totalQ = 8;
  const [userInput, setUserInput] = useState('');
  const [mode, setMode] = useState('mcq'); // 'mcq' | 'typed'
  const [results, setResults] = useState([]);

  const start = () => {
    const chosen = generateMathBatch(difficulty, totalQ);
    setPool(chosen);
    setScore(0);
    setQNum(0);
    setResults([]);
    loadQ(chosen, 0, mode);
    setPhase('quiz');
  };

  const loadQ = (p, idx, currentMode) => {
    if (!p || idx >= p.length) return;
    const q = p[idx];
    if (!q) return;
    setCurrent(q);
    setAnswered(null);
    setUserInput('');
    if (currentMode === 'mcq') {
      const distractors = generateDistractors(q.a, 3);
      setOptions(shuffle([q.a, ...distractors]));
    }
  };

  const handleAnswer = (val) => {
    if (answered) return;
    const correct = val === current.a;
    setAnswered(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
    const updatedResults = [...results, { q: current.q, answer: current.a, given: val, correct }];
    setResults(updatedResults);
    const next = qNum + 1;
    setTimeout(() => {
      if (next >= pool.length) { setPhase('result'); return; }
      setQNum(next);
      loadQ(pool, next, mode);
    }, 900);
  };

  const handleTyped = () => {
    const parsed = parseInt(userInput.replace(/,/g, ''), 10);
    if (isNaN(parsed)) { Alert.alert('Invalid Input', 'Please enter a valid number.'); return; }
    handleAnswer(parsed);
  };

  if (phase === 'config') return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>‹ Back</Text></TouchableOpacity>
      <Text style={styles.screenTitle}>🧮 Mental Math</Text>
      <Text style={styles.screenDesc}>Quick arithmetic challenges to sharpen mental calculation speed and accuracy.</Text>

      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.row}>
        {['easy','medium','hard'].map((d) => (
          <TouchableOpacity key={d} onPress={() => setDifficulty(d)} style={[styles.chip, difficulty === d && { ...styles.chipActive, backgroundColor: C.gold + '33', borderColor: C.gold }]}>
            <Text style={[styles.chipText, difficulty === d && { color: C.gold }]}>{d.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Answer Mode</Text>
      <View style={styles.row}>
        {[['mcq','Multiple Choice'],['typed','Type Answer']].map(([val, lbl]) => (
          <TouchableOpacity key={val} onPress={() => setMode(val)} style={[styles.chip, mode === val && { ...styles.chipActive, backgroundColor: C.gold + '33', borderColor: C.gold }]}>
            <Text style={[styles.chipText, mode === val && { color: C.gold }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 32 }}>
        <Btn label={`Start (${totalQ} Questions)`} onPress={start} variant="gold" />
      </View>
    </ScrollView>
  );

  if (phase === 'quiz') {
    const feedbackColor = answered === 'correct' ? C.green : answered === 'wrong' ? C.red : C.border;
    return (
      <View style={[styles.screen]}>
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>{qNum + 1} / {totalQ}  ·  Score: {score}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(qNum / totalQ) * 100}%`, backgroundColor: C.gold }]} />
            </View>
          </View>

          <View style={[styles.mathCard, { borderColor: feedbackColor }]}>
            <Text style={styles.mathQ}>{current?.q}</Text>
            {answered && (
              <Text style={[styles.mathFeedback, { color: answered === 'correct' ? C.green : C.red }]}>
                {answered === 'correct' ? '✓ Correct!' : `✗ Answer: ${current?.a}`}
              </Text>
            )}
          </View>

          {mode === 'mcq' ? (
            <View style={styles.mathOptions}>
              {options.map((opt, i) => {
                let bg = C.card;
                if (answered) {
                  if (opt === current.a) bg = C.greenSoft;
                  else if (opt !== current.a && answered === 'wrong') bg = C.redSoft;
                }
                return (
                  <TouchableOpacity key={i} onPress={() => handleAnswer(opt)} disabled={!!answered} style={[styles.mathOption, { backgroundColor: bg, borderColor: answered && opt === current.a ? C.green : C.border }]}>
                    <Text style={styles.mathOptionText}>{opt.toLocaleString()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={{ marginTop: 20 }}>
              <TextInput
                style={styles.mathInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your answer…"
                placeholderTextColor={C.textDim}
                keyboardType="numeric"
                editable={!answered}
              />
              <Btn label="Submit" onPress={handleTyped} variant="gold" disabled={!!answered || !userInput} />
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }

  if (phase === 'result') {
    const total = pool.length || results.length;
    const pct = Math.round((score / total) * 100);
    const resultColor = pct >= 80 ? C.green : pct >= 50 ? C.gold : C.red;
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
        <Text style={styles.screenTitle}>🧮 Math Results</Text>
        <View style={[styles.resultCard, { borderColor: resultColor }]}>
          <Text style={[styles.resultScore, { color: resultColor }]}>{pct}%</Text>
          <Text style={styles.resultSubtitle}>{score} / {total} correct</Text>
          <Badge label={pct >= 80 ? '⚡ Lightning Fast!' : pct >= 50 ? '📐 Not Bad' : '🔁 Practice More'} color={resultColor} />
        </View>

        {results.map((r, i) => (
          <View key={i} style={[styles.wordRow, { backgroundColor: r.correct ? C.greenSoft + '55' : C.redSoft + '55', borderRadius: 8, marginBottom: 8 }]}>
            <Text style={{ flex: 1, color: C.text, fontSize: 15 }}>{r.q}</Text>
            <Text style={{ color: r.correct ? C.green : C.red, fontWeight: 'bold' }}>{r.answer}</Text>
          </View>
        ))}

        <View style={{ gap: 10, marginTop: 20 }}>
          <Btn label="Play Again" onPress={() => setPhase('config')} variant="gold" />
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
  mathCard: { 
    backgroundColor: C.card, 
    borderRadius: 18, 
    padding: 28, 
    alignItems: 'center', 
    marginVertical: 20, 
    borderWidth: 2, 
    minHeight: 120, 
    justifyContent: 'center' 
  },
  mathQ: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: C.text, 
    letterSpacing: 0.5 
  },
  mathFeedback: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 10 
  },
  mathOptions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  mathOption: { 
    flex: 1, 
    minWidth: '40%', 
    backgroundColor: C.card, 
    borderRadius: 14, 
    padding: 20, 
    alignItems: 'center', 
    borderWidth: 1 
  },
  mathOptionText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: C.text 
  },
  mathInput: { 
    backgroundColor: C.card, 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 22, 
    color: C.text, 
    textAlign: 'center', 
    borderWidth: 1, 
    borderColor: C.border, 
    marginBottom: 14 
  },
  quizProgress: { 
    marginBottom: 20 
  },
  quizProgressText: { 
    color: C.textMid, 
    fontSize: 13, 
    marginBottom: 8 
  },
  progressBarBg:  { 
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
})
