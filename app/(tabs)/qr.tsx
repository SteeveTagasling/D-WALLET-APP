import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import { mockUser } from '../../constants/mockData';

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
    <View style={{ backgroundColor: bg, padding: cell * 2.5, borderRadius: 16 }}>
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
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D'] : ['#0B5C2A', '#16783C']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My QR</Text>
          <TouchableOpacity
            onPress={() => Share.share({ message: `D-Wallet QR — ${mockUser.firstName} ${mockUser.lastName}` })}
            style={styles.shareBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(['id', 'payment'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === t ? styles.tabTextActive : { color: 'rgba(255,255,255,0.5)' }]}>
                {t === 'id' ? 'Identity QR' : 'Payment QR'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={[styles.body, { backgroundColor: theme.background }]}>
        {/* QR Card */}
        <View style={[styles.qrCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
          <View style={styles.qrUserRow}>
            <View style={[styles.qrAvatar, { backgroundColor: theme.primaryMuted }]}>
              <Text style={[styles.qrAvatarText, { color: theme.primary }]}>
                {mockUser.firstName.charAt(0)}{mockUser.lastName.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={[styles.qrName, { color: theme.textPrimary }]}>{mockUser.firstName} {mockUser.lastName}</Text>
              <Text style={[styles.qrSub, { color: theme.textMuted }]}>{tab === 'id' ? 'Digital Identity' : 'Payment QR'}</Text>
            </View>
          </View>

          <View style={styles.qrBox}>
            <QRDisplay
              size={220}
              color={isDark ? '#1A9B50' : '#0A3A1F'}
              bg={isDark ? '#EAF5EC' : '#FFFFFF'}
            />
          </View>

          <View style={[styles.phoneRow, { backgroundColor: theme.primaryMuted, borderColor: theme.border }]}>
            <Ionicons name="call-outline" size={14} color={theme.primary} />
            <Text style={[styles.phoneText, { color: theme.primary }]}>{mockUser.phone}</Text>
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          {tab === 'id' ? 'Show this to verify your identity' : 'Let others scan to send you money'}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]} activeOpacity={0.75}>
            <Ionicons name="download-outline" size={19} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={() => Share.share({ message: `D-Wallet QR — ${mockUser.firstName} ${mockUser.lastName}` })}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={19} color={theme.textInverse} />
            <Text style={[styles.actionText, { color: theme.textInverse }]}>Share QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24, padding: 4, gap: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 24 },
  qrCard: {
    width: '100%', borderRadius: BorderRadius.xxl,
    borderWidth: 1, padding: 24, alignItems: 'center',
  },
  qrUserRow: { flexDirection: 'row', alignItems: 'center', gap: 14, alignSelf: 'flex-start', marginBottom: 24, width: '100%' },
  qrAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  qrAvatarText: { fontSize: 16, fontWeight: '800' },
  qrName: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  qrSub: { fontSize: 12, marginTop: 2 },
  qrBox: { marginBottom: 20 },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  phoneText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 16, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  actionText: { fontSize: 14, fontWeight: '700' },
});