import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import PaymentAccountCard from '../../components/PaymentAccountCard';
import { loadAccounts, saveAccounts } from '../../constants/storage';
import type { PaymentAccount } from '../../constants/types';

const ACCOUNT_TEMPLATES = [
  { name: 'GCash', initial: 'G', bgColor: '#3B5BDB', color: '#FFFFFF' },
  { name: 'Maya', initial: 'M', bgColor: '#8B5CF6', color: '#FFFFFF' },
  { name: 'GrabPay', initial: 'GP', bgColor: '#00B14F', color: '#FFFFFF' },
  { name: 'ShopeePay', initial: 'S', bgColor: '#EE4D2D', color: '#FFFFFF' },
  { name: 'UnionBank', initial: 'UB', bgColor: '#E87722', color: '#FFFFFF' },
  { name: 'BDO', initial: 'B', bgColor: '#003087', color: '#FFFFFF' },
  { name: 'BPI', initial: 'BP', bgColor: '#C8102E', color: '#FFFFFF' },
  { name: 'Metrobank', initial: 'MB', bgColor: '#FFD700', color: '#000000' },
];

const EMPTY_FORM = { name: '', phoneNumber: '', balance: '', initial: '', bgColor: '#3B5BDB', color: '#FFFFFF' };

export default function PaymentsScreen() {
  const { theme, isDark } = useTheme();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [visible, setVisible] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useFocusEffect(useCallback(() => { loadAccounts().then(setAccounts); }, []));

  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const formatted = `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const handleSelectTemplate = (t: typeof ACCOUNT_TEMPLATES[0]) => {
    setForm({ ...EMPTY_FORM, name: t.name, initial: t.initial, bgColor: t.bgColor, color: t.color });
    setShowTemplates(false);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter an account name.'); return; }
    if (!form.phoneNumber.trim()) { Alert.alert('Required', 'Please enter a phone number.'); return; }
    const newAccount: PaymentAccount = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      balance: parseFloat(form.balance) || 0,
      initial: form.initial.trim() || form.name.charAt(0).toUpperCase(),
      color: form.color,
      bgColor: form.bgColor,
      isLinked: true,
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    await saveAccounts(updated);
    setShowAddModal(false);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Account', 'Remove this account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const updated = accounts.filter((a) => a.id !== id);
        setAccounts(updated);
        await saveAccounts(updated);
      }},
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D'] : ['#0B5C2A', '#16783C']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => setShowTemplates(true)}
          >
            <Ionicons name="add" size={18} color="#16783C" />
            <Text style={styles.addBtnText}>Link</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{visible ? formatted : '₱ ••••••'}</Text>
            <TouchableOpacity onPress={() => setVisible((v) => !v)} activeOpacity={0.7} style={styles.eyeBtn}>
              <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceSub}>{accounts.length} linked account{accounts.length !== 1 ? 's' : ''}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>LINKED ACCOUNTS</Text>
          {accounts.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              <Ionicons name="wallet-outline" size={42} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No accounts yet</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Tap Link to add your first e-wallet</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity key={account.id} onLongPress={() => handleDelete(account.id)} activeOpacity={1}>
                <PaymentAccountCard account={visible ? account : { ...account, balance: 0 }} onPress={() => {}} />
              </TouchableOpacity>
            ))
          )}
          {accounts.length > 0 && (
            <Text style={[styles.hint, { color: theme.textMuted }]}>Long press to remove an account</Text>
          )}
        </View>
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Template Sheet */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handle}><View style={[styles.handleBar, { backgroundColor: theme.border }]} /></View>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Choose Account Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ACCOUNT_TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.name}
                  style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]}
                  onPress={() => handleSelectTemplate(t)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.templateAvatar, { backgroundColor: t.bgColor }]}>
                    <Text style={[styles.templateInitial, { color: t.color }]}>{t.initial}</Text>
                  </View>
                  <Text style={[styles.templateName, { color: theme.textPrimary }]}>{t.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.templateRow, { borderBottomWidth: 0 }]}
                onPress={() => { setShowTemplates(false); setShowAddModal(true); }}
                activeOpacity={0.75}
              >
                <View style={[styles.templateAvatar, { backgroundColor: theme.surfaceElevated }]}>
                  <Ionicons name="add" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.templateName, { color: theme.textPrimary }]}>Other Account</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setShowTemplates(false)}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Account Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handle}><View style={[styles.handleBar, { backgroundColor: theme.border }]} /></View>
            <View style={styles.modalTop}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Link {form.name || 'Account'}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'Account Name', key: 'name', placeholder: 'e.g. GCash', keyboard: 'default' },
                { label: 'Phone Number', key: 'phoneNumber', placeholder: '09XX XXX XXXX', keyboard: 'phone-pad' },
                { label: 'Balance (₱)', key: 'balance', placeholder: '0.00', keyboard: 'decimal-pad' },
              ].map((field, i, arr) => (
                <View key={field.key} style={[styles.formRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.textPrimary }]}
                    value={(form as any)[field.key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textMuted}
                    keyboardType={field.keyboard as any}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.85}>
              <Ionicons name="link-outline" size={18} color={theme.textInverse} />
              <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>Link Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: Spacing.xxl },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 24,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#16783C' },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.xl, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  eyeBtn: { padding: 4 },
  balanceSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 },
  content: { padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  empty: {
    alignItems: 'center', paddingVertical: 44, gap: 10,
    borderRadius: BorderRadius.xl, borderWidth: 1.5, borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 13 },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 10 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    padding: Spacing.xl, paddingBottom: 44,
  },
  handle: { alignItems: 'center', marginBottom: Spacing.lg },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  sheetTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2, marginBottom: Spacing.lg },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  closeBtn: { width: 34, height: 34, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  templateAvatar: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  templateInitial: { fontSize: 14, fontWeight: '800' },
  templateName: { fontSize: 15, fontWeight: '600', flex: 1 },
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
  cancelBtn: {
    alignItems: 'center', paddingVertical: 14,
    borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: 8,
  },
  cancelText: { fontSize: 14, fontWeight: '600' },
});