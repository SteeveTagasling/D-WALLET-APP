import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import ToggleRow from '../components/ToggleRow';
import { loadIDs, loadAccounts, loadUser, saveUser, clearAllData } from '../constants/storage';
import type { UserProfile } from '../constants/types';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [idCount, setIdCount] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useFocusEffect(useCallback(() => {
    Promise.all([loadUser(), loadIDs(), loadAccounts()]).then(([u, ids, accounts]) => {
      setUser(u);
      setIdCount(ids.length);
      setAccountCount(accounts.length);
      setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone });
    });
  }, []));

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim()) { Alert.alert('Required', 'Please enter your first name.'); return; }
    const initials = `${editForm.firstName.charAt(0)}${editForm.lastName.charAt(0)}`.toUpperCase();
    const updated: UserProfile = { ...user!, ...editForm, initials, firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() };
    setUser(updated);
    await saveUser(updated);
    setShowEditModal(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your IDs, accounts, and profile data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive', onPress: async () => {
          await clearAllData();
          Alert.alert('Done', 'All data has been cleared.');
        }
      },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userBlock}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{user.initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.firstName} {user.lastName}</Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user.email}</Text>
            <View style={[styles.planBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
              <Ionicons name="shield-checkmark-outline" size={12} color={theme.primary} />
              <Text style={[styles.planText, { color: theme.primary }]}>{user.planType} Plan</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsRow, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
          {[
            { val: idCount, label: 'IDs' },
            { val: accountCount, label: 'Accounts' },
            { val: user.memberSince.split(' ')[1], label: 'Since' },
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

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Dark Mode" description="Green dark theme" iconName="moon-outline" value={isDark} onToggle={toggleTheme} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Edit Profile" iconName="person-outline" showChevron onPress={() => setShowEditModal(true)} />
            <ToggleRow label="Notifications" iconName="notifications-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Security & Privacy" iconName="lock-closed-outline" showChevron onPress={() => {}} />
            <ToggleRow label="Biometric Login" description="Use fingerprint or Face ID" iconName="finger-print-outline" value={true} onToggle={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DATA</Text>
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <ToggleRow label="Clear All Data" description="Delete all stored IDs and accounts" iconName="trash-outline" showChevron destructive onPress={handleClearData} />
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
            <ToggleRow label="Sign Out" iconName="log-out-outline" showChevron destructive onPress={handleSignOut} />
          </View>
        </View>

        <Text style={[styles.version, { color: theme.textMuted }]}>D-Wallet v1.0.0 · Offline & Secured on your device.</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.modalTop}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.infoBox, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'First Name', key: 'firstName', placeholder: 'Juan' },
                { label: 'Last Name', key: 'lastName', placeholder: 'Dela Cruz' },
                { label: 'Email', key: 'email', placeholder: 'email@example.com' },
                { label: 'Phone', key: 'phone', placeholder: '09XX XXX XXXX' },
              ].map((field, i, arr) => (
                <View key={field.key} style={[styles.infoRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={(editForm as any)[field.key]}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveProfile} activeOpacity={0.8}>
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
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  title: { ...Typography.h1 },
  content: { padding: Spacing.xl },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
  avatarCircle: { width: 72, height: 72, borderRadius: BorderRadius.full, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800' },
  userInfo: { flex: 1, gap: 4 },
  userName: { ...Typography.h2 },
  userEmail: { ...Typography.bodySmall },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 },
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
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, padding: Spacing.xl, paddingBottom: 40 },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 40, height: 4, borderRadius: 2 },
  sheetTitle: { ...Typography.h2 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  closeBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  infoBox: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  infoLabel: { ...Typography.bodyMedium },
  input: { ...Typography.bodyMedium, textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  saveBtnText: { ...Typography.labelMedium, fontWeight: '700' },
});