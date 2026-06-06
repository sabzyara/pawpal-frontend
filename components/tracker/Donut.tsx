import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  value: number;
  max: number;
  label?: string;
  size?: number;
};

export default function Donut({
  value,
  max,
  label,
  size = 200,
}: Props) {
  const radius = size * 0.4;
const strokeWidth = size * 0.12;
  const circumference = 2 * Math.PI * radius;

  const progress = value / max;
  const strokeDashoffset = circumference - circumference * progress;

  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        
        {/* Background (remaining) */}
        <Circle
          stroke={colors.tracker.secondary} // 🔥 вместо хардкода
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <Circle
          stroke={colors.tracker.primary} // 🔥 вместо хардкода
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2},${size / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text
          style={[
            styles.value,
            {
              color: colors.text.primary,
              fontSize: size * 0.14,
            },
          ]}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.max,
            {
              color: colors.text.secondary,
              fontSize: size * 0.08,
            },
          ]}
        >
          / {max}
        </Text>
        {label && (
          <Text style={[styles.label, { color: colors.text.tertiary }]}>
            {label}
          </Text>
        )}
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