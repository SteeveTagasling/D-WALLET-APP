import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import type { PaymentAccount } from '../constants/types';

function GCashLogo({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="gcash_bg2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0166B1" />
          <Stop offset="1" stopColor="#0077CC" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" fill="url(#gcash_bg2)" />
      <Path d="M50 16 C30 16 14 32 14 52 C14 72 30 86 50 86 C68 86 82 73 84 56 L60 56 L60 44 L84 44"
        fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M60 50 L84 50" stroke="white" strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

function MayaLogo({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="maya_bg2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#00A651" />
          <Stop offset="1" stopColor="#007A3D" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="22" fill="url(#maya_bg2)" />
      <Path d="M16 74 L16 28 L50 62 L84 28 L84 74"
        fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="50" cy="20" r="5" fill="white" opacity="0.85" />
    </Svg>
  );
}

function GenericLogo({ bgColor, initial, size = 46 }: { bgColor: string; initial: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="22" fill={bgColor} />
      <Rect x="16" y="32" width="68" height="40" rx="9" fill="rgba(255,255,255,0.18)" />
      <Rect x="56" y="42" width="22" height="18" rx="5" fill="rgba(255,255,255,0.28)" />
      <Circle cx="67" cy="51" r="4" fill="rgba(255,255,255,0.55)" />
    </Svg>
  );
}

function AccountLogo({ account, size = 46 }: { account: PaymentAccount; size?: number }) {
  const name = account.name.toLowerCase();
  if (name.includes('gcash')) return <GCashLogo size={size} />;
  if (name.includes('maya') || name.includes('paymaya')) return <MayaLogo size={size} />;
  return <GenericLogo bgColor={account.bgColor} initial={account.initial} size={size} />;
}

export default function PaymentAccountCard({ account, onPress }: { account: PaymentAccount; onPress?: () => void }) {
  const { theme } = useTheme();
  const formatted = `₱${account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={styles.logoWrap}>
          <AccountLogo account={account} size={44} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{account.name}</Text>
          <Text style={[styles.phone, { color: theme.textMuted }]}>{account.phoneNumber}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.balance, { color: theme.primary }]}>{formatted}</Text>
        {account.isLinked && (
          <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>● Linked</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  logoWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  info: { gap: 3, flex: 1 },
  name: { fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  phone: { fontSize: 12, letterSpacing: 0.2 },
  right: { alignItems: 'flex-end', gap: 6 },
  balance: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
});