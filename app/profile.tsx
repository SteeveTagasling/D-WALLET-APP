import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import ToggleRow from '../components/ToggleRow';
import { mockUser, mockIDs, mockAccounts } from '../constants/mockData';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User */}
        <View style={styles.userBlock}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{mockUser.initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{mockUser.firstName} {mockUser.lastName}</Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]}>{mockUser.email}</Text>
            <View style={[styles.planBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
              <Ionicons name="shield-checkmark-outline" size={12} color={theme.primary} />
              <Text style={[styles.planText, { color: theme.primary }]}>{mockUser.planType} Plan</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
          {[
            { val: mockIDs.length, label: 'IDs' },
            { val: mockAccounts.length, label: 'Accounts' },
            { val: mockUser.memberSince.split(' ')[1], label: 'Since' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: theme.textPrimary }]}>{s.val}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: theme.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Dark Mode" description="Green dark theme" iconName="moon-outline" value={isDark} onToggle={toggleTheme} />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Edit Profile" iconName="person-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Notifications" iconName="notifications-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Security & Privacy" iconName="lock-closed-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Biometric Login" description="Use fingerprint or Face ID" iconName="finger-print-outline" value={true} onToggle={() => {}} />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Help Center" iconName="help-circle-outline" showChevron onPress={() => {}} />
            <ToggleRow label="About D-Wallet" iconName="information-circle-outline" showChevron onPress={() => {}} />
          </View>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow
              label="Sign Out"
              iconName="log-out-outline"
              showChevron
              destructive
              onPress={() =>
                Alert.alert('Sign Out', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: () => {} },
                ])
              }
            />
          </View>
        </View>

        <Text style={[styles.version, { color: theme.textMuted }]}>D-Wallet v1.0.0 · Your Digital Finances. Secured.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1,
  },
  title: { ...Typography.h1 },
  content: { padding: Spacing.xl },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
  avatarCircle: { width: 72, height: 72, borderRadius: BorderRadius.full, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800' },
  userInfo: { flex: 1, gap: 4 },
  userName: { ...Typography.h2 },
  userEmail: { ...Typography.bodySmall },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: BorderRadius.full, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4,
  },
  planText: { ...Typography.labelSmall, fontWeight: '700' },
  statsRow: { flexDirection: 'row', borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xl, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statVal: { ...Typography.h2 },
  statLabel: { ...Typography.caption, marginTop: 2 },
  statDivider: { width: 1 },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { ...Typography.labelSmall, letterSpacing: 1.5, marginBottom: Spacing.sm, paddingLeft: 4 },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  version: { ...Typography.caption, textAlign: 'center', marginBottom: 8 },
});
