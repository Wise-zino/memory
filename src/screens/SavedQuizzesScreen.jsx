import Btn from '@/components/Btn';
import { C } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function SavedQuizzesScreen ({ onBack, savedQuizzes, onDelete, onReplay }) {
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const typeIcon = { word_sequence: '', sentence_recall: '' };
  const typeLabel = { word_sequence: 'Word Sequence', sentence_recall: 'Sentence Recall' };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.padded}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>‹ Back</Text></TouchableOpacity>
      <Text style={styles.screenTitle}>Saved Quizzes</Text>
      <Text style={styles.screenDesc}>Re-attempt saved quizzes to test your long-term memory retention.</Text>

      {savedQuizzes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48 }}></Text>
          <Text style={styles.emptyText}>No saved quizzes yet.</Text>
          <Text style={styles.screenDesc}>After completing a Word Sequence or Sentence Recall challenge, tap "Save This Quiz" to add it here.</Text>
        </View>
      ) : (
        savedQuizzes.map((q, i) => (
          <View key={i} style={styles.savedCard}>
            <View style={styles.savedCardHeader}>
              <Text style={{ fontSize: 28 }}>{typeIcon[q.type]}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.savedCardTitle}>{typeLabel[q.type]}</Text>
                <Text style={styles.savedCardMeta}>{q.difficulty.toUpperCase()} · {formatDate(q.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.savedCardPreview} numberOfLines={2}>
              {q.words ? q.words.join(' → ') : q.sentences?.[0]}
            </Text>
            <View style={[styles.row, { marginTop: 12, gap: 8 }]}>
              <View style={{ flex: 1 }}><Btn label="Replay" onPress={() => onReplay(q)} variant="primary" small /></View>
              <View style={{ flex: 1 }}><Btn label="Delete" onPress={() => onDelete(i)} variant="ghost" small /></View>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    screen: { 
        flex: 1, 
        backgroundColor: C.bg 
    },
    padded: { 
        padding: 20 
    },
    savedCard: { 
        backgroundColor: C.card, 
        borderRadius: 16, 
        padding: 18, 
        marginBottom: 14, 
        borderWidth: 1, 
        borderColor: C.border 
    },
    savedCardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    savedCardTitle: { 
        fontSize: 16, 
        ontWeight: '700', 
        color: C.text 
    },
    savedCardMeta: { 
        fontSize: 12, 
        color: C.textMid, 
        marginTop: 2 
    },
    savedCardPreview: { 
        fontSize: 13, 
        color: C.textDim, 
        lineHeight: 19 
    },
    emptyState: { 
        alignItems: 'center', 
        paddingVertical: 50, 
        gap: 12 
    },
    emptyText: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: C.textMid 
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
    row: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 4 
    },
})