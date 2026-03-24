import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient as SvgGradient, Stop, ClipPath, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import PaymentAccountCard from '../components/PaymentAccountCard';
import IDCardItem from '../components/IDCardItem';
import { loadIDs, loadAccounts, loadUser } from '../constants/storage';
import type { StoredID, PaymentAccount, UserProfile } from '../constants/types';

// ── D-Wallet official logo mark (wallet D shape) ──────────────────────────
function DWalletLogoMark({ size = 42 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2ECC71" />
          <Stop offset="1" stopColor="#1A9B50" />
        </SvgGradient>
        <SvgGradient id="dgrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0D2818" />
          <Stop offset="1" stopColor="#163320" />
        </SvgGradient>
      </Defs>
      {/* Outer wallet body */}
      <Rect x="8" y="10" width="72" height="80" rx="16" fill="url(#bg)" />
      {/* Leather clasp strap */}
      <Rect x="72" y="38" width="18" height="24" rx="5" fill="#1A9B50" />
      <Circle cx="81" cy="50" r="3.5" fill="#0D5C2A" />
      {/* Card slots at bottom */}
      <Rect x="16" y="72" width="20" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
      <Rect x="40" y="72" width="20" height="10" rx="3" fill="rgba(255,255,255,0.18)" />
      {/* The D letter cut-out */}
      <Rect x="16" y="18" width="46" height="48" rx="6" fill="url(#dgrad)" />
      <Rect x="38" y="24" width="18" height="36" rx="10" fill="url(#bg)" />
      {/* Stitching dots */}
      <Circle cx="20" cy="22" r="1.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="20" cy="84" r="1.5" fill="rgba(255,255,255,0.3)" />
      <Circle cx="74" cy="22" r="1.5" fill="rgba(255,255,255,0.3)" />
    </Svg>
  );
}

// ── GCash logo SVG ─────────────────────────────────────────────────────────
function GCashLogo({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="18" fill="#0070E0" />
      {/* G shape */}
      <Path
        d="M50 18 C32 18 18 32 18 50 C18 68 32 82 50 82 C65 82 77 71 80 57 L58 57 L58 43 L80 43 C77 29 65 18 50 18 Z"
        fill="white"
      />
      <Rect x="50" y="43" width="30" height="14" rx="0" fill="#0070E0" />
    </Svg>
  );
}

