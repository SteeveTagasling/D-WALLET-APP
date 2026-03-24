import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import type { PaymentAccount } from '../constants/types';

// ── GCash official-style SVG logo ─────────────────────────────────────────
function GCashLogoFull({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="gcash_bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0166B1" />
          <Stop offset="1" stopColor="#0077CC" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="20" fill="url(#gcash_bg)" />
      {/* G letter with distinctive GCash style */}
      <Path
        d="M50 16 C30 16 14 32 14 52 C14 72 30 86 50 86 C68 86 82 73 84 56 L60 56 L60 44 L84 44"
        fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M60 50 L84 50" stroke="white" strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

// ── Maya official-style SVG logo ──────────────────────────────────────────
function MayaLogoFull({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="maya_bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#00A651" />
          <Stop offset="1" stopColor="#007A3D" />
        </SvgGradient>
      </Defs>
      <Rect width="100" height="100" rx="20" fill="url(#maya_bg)" />
      {/* Maya M with leaf/nature feel */}
      <Path
        d="M16 74 L16 28 L50 62 L84 28 L84 74"
        fill="none" stroke="white" strokeWidth="8"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Leaf accent dot */}
      <Circle cx="50" cy="20" r="5" fill="white" opacity="0.85" />
    </Svg>
  );
}

// ── Generic bank/e-wallet logo ─────────────────────────────────────────────
function GenericWalletLogo({ initial, bgColor, textColor, size = 46 }: {
  initial: string; bgColor: string; textColor: string; size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="20" fill={bgColor} />
      {/* wallet shape background hint */}
      <Rect x="16" y="30" width="68" height="44" rx="10" fill="rgba(255,255,255,0.15)" />
      <Rect x="56" y="40" width="22" height="20" rx="5" fill="rgba(255,255,255,0.25)" />
      <Circle cx="67" cy="50" r="4" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

function AccountLogo({ account, size = 46 }: { account: PaymentAccount; size?: number }) {
  const name = account.name.toLowerCase();
  if (name.includes('gcash')) return <GCashLogoFull size={size} />;
  if (name.includes('maya') || name.includes('paymaya')) return <MayaLogoFull size={size} />;
  return <GenericWalletLogo initial={account.initial} bgColor={account.bgColor} textColor={account.color} size={size} />;
}

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
        <AccountLogo account={account} size={46} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{account.name}</Text>
          <Text style={[styles.phone, { color: theme.textMuted }]}>{account.phoneNumber}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.balance, { color: theme.primary }]}>{formatted}</Text>
        {account.isLinked && (
          <View style={[styles.linkedBadge, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + '55' }]}>
            <Text style={[styles.linkedText, { color: theme.primary }]}>Linked</Text>
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { gap: 2 },
  name: { fontSize: 15, fontWeight: '700' },
  phone: { fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 5 },
  balance: { fontSize: 17, fontWeight: '800' },
  linkedBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  linkedText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});