import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, router } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import ToggleRow from '../../components/ToggleRow';
import { loadIDs, loadAccounts, loadUser, saveUser, clearAllData } from '../../constants/storage';
import { signOut } from '../../constants/auth';
import type { UserProfile } from '../../constants/types';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [idCount, setIdCount] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useFocusEffect(useCallback(() => {
    Promise.all([loadUser(), loadIDs(), loadAccounts()]).then(([u, ids, accounts]) => {
      setUser(u); setIdCount(ids.length); setAccountCount(accounts.length);
      setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone });
    });
  }, []));

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim()) { Alert.alert('Required', 'Please enter your first name.'); return; }
    const initials = `${editForm.firstName.charAt(0)}${editForm.lastName.charAt(0)}`.toUpperCase();
    const updated: UserProfile = { ...user!, ...editForm, initials, firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() };
    setUser(updated); await saveUser(updated); setShowEditModal(false);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your data. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => { await clearAllData(); Alert.alert('Done', 'All data cleared.'); }},
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Hero Header */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D'] : ['#0B5C2A', '#16783C']}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Profile</Text>
        <View style={styles.userBlock}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.planBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#2ECC71" />
              <Text style={styles.planText}>{user.planType} Plan</Text>
            </View>
          </View>
        </View>

        {/* Stat Row */}
        <View style={styles.statsRow}>
          {[
            { val: idCount, label: 'IDs Stored' },
            { val: accountCount, label: 'Accounts' },
            { val: user.memberSince.split(' ')[1], label: 'Member Since' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Dark Mode" description="Switch to dark theme" iconName="moon-outline" value={isDark} onToggle={toggleTheme} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Edit Profile" iconName="person-outline" showChevron onPress={() => setShowEditModal(true)} />
            <ToggleRow label="Notifications" iconName="notifications-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Security & Privacy" iconName="lock-closed-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Biometric Login" description="Fingerprint / Face ID" iconName="finger-print-outline" value={true} onToggle={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DATA</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Clear All Data" description="Delete stored IDs and accounts" iconName="trash-outline" showChevron destructive onPress={handleClearData} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Help Center" iconName="help-circle-outline" showChevron onPress={() => {}} />
            <ToggleRow label="About D-Wallet" iconName="information-circle-outline" showChevron onPress={() => {}} />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 60 }]}>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Sign Out" iconName="log-out-outline" showChevron destructive onPress={() => {
              Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/login'); } }]);
            }} />
          </View>
        </View>

        <Text style={[styles.version, { color: theme.textMuted }]}>D-Wallet v1.0.0 · Secured on your device</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handle}><View style={[styles.handleBar, { backgroundColor: theme.border }]} /></View>
            <View style={styles.modalTop}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'First Name', key: 'firstName', placeholder: 'Juan' },
                { label: 'Last Name', key: 'lastName', placeholder: 'Dela Cruz' },
                { label: 'Email', key: 'email', placeholder: 'email@example.com' },
                { label: 'Phone', key: 'phone', placeholder: '09XX XXX XXXX' },
              ].map((field, i, arr) => (
                <View key={field.key} style={[styles.formRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.textPrimary }]}
                    value={(editForm as any)[field.key]}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveProfile} activeOpacity={0.85}>
              <Ionicons name="save-outline" size={18} color={theme.textInverse} />
              <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: Spacing.xxl },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 20 },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarRing: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 2,
  },
  planText: { fontSize: 11, color: '#2ECC71', fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { padding: Spacing.xl },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, paddingLeft: 2 },
  card: { borderRadius: BorderRadius.xl, borderWidth: 1, paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  version: { fontSize: 11, textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    padding: Spacing.xl, paddingBottom: 44,
  },
  handle: { alignItems: 'center', marginBottom: Spacing.lg },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  sheetTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  closeBtn: { width: 34, height: 34, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  formCard: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  formRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  formLabel: { fontSize: 14, fontWeight: '500' },
  formInput: { fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 12 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: BorderRadius.lg,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800' },
});