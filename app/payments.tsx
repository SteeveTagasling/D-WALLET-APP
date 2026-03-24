import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import PaymentAccountCard from '../components/PaymentAccountCard';
import { loadAccounts, saveAccounts } from '../constants/storage';
import type { PaymentAccount } from '../constants/types';

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
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [visible, setVisible] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useFocusEffect(useCallback(() => {
    loadAccounts().then(setAccounts);
  }, []));

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
    Alert.alert('Remove Account', 'Remove this account from your wallet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const updated = accounts.filter((a) => a.id !== id);
          setAccounts(updated);
          await saveAccounts(updated);
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Payments</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={() => setShowTemplates(true)}>
          <Ionicons name="add" size={20} color={theme.textInverse} />
          <Text style={[styles.addBtnText, { color: theme.textInverse }]}>Link Account</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.totalCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>{visible ? formatted : '₱ ••••••'}</Text>
            <TouchableOpacity onPress={() => setVisible((v) => !v)} activeOpacity={0.7}>
              <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.totalSub}>Across {accounts.length} linked account{accounts.length !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>LINKED ACCOUNTS</Text>
          {accounts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No accounts linked yet.</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity key={account.id} onLongPress={() => handleDelete(account.id)} activeOpacity={1}>
                <PaymentAccountCard account={visible ? account : { ...account, balance: 0 }} onPress={() => {}} />
              </TouchableOpacity>
            ))
          )}
          {accounts.length > 0 && (
            <Text style={[styles.hint, { color: theme.textMuted }]}>Long press an account to remove it</Text>
          )}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Template Picker */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Choose Account Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ACCOUNT_TEMPLATES.map((t) => (
                <TouchableOpacity key={t.name} style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]} onPress={() => handleSelectTemplate(t)} activeOpacity={0.75}>
                  <View style={[styles.templateAvatar, { backgroundColor: t.bgColor }]}>
                    <Text style={[styles.templateInitial, { color: t.color }]}>{t.initial}</Text>
                  </View>
                  <Text style={[styles.templateName, { color: theme.textPrimary }]}>{t.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]} onPress={() => { setShowTemplates(false); setShowAddModal(true); }} activeOpacity={0.75}>
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
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.modalTop}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Link {form.name || 'Account'}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.infoBox, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'Account Name *', key: 'name', placeholder: 'e.g. GCash', keyboard: 'default' },
                { label: 'Phone Number *', key: 'phoneNumber', placeholder: '09XX XXX XXXX', keyboard: 'phone-pad' },
                { label: 'Balance (₱)', key: 'balance', placeholder: '0.00', keyboard: 'decimal-pad' },
              ].map((field, i, arr) => (
                <View key={field.key} style={[styles.infoRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={(form as any)[field.key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textMuted}
                    keyboardType={field.keyboard as any}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.8}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  title: { ...Typography.h1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
  addBtnText: { ...Typography.labelMedium, fontWeight: '700' },
  content: { padding: Spacing.xl },
  totalCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.xl },
  totalLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalAmount: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  totalSub: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.labelLarge, letterSpacing: 1.2, marginBottom: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  emptyText: { ...Typography.bodyMedium, fontStyle: 'italic' },
  hint: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.sm },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, padding: Spacing.xl, paddingBottom: 40 },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 40, height: 4, borderRadius: 2 },
  sheetTitle: { ...Typography.h2, marginBottom: Spacing.lg },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  closeBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  templateAvatar: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  templateInitial: { ...Typography.labelMedium, fontWeight: '800' },
  templateName: { ...Typography.bodyMedium, fontWeight: '600', flex: 1 },
  infoBox: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  infoLabel: { ...Typography.bodyMedium },
  input: { ...Typography.bodyMedium, textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  saveBtnText: { ...Typography.labelMedium, fontWeight: '700' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: Spacing.sm },
  cancelText: { ...Typography.labelMedium, fontWeight: '700' },
});