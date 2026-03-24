import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import { mockUser } from '../constants/mockData';

function QRDisplay({ size = 200, color = '#000', bg = '#FFF' }: { size?: number; color?: string; bg?: string }) {
  const cell = Math.floor(size / 21);
  const grid = Array.from({ length: 21 }, (_, r) =>
    Array.from({ length: 21 }, (_, c) => {
      const tl = r < 7 && c < 7;
      const tr = r < 7 && c >= 14;
      const bl = r >= 14 && c < 7;
      if (tl || tr || bl) {
        const border = r === 0 || r === 6 || c === 0 || c === 6 ||
          (tr && (c === 14 || c === 20)) || (bl && (r === 14 || r === 20));
        const inner = (tl && r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (tr && r >= 2 && r <= 4 && c >= 16 && c <= 18) ||
          (bl && r >= 16 && r <= 18 && c >= 2 && c <= 4);
        return border || inner;
      }
      return (r * 3 + c * 7 + r * c) % 3 === 0;
    })
  );
  return (
    <View style={{ backgroundColor: bg, padding: cell * 2, borderRadius: 12 }}>
      {grid.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((filled, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: filled ? color : bg }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function QRScreen() {
  const { theme, isDark } = useTheme();
  const [tab, setTab] = useState<'id' | 'payment'>('id');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>My QR Code</Text>
        <TouchableOpacity onPress={() => Share.share({ message: `D-Wallet QR — ${mockUser.firstName} ${mockUser.lastName}` })} activeOpacity={0.75}>
          <Ionicons name="share-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab */}
      <View style={[styles.tabRow, { backgroundColor: theme.backgroundSecondary }]}>
        {(['id', 'payment'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, { backgroundColor: tab === t ? theme.primary : 'transparent' }]}
            onPress={() => setTab(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, { color: tab === t ? theme.textInverse : theme.textSecondary }]}>
              {t === 'id' ? 'ID QR' : 'Payment QR'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.body}>
        <View style={[styles.qrCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
          <Text style={[styles.qrName, { color: theme.textPrimary }]}>{mockUser.firstName} {mockUser.lastName}</Text>
          <Text style={[styles.qrSub, { color: theme.textMuted }]}>{tab === 'id' ? 'Digital Identity QR' : 'Payment QR'}</Text>
          <View style={styles.qrWrap}>
            <QRDisplay size={210} color={isDark ? '#1A7A3C' : '#0D2818'} bg={isDark ? '#F0FAF3' : '#FFFFFF'} />
          </View>
          <View style={[styles.infoBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <Ionicons name="person-circle-outline" size={18} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{mockUser.phone}</Text>
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          {tab === 'id' ? 'Show this QR to verify your digital identity' : 'Let others scan to send you money instantly'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.quickActionBg, borderColor: theme.border }]} activeOpacity={0.75}>
            <Ionicons name="download-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={() => Share.share({ message: `D-Wallet QR — ${mockUser.firstName} ${mockUser.lastName}` })}
            activeOpacity={0.75}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.textInverse} />
            <Text style={[styles.actionBtnText, { color: theme.textInverse }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1,
  },
  title: { ...Typography.h1 },
  tabRow: { flexDirection: 'row', margin: Spacing.xl, borderRadius: BorderRadius.full, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: 'center' },
  tabText: { ...Typography.labelMedium, fontWeight: '700' },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl },
  qrCard: { width: '100%', borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.xxl, alignItems: 'center' },
  qrName: { ...Typography.h2, marginBottom: 4 },
  qrSub: { ...Typography.bodySmall, marginBottom: Spacing.xl },
  qrWrap: { marginBottom: Spacing.xl, borderRadius: 12, overflow: 'hidden' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  infoText: { ...Typography.bodySmall },
  hint: { ...Typography.bodySmall, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  actions: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  actionBtnText: { ...Typography.labelMedium, fontWeight: '700' },
});
