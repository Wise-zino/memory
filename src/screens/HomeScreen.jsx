import PulseCircle from "@/components/PulseCircle";
import { C } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function HomeScreen ({ onNavigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const modules = [
    { id: 'word_sequence', label: 'Word Sequence', desc: 'Memorize words in order', icon: '', color: C.accent, bg: C.accentSoft },
    { id: 'sentence_recall', label: 'Sentence Recall', desc: 'Remember sentence positions', icon: '', color: C.teal,   bg: C.tealSoft  },
    { id: 'mental_math',    label: 'Mental Math',    desc: 'Quick arithmetic challenges', icon: '', color: C.gold,   bg: C.goldSoft  },
    { id: 'saved_quizzes',  label: 'Saved Quizzes',  desc: 'Revisit your saved sets',    icon: '', color: C.textMid, bg: C.border    },
  ];

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.homePad}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Header */}
        <View style={styles.homeHeader}>
          <PulseCircle color={C.accent} size={60} />
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.appName}>Memory</Text>
            <Text style={styles.appTagline}>Train your mind. Sharpen your edge.</Text>
          </View>
        </View>

        {/* Streak / stat bar */}
        <View style={styles.statBar}>
          {[['','Train Daily'],['','Stay Sharp'],['','Grow Smarter']].map(([icon, label]) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Mode cards */}
        <Text style={styles.sectionTitle}>Choose a Challenge</Text>
        {modules.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => onNavigate(m.id)}
            activeOpacity={0.8}
            style={[styles.moduleCard, { borderLeftColor: m.color }]}
          >
            <View style={[styles.moduleIcon, { backgroundColor: m.bg }]}>
              <Text style={{ fontSize: 24 }}>{m.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.moduleName, { color: m.color }]}>{m.label}</Text>
              <Text style={styles.moduleDesc}>{m.desc}</Text>
            </View>
            <Text style={{ color: C.textDim, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footerNote}>Designed and Built by Wise Ewomazino</Text>
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
    homePad: { 
        padding: 24, 
        paddingTop: Platform.OS === 'android' ? 40 : 24 
    },
    homeHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 28, 
        marginTop: 10 
    },
    appName: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: C.text, 
        letterSpacing: 0.5 
    },
    appTagline: { 
        fontSize: 13, 
        color: C.textMid, 
        marginTop: 2 
    },
    statBar: { 
        flexDirection: 'row', 
        backgroundColor: C.card, 
        borderRadius: 14, 
        padding: 14, 
        marginBottom: 28, 
        justifyContent: 'space-around' 
    },
    statItem: { 
        alignItems: 'center', 
        gap: 4 
    },
    statIcon: { 
        fontSize: 22 
    },
    statLabel: { 
        fontSize: 11, 
        color: C.textMid, 
        fontWeight: '600' 
    },
    sectionTitle: { 
        fontSize: 13, 
        color: C.textDim, 
        fontWeight: '700',
        letterSpacing: 1.2, 
        textTransform: 'uppercase', 
        marginBottom: 14 
    },
    moduleCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: C.card, 
        borderRadius: 14, 
        padding: 16, 
        marginBottom: 12, 
        borderLeftWidth: 3 
    },
    moduleIcon: { 
        width: 48, 
        height: 48, 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    moduleName: { 
        fontSize: 16, 
        fontWeight: '700' 
    },
    moduleDesc: { 
        fontSize: 13, 
        color: C.textMid, 
        marginTop: 2 
    },
    footerNote: { 
        textAlign: 'center', 
        color: C.textDim, 
        fontSize: 12, 
        marginTop: 28 
    },
})
