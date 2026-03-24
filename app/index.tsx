import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import PaymentAccountCard from '../components/PaymentAccountCard';
import IDCardItem from '../components/IDCardItem';
import { mockUser, mockIDs, mockAccounts } from '../constants/mockData';

const QUICK_ACTIONS = [
  { id: 'add-id', label: 'Add ID', icon: 'card-outline' as const, route: '/ids' },
  { id: 'add-account', label: 'Add Account', icon: 'wallet-outline' as const, route: '/payments' },
  { id: 'my-qr', label: 'My QR', icon: 'qr-code-outline' as const, route: '/qr' },
  { id: 'profile', label: 'Profile', icon: 'person-outline' as const, route: '/profile' },
];

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoBox, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Text style={[styles.logoLetter, { color: theme.primary }]}>D</Text>
          </View>
          <View>
            <Text style={[styles.appName, { color: theme.primary }]}>D-WALLET</Text>
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
              Good afternoon, {mockUser.firstName}!
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.avatarText, { color: theme.primary }]}>{mockUser.initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: theme.header }]}>
        <StatCard value={mockIDs.length} label="IDs stored" />
        <StatCard value={mockAccounts.length} label="Accounts" />
        <StatCard
          value={mockIDs.filter((i) => i.status === 'expiring').length}
          label="Expiring"
          accentColor={theme.warning}
        />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>QUICK ACTIONS</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickBtn, { backgroundColor: theme.quickActionBg, borderColor: theme.border }]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.75}
              >
                <Ionicons name={action.icon} size={28} color={theme.primary} />
                <Text style={[styles.quickLabel, { color: theme.textPrimary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Accounts */}
        <View style={styles.section}>
          <SectionHeader title="Payment Accounts" onSeeAll={() => router.push('/payments')} />
          {mockAccounts.map((account) => (
            <PaymentAccountCard key={account.id} account={account} onPress={() => router.push('/payments')} />
          ))}
        </View>

        {/* My IDs */}
        <View style={styles.section}>
          <SectionHeader title="My IDs" onSeeAll={() => router.push('/ids')} />
          {mockIDs.slice(0, 2).map((id) => (
            <IDCardItem key={id.id} item={id} onPress={() => router.push('/ids')} />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { fontSize: 20, fontWeight: '800' },
  appName: { ...Typography.labelSmall, letterSpacing: 2, fontWeight: '800' },
  greeting: { ...Typography.h3, fontWeight: '700' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.bodyMedium, fontWeight: '800' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.xl },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.labelLarge, letterSpacing: 1.2, marginBottom: Spacing.md },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: {
    width: '22.5%',
    aspectRatio: 0.9,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  quickLabel: { ...Typography.caption, fontWeight: '600', textAlign: 'center' },
});
