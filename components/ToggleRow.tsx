import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';

interface Props {
  label: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export default function ToggleRow({ label, description, iconName, value, onToggle, onPress, showChevron, destructive }: Props) {
  const { theme } = useTheme();
  const labelColor = destructive ? theme.error : theme.textPrimary;

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.left}>
        {iconName && (
          <View style={[styles.iconCircle, { backgroundColor: theme.surfaceElevated }]}>
            <Ionicons name={iconName} size={18} color={destructive ? theme.error : theme.primary} />
          </View>
        )}
        <View style={styles.textBlock}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          {description && (
            <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
          )}
        </View>
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.borderSubtle, true: theme.primaryMuted }}
          thumbColor={value ? theme.primary : theme.textMuted}
        />
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1, marginRight: Spacing.sm },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  label: { ...Typography.bodyMedium, fontWeight: '500' },
  description: { ...Typography.caption, marginTop: 2 },
});
