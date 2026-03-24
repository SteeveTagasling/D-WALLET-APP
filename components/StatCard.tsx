import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';

interface Props {
  value: number | string;
  label: string;
  accentColor?: string;
}

export default function StatCard({ value, label, accentColor }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.statCardBg, borderColor: theme.borderSubtle }]}>
      <Text style={[styles.value, { color: accentColor ?? theme.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 72,
  },
  value: { ...Typography.h1, marginBottom: 2 },
  label: { ...Typography.bodySmall },
});
