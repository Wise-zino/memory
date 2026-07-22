import { C } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function CircleTimer ({ seconds, total, color = C.teal }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const strokeDashoffset = circumference * (1 - progress);
  const urgent = seconds <= 10;

  return (
    <View style={styles.timerWrap}>
      <View style={[styles.timerCircle, { borderColor: urgent ? C.red : color }]}>
        <Text style={[styles.timerText, { color: urgent ? C.red : color }]}>{seconds}</Text>
      </View>
      <Text style={styles.timerLabel}>secs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
      timerWrap: { 
        alignItems: 'center'
      },
      timerCircle: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        borderWidth: 3, 
        alignItems: 'center', 
        justifyContent: 'center'
      },
      timerText: { 
        fontSize: 20, 
        fontWeight: '800' 
      },
      timerLabel: { 
        fontSize: 10, 
        color: C.textDim, 
        marginTop: 2 
      },
})
