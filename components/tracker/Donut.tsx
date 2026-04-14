import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  value: number;
  max: number;
  label?: string;
};

export default function Donut({ value, max, label }: Props) {
    
  const radius = 80;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * radius;

  const progress = value / max;
  const strokeDashoffset = circumference - circumference * progress;

    const { colors } = useTheme();
  

  return (
    <View style={styles.container}>
      <Svg width={200} height={200}>
        {/* Background (remaining) */}
        <Circle
          stroke="#FFC7C7"
          fill="none"
          cx="100"
          cy="100"
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress (consumed/done) */}
        <Circle
          stroke="#FF6B6B"
          fill="none"
          cx="100"
          cy="100"
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin="100,100"
        />
      </Svg>

      {/* Center text */}
      <View style={styles.center}>
        <Text style={[styles.value, { color: colors.text.primary }]}>{value}</Text>
        <Text style={[styles.max, { color: colors.text.secondary }]}>{max}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: {
    position: 'absolute',
    alignItems: 'center',
  },

  value: {
    fontSize: 28,
    fontWeight: '700',
  },

  max: {
    fontSize: 16,
  },

  label: {
    marginTop: 4,
    fontSize: 12,
  },
});