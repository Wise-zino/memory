import Badge from '@/components/Badge';
import Btn from '@/components/Btn';
import CircleTimer from '@/components/CircleTimer';
import { C } from "@/constants/theme";
import { pick, shuffle } from "@/utils/helpers";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


let _wordData = null;

const getWordLists = () => {
  if (!_wordData) _wordData = require('../data/words.json');
  return _wordData;
};

// ─────────────────────────────────────────────
// SCREEN: WORD SEQUENCE
// ─────────────────────────────────────────────
export default function WordSequenceScreen ({ onBack, onSave }) {
  const [phase, setPhase] = useState('config'); // config | memorize | recall | result
  const [difficulty, setDifficulty] = useState('easy');
  const [duration, setDuration] = useState(60);
  const [words, setWords] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(null);
  const timerRef = useRef(null);

  const start = () => {
    const list = pick(getWordLists()[difficulty]);
    setWords(list);
    setShuffled(shuffle(list));
    setSelected([]);
    setTimeLeft(duration);
    setPhase('memorize');
  };

  useEffect(() => {
    if (phase === 'memorize') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase('recall'); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const toggleSelect = (word) => {
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else {
      setSelected([...selected, word]);
    }
  };

  const submit = () => {
    let correct = 0;
    selected.forEach((w, i) => { if (words[i] === w) correct++; });
    setScore({ correct, total: words.length });
    setPhase('result');
  };

  const saveQuiz = () => {
    onSave({ type: 'word_sequence', difficulty, duration, words, createdAt: Date.now() });
  };

  if (phase === 'config') return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={styles.screenTitle}> Word Sequence</Text>
      <Text style={styles.screenDesc}>Memorize a list of words in order. When time is up, reconstruct the correct sequence by tapping words.</Text>

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
        {[30,60,90,120].map((s) => (
          <TouchableOpacity key={s} onPress={() => setDuration(s)} style={[styles.chip, duration === s && styles.chipActive]}>
            <Text style={[styles.chipText, duration === s && styles.chipTextActive]}>{s}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 32 }}>
        <Btn label="Start Challenge" onPress={start} variant="primary" />
      </View>
    </ScrollView>
  );

  if (phase === 'memorize') return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.memorizeHeader}>
          <Text style={styles.screenTitle}> Memorize the Order</Text>
          <CircleTimer seconds={timeLeft} total={duration} color={C.teal} />
        </View>
        <ScrollView contentContainerStyle={styles.padded}>
          {words.map((w, i) => (
            <View key={i} style={styles.wordRow}>
              <Text style={styles.wordIndex}>{i + 1}</Text>
              <Text style={styles.wordText}>{w}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.padded}>
          <Btn label="I'm Ready — Skip Timer" onPress={() => { clearInterval(timerRef.current); setPhase('recall'); }} variant="ghost" />
        </View>
      </SafeAreaView>
    </View>
  );

  if (phase === 'recall') return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.padded}>
          <Text style={styles.screenTitle}> Rebuild the Sequence</Text>
          <Text style={styles.screenDesc}>Tap words in the original order. Your taps are numbered.</Text>

          {/* Selected order */}
          <View style={styles.selectedBox}>
            {selected.length === 0
              ? <Text style={styles.placeholder}>Your sequence appears here…</Text>
              : selected.map((w, i) => (
                  <View key={i} style={styles.selectedChip}>
                    <Text style={styles.selectedChipNum}>{i + 1}</Text>
                    <Text style={styles.selectedChipText}>{w}</Text>
                  </View>
                ))
            }
          </View>

          {/* Word bank */}
          <View style={styles.wordBank}>
            {shuffled.map((w) => {
              const picked = selected.includes(w);
              return (
                <TouchableOpacity key={w} onPress={() => toggleSelect(w)} style={[styles.wordBankItem, picked && styles.wordBankItemPicked]}>
                  <Text style={[styles.wordBankText, picked && { color: C.textDim }]}>{w}</Text>
                  {picked && <Text style={{ color: C.textDim, marginLeft: 6 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected.length === words.length && (
            <Btn label="Submit Answer" onPress={submit} variant="teal" />
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  if (phase === 'result') {
    const pct = Math.round((score.correct / score.total) * 100);
    const resultColor = pct >= 80 ? C.green : pct >= 50 ? C.gold : C.red;
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
        <Text style={styles.screenTitle}> Result</Text>
        <View style={[styles.resultCard, { borderColor: resultColor }]}>
          <Text style={[styles.resultScore, { color: resultColor }]}>{pct}%</Text>
          <Text style={styles.resultSubtitle}>{score.correct} / {score.total} words in correct position</Text>
          <Badge label={pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good Try' : 'Keep Practicing'} color={resultColor} />
        </View>

        <Text style={styles.label}>Correct Order</Text>
        {words.map((w, i) => {
          const userW = selected[i];
          const ok = userW === w;
          return (
            <View key={i} style={[styles.wordRow, { backgroundColor: ok ? C.greenSoft + '55' : C.redSoft + '55', borderRadius: 8, marginBottom: 6 }]}>
              <Text style={styles.wordIndex}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordText}>{w}</Text>
                {!ok && <Text style={{ color: C.red, fontSize: 12 }}>You said: {userW || '—'}</Text>}
              </View>
              <Text style={{ fontSize: 18 }}>{ok ? '✅' : '❌'}</Text>
            </View>
          );
        })}

        <View style={{ gap: 10, marginTop: 20 }}>
          <Btn label="Save This Quiz" onPress={saveQuiz} variant="gold" />
          <Btn label="Play Again" onPress={() => setPhase('config')} variant="primary" />
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
  wordRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.card, 
    padding: 14, 
    borderRadius: 10, 
    marginBottom: 8 
  },
  wordIndex: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: C.accentSoft, 
    color: C.accent, 
    fontSize: 14, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 30, 
    marginRight: 12 
  },
  wordText: { 
    fontSize: 16, 
    color: C.text, 
    fontWeight: '500', 
    flex: 1 
  },
  selectedBox: { 
    backgroundColor: C.surface, 
    borderRadius: 14, 
    padding: 14, 
    minHeight: 70, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: C.border 
  },
  placeholder: { 
    color: C.textDim, 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginTop: 10 
  },
  selectedChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.accentSoft, 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 6 
  },
  selectedChipNum: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    backgroundColor: C.accent, 
    color: C.white, 
    fontSize: 12, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 22, 
    marginRight: 8 
  },
  selectedChipText: { 
    color: C.text, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  wordBank: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 24 
  },
  wordBankItem: { 
    backgroundColor: C.card, 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: C.border, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  wordBankItemPicked: { 
    backgroundColor: C.surface, 
    borderColor: C.textDim 
  },
  wordBankText: { 
    color: C.text, 
    fontSize: 14, 
    fontWeight: '600' 
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