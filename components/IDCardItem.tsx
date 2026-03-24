import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import type { StoredID } from '../constants/types';

interface Props {
  item: StoredID;
  onPress?: () => void;
}

export default function IDCardItem({ item, onPress }: Props) {
  const { theme } = useTheme();

  const statusLabel = { valid: 'Valid', expiring: 'Expiring', expired: 'Expired' };
  const statusColor = {
    valid: theme.badgeValid,
    expiring: theme.badgeExpiring,
    expired: theme.error,
  };
  const statusBg = {
    valid: theme.primaryMuted,
    expiring: '#3D2D0A',
    expired: '#3D0A0A',
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: theme.surfaceElevated }]}>
          <Text style={styles.icon}>{item.iconEmoji}</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.expiry, { color: theme.textMuted }]}>{item.expiryDisplay}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: statusBg[item.status], borderColor: statusColor[item.status] }]}>
        <Text style={[styles.badgeText, { color: statusColor[item.status] }]}>
          {statusLabel[item.status]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  name: { ...Typography.bodyLarge, fontWeight: '600', marginBottom: 2 },
  expiry: { ...Typography.bodySmall },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: { ...Typography.labelSmall, fontWeight: '700' },
});
