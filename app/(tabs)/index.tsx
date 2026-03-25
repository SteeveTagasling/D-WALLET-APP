import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import PaymentAccountCard from '../../components/PaymentAccountCard';
import IDCardItem from '../../components/IDCardItem';
import { loadIDs, loadAccounts, loadUser } from '../../constants/storage';
import type { StoredID, PaymentAccount, UserProfile } from '../../constants/types';

function DWalletMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="bg_mark" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2ECC71" />
          <Stop offset="1" stopColor="#1A9B50" />
        </SvgGradient>
      </Defs>
      <Rect x="8" y="10" width="72" height="80" rx="18" fill="url(#bg_mark)" />
      <Rect x="72" y="38" width="18" height="24" rx="6" fill="rgba(255,255,255,0.35)" />
      <Circle cx="81" cy="50" r="3.5" fill="rgba(255,255,255,0.7)" />
      <Rect x="16" y="18" width="46" height="48" rx="8" fill="rgba(0,0,0,0.28)" />
      <Rect x="37" y="24" width="18" height="36" rx="11" fill="url(#bg_mark)" />
    </Svg>
  );
}

const QUICK_ACTIONS = [
  { id: 'add-id', label: 'Add ID', icon: 'id-card-outline' as const, route: '/ids', color: '#4DA6FF', bg: 'rgba(77,166,255,0.12)' },
  { id: 'add-account', label: 'Wallet', icon: 'wallet-outline' as const, route: '/payments', color: '#2ECC71', bg: 'rgba(46,204,113,0.12)' },
  { id: 'my-qr', label: 'My QR', icon: 'qr-code-outline' as const, route: '/qr', color: '#BF5AF2', bg: 'rgba(191,90,242,0.12)' },
  { id: 'profile', label: 'Profile', icon: 'person-outline' as const, route: '/profile', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
];

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const [ids, setIds] = useState<StoredID[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [loadedIDs, loadedAccounts, loadedUser] = await Promise.all([
      loadIDs(), loadAccounts(), loadUser(),
    ]);
    setIds(loadedIDs);
    setAccounts(loadedAccounts);
    setUser(loadedUser);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const expiringCount = ids.filter((i) => i.status === 'expiring').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* ── Hero ── */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D', '#0D2214'] : ['#0B5C2A', '#16783C', '#1A9B50']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <DWalletMark size={40} />
            <View>
              <Text style={styles.brandName}>D-WALLET</Text>
              <Text style={styles.brandSub}>Digital Finance</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.avatarBtn, { borderColor: 'rgba(255,255,255,0.25)' }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{user?.initials ?? '?'}</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetBlock}>
          <Text style={styles.greetSub}>GOOD DAY</Text>
          <Text style={styles.greetName}>{user?.firstName ?? 'User'} 👋</Text>
        </View>

        {/* Stat Pills */}
        <View style={styles.statsRow}>
          {[
            { value: ids.length, label: 'IDs Stored', icon: 'id-card-outline' as const },
            { value: accounts.length, label: 'Accounts', icon: 'wallet-outline' as const },
            { value: expiringCount, label: 'Expiring', icon: 'warning-outline' as const, warn: expiringCount > 0 },
          ].map((s, i) => (
            <View key={i} style={styles.statPill}>
              <Ionicons name={s.icon} size={13} color={s.warn ? '#F5A623' : 'rgba(255,255,255,0.6)'} />
              <Text style={[styles.statVal, s.warn ? { color: '#F5A623' } : {}]}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {expiringCount > 0 && (
          <View style={styles.alertRow}>
            <Ionicons name="alert-circle" size={13} color="#F5A623" />
            <Text style={styles.alertText}>{expiringCount} ID{expiringCount > 1 ? 's' : ''} expiring soon</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingTop: Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map(({ id, label, icon, route, color, bg }) => (
              <TouchableOpacity
                key={id}
                style={[styles.quickCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
                onPress={() => router.push(route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: bg }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={[styles.quickLabel, { color: theme.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Accounts</Text>
            {accounts.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/payments')} style={styles.seeAll}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                <Ionicons name="chevron-forward" size={13} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          {accounts.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
              onPress={() => router.push('/payments')}
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={28} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No accounts linked yet</Text>
              <View style={[styles.emptyAction, { backgroundColor: theme.primaryMuted }]}>
                <Text style={[styles.emptyActionText, { color: theme.primary }]}>+ Add Account</Text>
              </View>
            </TouchableOpacity>
          ) : (
            accounts.map((account) => (
              <PaymentAccountCard key={account.id} account={account} onPress={() => router.push('/payments')} />
            ))
          )}
        </View>

        {/* My IDs */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>My IDs</Text>
            {ids.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/ids')} style={styles.seeAll}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                <Ionicons name="chevron-forward" size={13} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          {ids.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
              onPress={() => router.push('/ids')}
              activeOpacity={0.8}
            >
              <Ionicons name="id-card-outline" size={28} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No IDs stored yet</Text>
              <View style={[styles.emptyAction, { backgroundColor: theme.primaryMuted }]}>
                <Text style={[styles.emptyActionText, { color: theme.primary }]}>+ Add ID</Text>
              </View>
            </TouchableOpacity>
          ) : (
            ids.slice(0, 2).map((id) => <IDCardItem key={id.id} item={id} onPress={() => router.push('/ids')} />)
          )}
        </View>

        <View style={{ height: 56 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: Spacing.xxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandName: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  brandSub: { fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, fontWeight: '500', marginTop: 1 },
  avatarBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  greetBlock: { marginBottom: 20 },
  greetSub: { fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 2.5, fontWeight: '700', marginBottom: 4 },
  greetName: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statPill: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statVal: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 8, color: 'rgba(255,255,255,0.45)', fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, backgroundColor: 'rgba(245,166,35,0.15)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
  },
  alertText: { fontSize: 12, color: '#F5A623', fontWeight: '600' },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: BorderRadius.xl,
    borderWidth: 1, gap: 10,
  },
  quickIconCircle: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: Spacing.xxl, borderRadius: BorderRadius.xl,
    borderWidth: 1.5, borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, fontWeight: '500' },
  emptyAction: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginTop: 2 },
  emptyActionText: { fontSize: 13, fontWeight: '700' },
});