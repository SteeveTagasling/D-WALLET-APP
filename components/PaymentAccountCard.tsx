import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import type { PaymentAccount } from '../constants/types';

interface Props {
  account: PaymentAccount;
  onPress?: () => void;
}

export default function PaymentAccountCard({ account, onPress }: Props) {
  const { theme } = useTheme();
  const formatted = `₱${account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: account.bgColor }]}>
          <Text style={[styles.avatarText, { color: account.color }]}>{account.initial}</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{account.name}</Text>
          <Text style={[styles.phone, { color: theme.textMuted }]}>{account.phoneNumber}</Text>
        </View>
      </View>
      <Text style={[styles.balance, { color: theme.primary }]}>{formatted}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.h3, fontWeight: '700' },
  name: { ...Typography.bodyLarge, fontWeight: '600', marginBottom: 2 },
  phone: { ...Typography.bodySmall },
  balance: { ...Typography.amountMedium },
});
