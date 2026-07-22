import { C } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function Badge ({ label, color = C.accent }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
} 

const styles = StyleSheet.create({
    badge:   { 
        alignSelf: 'flex-start', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20, 
        borderWidth: 1, 
        marginTop: 10 
    },
    badgeText:  { 
        fontSize: 13, 
        fontWeight: '700' 
    },
})