// ── Maya (PayMaya) logo SVG ────────────────────────────────────────────────
function MayaLogo({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="18" fill="#4CAF50" />
      {/* M shape stylized */}
      <Path
        d="M18 70 L18 30 L35 55 L50 30 L65 55 L82 30 L82 70"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ── PhilSys / ID generic SVG logo ─────────────────────────────────────────
function IDCardLogo({ color = '#3B82F6', size = 36 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="18" fill={color} />
      <Rect x="14" y="28" width="72" height="44" rx="7" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2.5" />
      <Circle cx="31" cy="48" r="10" fill="rgba(255,255,255,0.9)" />
      <Rect x="46" y="38" width="28" height="5" rx="2.5" fill="white" />
      <Rect x="46" y="47" width="20" height="5" rx="2.5" fill="rgba(255,255,255,0.65)" />
      <Rect x="46" y="56" width="24" height="4" rx="2" fill="rgba(255,255,255,0.45)" />
    </Svg>
  );
}

// ── Quick Action SVG icons ─────────────────────────────────────────────────
function AddIDIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="5" width="22" height="14" rx="3" stroke="#3B82F6" strokeWidth="1.8" />
      <Circle cx="7" cy="12" r="2.5" stroke="#3B82F6" strokeWidth="1.5" />
      <Path d="M11.5 10h6M11.5 14h4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M19 3v4M17 5h4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function AddAccountIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9h18M3 9V6a1 1 0 011-1h16a1 1 0 011 1v3M3 9v9a1 1 0 001 1h16a1 1 0 001-1V9" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M6 14h3M6 17h5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M19 13v4M17 15h4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function QRCodeIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke="#8B5CF6" strokeWidth="1.8" />
      <Rect x="5" y="5" width="3" height="3" fill="#8B5CF6" rx="0.5" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke="#8B5CF6" strokeWidth="1.8" />
      <Rect x="16" y="5" width="3" height="3" fill="#8B5CF6" rx="0.5" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke="#8B5CF6" strokeWidth="1.8" />
      <Rect x="5" y="16" width="3" height="3" fill="#8B5CF6" rx="0.5" />
      <Path d="M14 14h2M14 17h1M17 14v2M16 17h2v2M14 19h1" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function ProfileIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke="#F59E0B" strokeWidth="1.8" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

const QUICK_ACTIONS = [
  { id: 'add-id', label: 'Add ID', Icon: AddIDIcon, route: '/ids', color: '#3B82F6' },
  { id: 'add-account', label: 'Add Account', Icon: AddAccountIcon, route: '/payments', color: '#10B981' },
  { id: 'my-qr', label: 'My QR', Icon: QRCodeIcon, route: '/qr', color: '#8B5CF6' },
  { id: 'profile', label: 'Profile', Icon: ProfileIcon, route: '/profile', color: '#F59E0B' },
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
      {/* ── Hero Header ── */}
      <LinearGradient
        colors={isDark ? ['#061510', '#0D2818', '#112B1C'] : ['#0A4520', '#1A7A3C', '#0D5C2A']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Brand bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <DWalletLogoMark size={44} />
            <View style={styles.brandTexts}>
              <Text style={styles.brandName}>D-WALLET</Text>
              <Text style={styles.brandTagline}>Your Digital Finances. Secured.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitials}>{user?.initials ?? '?'}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.heroDivider} />

        {/* Greeting */}
        <Text style={styles.greetLabel}>WELCOME BACK</Text>
        <Text style={styles.greetName}>{user?.firstName ?? 'User'} 👋</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: ids.length, label: 'IDs Stored' },
            { value: accounts.length, label: 'Linked Accounts' },
            { value: expiringCount, label: 'Expiring Soon', warn: expiringCount > 0 },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={[styles.statVal, s.warn ? { color: '#F59E0B' } : {}]}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {expiringCount > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning-outline" size={13} color="#F59E0B" />
            <Text style={styles.alertText}>{expiringCount} ID{expiringCount > 1 ? 's' : ''} expiring soon — tap to review</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingTop: Spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionBar, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map(({ id, label, Icon, route, color }) => (
              <TouchableOpacity
                key={id}
                style={[styles.quickBtn, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
                onPress={() => router.push(route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: color + '18' }]}>
                  <Icon size={26} />
                </View>
                <Text style={[styles.quickLabel, { color: theme.textPrimary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Payment Accounts ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionBar, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Payment Accounts</Text>
            {accounts.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/payments')} style={styles.seeAllRow}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                <Ionicons name="chevron-forward" size={12} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          {accounts.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
              onPress={() => router.push('/payments')}
              activeOpacity={0.8}
            >
              <AddAccountIcon size={32} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No accounts linked yet</Text>
              <Text style={[styles.emptyAction, { color: theme.primary }]}>+ Add Account</Text>
            </TouchableOpacity>
          ) : (
            accounts.map((account) => (
              <PaymentAccountCard key={account.id} account={account} onPress={() => router.push('/payments')} />
            ))
          )}
        </View>

        {/* ── My IDs ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionBar, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>My IDs</Text>
            {ids.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/ids')} style={styles.seeAllRow}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
                <Ionicons name="chevron-forward" size={12} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          {ids.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
              onPress={() => router.push('/ids')}
              activeOpacity={0.8}
            >
              <AddIDIcon size={32} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No IDs stored yet</Text>
              <Text style={[styles.emptyAction, { color: theme.primary }]}>+ Add ID</Text>
            </TouchableOpacity>
          ) : (
            ids.slice(0, 2).map((id) => <IDCardItem key={id.id} item={id} onPress={() => router.push('/ids')} />)
          )}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingHorizontal: Spacing.xl, paddingTop: 52, paddingBottom: Spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandTexts: { gap: 2 },
  brandName: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
  brandTagline: { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6, fontWeight: '500' },
  avatarBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 16, fontWeight: '800', color: '#fff' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 16 },
  greetLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, fontWeight: '700', marginBottom: 3 },
  greetName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 10 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: BorderRadius.md, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  statVal: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 8, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.4, textAlign: 'center', marginTop: 2 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)', borderRadius: 8, padding: 9,
  },
  alertText: { fontSize: 11, color: '#F59E0B', fontWeight: '600', flex: 1 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionBar: { width: 3, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: {
    flex: 1, aspectRatio: 0.88, borderRadius: BorderRadius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: Spacing.md,
  },
  quickIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: Spacing.xl, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, fontWeight: '500' },
  emptyAction: { fontSize: 13, fontWeight: '800' },
});