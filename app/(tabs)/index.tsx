import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Modal,
} from 'react-native';
import Svg, { Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import PaymentAccountCard from '../../components/PaymentAccountCard';
import IDCardItem from '../../components/IDCardItem';
import { loadIDs, loadAccounts, loadUser } from '../../constants/storage';
import { getExpiringIDs, getExpiryMessage } from '../../constants/notifications';
import type { StoredID, PaymentAccount, UserProfile } from '../../constants/types';
import type { ExpiryWarning } from '../../constants/notifications';

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

// ── Expiry Alert Modal ──────────────────────────────────────────────
function ExpiryModal({ warnings, onClose }: { warnings: ExpiryWarning[]; onClose: () => void }) {
  const { theme } = useTheme();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.iconWrap}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[modalStyles.title, { color: theme.textPrimary }]}>
                {warnings.length === 1 ? 'ID Expiring Soon' : `${warnings.length} IDs Expiring Soon`}
              </Text>
              <Text style={[modalStyles.subtitle, { color: theme.textMuted }]}>
                Please renew before they expire
              </Text>
            </View>
          </View>

          {/* ID list */}
          <View style={[modalStyles.list, { borderColor: theme.border }]}>
            {warnings.map((w, i) => (
              <View
                key={w.id}
                style={[
                  modalStyles.row,
                  { borderBottomWidth: i < warnings.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{w.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[modalStyles.idName, { color: theme.textPrimary }]}>{w.name}</Text>
                  <Text style={[modalStyles.idDays, { color: w.days === 0 ? '#EF4444' : w.days <= 7 ? '#F59E0B' : '#F97316' }]}>
                    {getExpiryMessage(w.days)}
                  </Text>
                </View>
                {w.days === 0 && (
                  <View style={modalStyles.urgentBadge}>
                    <Text style={modalStyles.urgentText}>URGENT</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={modalStyles.btnRow}>
            <TouchableOpacity
              style={[modalStyles.dismissBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[modalStyles.dismissText, { color: theme.textSecondary }]}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.viewBtn, { backgroundColor: theme.primary }]}
              onPress={() => { onClose(); router.push('/ids'); }}
              activeOpacity={0.85}
            >
              <Ionicons name="id-card-outline" size={15} color="#fff" />
              <Text style={modalStyles.viewText}>View IDs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', borderRadius: 24, borderWidth: 1,
    padding: 20, gap: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  list: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 14,
  },
  idName: { fontSize: 14, fontWeight: '700' },
  idDays: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  urgentBadge: {
    backgroundColor: '#EF4444', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 20,
  },
  urgentText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  btnRow: { flexDirection: 'row', gap: 10 },
  dismissBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dismissText: { fontSize: 14, fontWeight: '600' },
  viewBtn: {
    flex: 2, paddingVertical: 13, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
  },
  viewText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

// ── Home Screen ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const [ids, setIds] = useState<StoredID[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiryWarnings, setExpiryWarnings] = useState<ExpiryWarning[]>([]);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  const loadData = useCallback(async () => {
    const [loadedIDs, loadedAccounts, loadedUser] = await Promise.all([
      loadIDs(), loadAccounts(), loadUser(),
    ]);
    setIds(loadedIDs);
    setAccounts(loadedAccounts);
    setUser(loadedUser);
    setLoading(false);

    // Check for expiring IDs and show modal
    const warnings = getExpiringIDs(loadedIDs);
    if (warnings.length > 0) {
      setExpiryWarnings(warnings);
      setShowExpiryModal(true);
    }
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

      {/* Expiry Modal */}
      {showExpiryModal && (
        <ExpiryModal
          warnings={expiryWarnings}
          onClose={() => setShowExpiryModal(false)}
        />
      )}

      {/* ── Hero ── */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D', '#0D2214'] : ['#0B5C2A', '#16783C', '#1A9B50']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
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

        <View style={styles.greetBlock}>
          <Text style={styles.greetSub}>GOOD DAY</Text>
          <Text style={styles.greetName}>{user?.firstName ?? 'User'} 👋</Text>
        </View>

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

        {/* Tap to re-open expiry modal if there are warnings */}
        {expiryWarnings.length > 0 && (
          <TouchableOpacity style={styles.alertRow} onPress={() => setShowExpiryModal(true)} activeOpacity={0.8}>
            <Ionicons name="alert-circle" size={13} color="#F5A623" />
            <Text style={styles.alertText}>
              {expiryWarnings.length} ID{expiryWarnings.length > 1 ? 's' : ''} expiring soon — tap to view
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#F5A623" />
          </TouchableOpacity>
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
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
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
  alertText: { fontSize: 12, color: '#F5A623', fontWeight: '600', flex: 1 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: BorderRadius.xl, borderWidth: 1, gap: 10,
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