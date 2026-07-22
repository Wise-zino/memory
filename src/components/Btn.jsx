import { C } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Btn ({ label, onPress, variant = 'primary', disabled = false, small = false }) {
  const bg = variant === 'primary' ? C.accent
           : variant === 'teal'    ? C.teal
           : variant === 'gold'    ? C.gold
           : variant === 'red'     ? C.red
           : variant === 'ghost'   ? 'transparent'
           : C.card;
  const textColor = (variant === 'ghost' || variant === 'outline') ? C.textMid : '#000';
  const border = variant === 'ghost' ? C.border : 'transparent';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.btn, small && styles.btnSmall, { backgroundColor: disabled ? C.border : bg, borderColor: border, borderWidth: variant === 'ghost' ? 1 : 0, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.btnText, small && styles.btnTextSmall, { color: (variant === 'ghost' || variant === 'outline') ? C.textMid : variant === 'primary' ? C.white : '#000' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { 
    borderRadius: 14, 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnSmall: { 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 10 
  },
  btnText: { 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: 0.3 
  },
  btnTextSmall: { 
    fontSize: 13 
  },
})