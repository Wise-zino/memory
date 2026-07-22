import { C } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";


export default function PulseCircle ({ color = C.accent, size = 80 }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  
  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }]}>
      <View style={{ width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, backgroundColor: color + '55' }} />
    </Animated.View>
  );
};