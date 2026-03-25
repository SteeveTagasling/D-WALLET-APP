import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import PaymentAccountCard from '../../components/PaymentAccountCard';
import { loadAccounts, saveAccounts } from '../../constants/storage';
import type { PaymentAccount } from '../../constants/types';

const ACCOUNT_TEMPLATES = [
  { name: 'GCash',      initial: 'G',  bgColor: '#3B5BDB', color: '#FFFFFF', category: 'E-Wallet' },
  { name: 'Maya',       initial: 'M',  bgColor: '#00A651', color: '#FFFFFF', category: 'E-Wallet' },
  { name: 'GrabPay',    initial: 'GP', bgColor: '#00B14F', color: '#FFFFFF', category: 'E-Wallet' },
  { name: 'ShopeePay',  initial: 'S',  bgColor: '#EE4D2D', color: '#FFFFFF', category: 'E-Wallet' },
  { name: 'UnionBank',  initial: 'UB', bgColor: '#E87722', color: '#FFFFFF', category: 'Bank' },
  { name: 'BDO',        initial: 'B',  bgColor: '#003087', color: '#FFFFFF', category: 'Bank' },
  { name: 'BPI',        initial: 'BP', bgColor: '#C8102E', color: '#FFFFFF', category: 'Bank' },
  { name: 'Metrobank',  initial: 'MB', bgColor: '#FFD700', color: '#000000', category: 'Bank' },
  { name: 'RCBC',       initial: 'RC', bgColor: '#8B0000', color: '#FFFFFF', category: 'Bank' },
  { name: 'Landbank',   initial: 'LB', bgColor: '#006400', color: '#FFFFFF', category: 'Bank' },
];

const EMPTY_FORM = { name: '', phoneNumber: '', accountNumber: '', pin: '', balance: '', initial: '', bgColor: '#3B5BDB', color: '#FFFFFF', notes: '' };

const FORM_FIELDS = [
  { label: 'Account Name',   key: 'name',          placeholder: 'e.g. GCash',              keyboard: 'default' },
  { label: 'Phone / Mobile', key: 'phoneNumber',   placeholder: '09XX XXX XXXX',           keyboard: 'phone-pad' },
  { label: 'Account Number', key: 'accountNumber', placeholder: 'Optional',                keyboard: 'default' },
  { label: 'PIN',            key: 'pin',           placeholder: 'Optional (stored locally)',keyboard: 'number-pad' },
  { label: 'Notes',          key: 'notes',         placeholder: 'Optional',                keyboard: 'default' },
] as const;

function FormFields({
  fv, setFv, theme,
}: {
  fv: typeof EMPTY_FORM;
  setFv: (f: typeof EMPTY_FORM) => void;
  theme: any;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
      <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
        {FORM_FIELDS.map((field, i, arr) => (
          <View
            key={field.key}
            style={[styles.formRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}
          >
            <Text style={[styles.formLabel, { color: theme.textMuted }]}>{field.label}</Text>
            <TextInput
              style={[styles.formInput, { color: theme.textPrimary }]}
              value={fv[field.key]}
              onChangeText={(v) => setFv({ ...fv, [field.key]: v })}
              placeholder={field.placeholder}
              placeholderTextColor={theme.textMuted}
              keyboardType={field.keyboard as any}
              secureTextEntry={field.key === 'pin'}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function PaymentsScreen() {
  const { theme, isDark } = useTheme();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [pinVisible, setPinVisible] = useState(false);
  const [accNumVisible, setAccNumVisible] = useState(false);

  useFocusEffect(useCallback(() => { loadAccounts().then(setAccounts); }, []));

  const handleSelectTemplate = (t: typeof ACCOUNT_TEMPLATES[0]) => {
    setForm({ ...EMPTY_FORM, name: t.name, initial: t.initial, bgColor: t.bgColor, color: t.color });
    setShowTemplates(false);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter an account name.'); return; }
    if (!form.phoneNumber.trim()) { Alert.alert('Required', 'Please enter a phone/mobile number.'); return; }
    const newAccount: PaymentAccount = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      accountNumber: form.accountNumber.trim() || undefined,
      pin: form.pin.trim() || undefined,
      balance: parseFloat(form.balance) || 0,
      initial: form.initial.trim() || form.name.charAt(0).toUpperCase(),
      color: form.color,
      bgColor: form.bgColor,
      isLinked: true,
      notes: form.notes.trim() || undefined,
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    await saveAccounts(updated);
    setShowAddModal(false);
    setForm(EMPTY_FORM);
  };

  // Long press → edit
  const handleLongPress = (account: PaymentAccount) => {
    setEditingAccount(account);
    setEditForm({
      name: account.name,
      phoneNumber: account.phoneNumber,
      accountNumber: account.accountNumber || '',
      pin: account.pin || '',
      balance: account.balance.toString(),
      initial: account.initial,
      bgColor: account.bgColor,
      color: account.color,
      notes: account.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) { Alert.alert('Required', 'Please enter an account name.'); return; }
    if (!editingAccount) return;
    const updated = accounts.map(a => a.id === editingAccount.id ? {
      ...a,
      name: editForm.name.trim(),
      phoneNumber: editForm.phoneNumber.trim(),
      accountNumber: editForm.accountNumber.trim() || undefined,
      pin: editForm.pin.trim() || undefined,
      balance: parseFloat(editForm.balance) || 0,
      notes: editForm.notes.trim() || undefined,
    } : a);
    setAccounts(updated);
    await saveAccounts(updated);
    setShowEditModal(false);
    setEditingAccount(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Account', 'Remove this account from your wallet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const updated = accounts.filter(a => a.id !== id);
        setAccounts(updated);
        await saveAccounts(updated);
        setShowDetailModal(false);
        setShowEditModal(false);
        setSelectedAccount(null);
        setEditingAccount(null);
      }},
    ]);
  };

  // Tap → detail view
  const handleTap = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setPinVisible(false);
    setAccNumVisible(false);
    setShowDetailModal(true);
  };

  const eWallets = accounts.filter(a => ['gcash','maya','paymaya','grabpay','shopeepay'].some(k => a.name.toLowerCase().includes(k)));
  const banks = accounts.filter(a => !eWallets.includes(a));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D'] : ['#0B5C2A', '#16783C']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerEyebrow}>D-WALLET</Text>
            <Text style={styles.headerTitle}>My Wallet</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => setShowTemplates(true)}>
            <Ionicons name="add" size={18} color="#16783C" />
            <Text style={styles.addBtnText}>Link Account</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Insights Strip */}
        <View style={styles.insightStrip}>
          <View style={[styles.insightCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={styles.insightLabel}>ACCOUNTS</Text>
            <Text style={styles.insightValue}>{accounts.length}</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={styles.insightLabel}>E-WALLETS</Text>
            <Text style={styles.insightValue}>{eWallets.length}</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={styles.insightLabel}>BANKS</Text>
            <Text style={styles.insightValue}>{banks.length}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* E-Wallets section */}
        {eWallets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>E-WALLETS</Text>
              <Text style={[styles.sectionCount, { color: theme.textMuted }]}>{eWallets.length}</Text>
            </View>
            {eWallets.map((account) => (
              <PaymentAccountCard
                key={account.id}
                account={account}
                onPress={() => handleTap(account)}
                onLongPress={() => handleLongPress(account)}
              />
            ))}
          </View>
        )}

        {/* Banks section */}
        {banks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>BANK ACCOUNTS</Text>
              <Text style={[styles.sectionCount, { color: theme.textMuted }]}>{banks.length}</Text>
            </View>
            {banks.map((account) => (
              <PaymentAccountCard
                key={account.id}
                account={account}
                onPress={() => handleTap(account)}
                onLongPress={() => handleLongPress(account)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {accounts.length === 0 && (
          <View style={[styles.empty, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <Ionicons name="wallet-outline" size={42} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No accounts linked</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Tap "Link Account" to add your first e-wallet or bank</Text>
          </View>
        )}

        {accounts.length > 0 && (
          <Text style={[styles.hint, { color: theme.textMuted }]}>Tap to view details · Long press to edit</Text>
        )}
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Account Detail Modal (tap) ── */}
      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {selectedAccount && (
              <>
                <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>

                {/* Account hero card */}
                <LinearGradient
                  colors={[selectedAccount.bgColor, selectedAccount.bgColor + 'BB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.accountHero}
                >
                  <View style={styles.accountHeroTop}>
                    <View style={[styles.accountAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Text style={[styles.accountAvatarText, { color: selectedAccount.color }]}>{selectedAccount.initial}</Text>
                    </View>
                    <View style={[styles.linkedBadge]}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>● LINKED</Text>
                    </View>
                  </View>
                  <Text style={[styles.accountHeroName, { color: selectedAccount.color }]}>{selectedAccount.name}</Text>
                  <Text style={[styles.accountHeroPhone, { color: selectedAccount.color === '#FFFFFF' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.5)' }]}>
                    {selectedAccount.phoneNumber}
                  </Text>
                </LinearGradient>

                {/* Detail rows */}
                <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border, marginBottom: 12 }]}>
                  {/* Account Number */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.borderSubtle }]}>
                    <View style={styles.detailRowLeft}>
                      <Ionicons name="card-outline" size={15} color={theme.textMuted} />
                      <Text style={[styles.formLabel, { color: theme.textMuted }]}>Account No.</Text>
                    </View>
                    <View style={styles.detailRowRight}>
                      <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                        {selectedAccount.accountNumber
                          ? (accNumVisible ? selectedAccount.accountNumber : `•••• ${selectedAccount.accountNumber.slice(-4)}`)
                          : '—'}
                      </Text>
                      {selectedAccount.accountNumber && (
                        <TouchableOpacity onPress={() => setAccNumVisible(v => !v)} style={styles.revealBtn}>
                          <Ionicons name={accNumVisible ? 'eye-off-outline' : 'eye-outline'} size={14} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {/* PIN */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.borderSubtle }]}>
                    <View style={styles.detailRowLeft}>
                      <Ionicons name="lock-closed-outline" size={15} color={theme.textMuted} />
                      <Text style={[styles.formLabel, { color: theme.textMuted }]}>PIN</Text>
                    </View>
                    <View style={styles.detailRowRight}>
                      <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                        {selectedAccount.pin
                          ? (pinVisible ? selectedAccount.pin : '• '.repeat(selectedAccount.pin.length).trim())
                          : '—'}
                      </Text>
                      {selectedAccount.pin && (
                        <TouchableOpacity onPress={() => setPinVisible(v => !v)} style={styles.revealBtn}>
                          <Ionicons name={pinVisible ? 'eye-off-outline' : 'eye-outline'} size={14} color={theme.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {/* Balance */}
                  <View style={[styles.detailRow, { borderBottomWidth: selectedAccount.notes ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                    <View style={styles.detailRowLeft}>
                      <Ionicons name="wallet-outline" size={15} color={theme.textMuted} />
                      <Text style={[styles.formLabel, { color: theme.textMuted }]}>Balance</Text>
                    </View>
                    <Text style={[styles.detailVal, { color: theme.primary, fontWeight: '800' }]}>Hidden</Text>
                  </View>
                  {selectedAccount.notes && (
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.detailRowLeft}>
                        <Ionicons name="document-text-outline" size={15} color={theme.textMuted} />
                        <Text style={[styles.formLabel, { color: theme.textMuted }]}>Notes</Text>
                      </View>
                      <Text style={[styles.detailVal, { color: theme.textPrimary, flex: 1, textAlign: 'right' }]}>{selectedAccount.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.editActionBtn, { borderColor: theme.primary, backgroundColor: theme.primaryMuted, flex: 1 }]}
                    onPress={() => { setShowDetailModal(false); handleLongPress(selectedAccount); }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.primary} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.closeRowBtn, { backgroundColor: theme.surfaceElevated, flex: 2 }]}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Edit Account Modal (long press) ── */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.sheetHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.editBadge, { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)' }]}>
                  <Ionicons name="create-outline" size={14} color="#F59E0B" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>Editing</Text>
                </View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>{editingAccount?.name}</Text>
              </View>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FormFields fv={editForm} setFv={setEditForm} theme={theme} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)', flex: 1 }]}
                onPress={() => { if (editingAccount) handleDelete(editingAccount.id); }}
                activeOpacity={0.75}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary, flex: 2 }]} onPress={handleSaveEdit} activeOpacity={0.85}>
                <Ionicons name="checkmark-outline" size={18} color={theme.textInverse} />
                <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Template Sheet ── */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.sheetHead}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Choose Account Type</Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Select your e-wallet or bank</Text>
              </View>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => setShowTemplates(false)}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {['E-Wallet', 'Bank'].map(cat => (
                <View key={cat}>
                  <Text style={[styles.templateCat, { color: theme.textMuted }]}>{cat.toUpperCase()}</Text>
                  {ACCOUNT_TEMPLATES.filter(t => t.category === cat).map((t) => (
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
                </View>
              ))}
              <TouchableOpacity
                style={[styles.templateRow, { borderBottomWidth: 0 }]}
                onPress={() => { setShowTemplates(false); setShowAddModal(true); }}
                activeOpacity={0.75}
              >
                <View style={[styles.templateAvatar, { backgroundColor: theme.surfaceElevated }]}>
                  <Ionicons name="add" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.templateName, { color: theme.textPrimary }]}>Other / Custom</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Add Account Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.sheetHead}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Link {form.name || 'Account'}</Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Your data is stored locally on device</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FormFields fv={form} setFv={setForm} theme={theme} />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary, marginTop: 12 }]} onPress={handleSave} activeOpacity={0.85}>
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
  header: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerEyebrow: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, fontWeight: '700', marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#16783C' },
  insightStrip: { flexDirection: 'row', gap: 8 },
  insightCard: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, gap: 2 },
  insightLabel: { fontSize: 7, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 0.8 },
  insightValue: { fontSize: 13, fontWeight: '800', color: '#fff' },
  content: { padding: Spacing.xl },
  insightBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: 16,
  },
  insightBannerIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  insightBannerTitle: { fontSize: 13, fontWeight: '700' },
  insightBannerSub: { fontSize: 11, marginTop: 1 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  sectionCount: { fontSize: 10, fontWeight: '600', opacity: 0.6 },
  empty: {
    alignItems: 'center', paddingVertical: 44, gap: 10,
    borderRadius: BorderRadius.xl, borderWidth: 1.5, borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 260 },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.6 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    padding: Spacing.xl, paddingBottom: 44,
  },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 36, height: 4, borderRadius: 2 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  editBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  accountHero: { borderRadius: BorderRadius.xl, padding: 20, marginBottom: 14 },
  accountHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  accountAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  accountAvatarText: { fontSize: 18, fontWeight: '900' },
  linkedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  accountHeroName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  accountHeroPhone: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  accountHeroBalance: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 10 },
  formCard: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  formLabel: { fontSize: 13, fontWeight: '600', minWidth: 100 },
  formInput: { fontSize: 13, textAlign: 'right', flex: 1, marginLeft: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  detailRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailVal: { fontSize: 13, fontWeight: '600' },
  revealBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  templateCat: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 8, marginBottom: 4, paddingHorizontal: 2 },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  templateAvatar: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  templateInitial: { fontSize: 14, fontWeight: '800' },
  templateName: { fontSize: 15, fontWeight: '600', flex: 1 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: BorderRadius.lg,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: BorderRadius.lg, borderWidth: 1.5 },
  editActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: BorderRadius.lg, borderWidth: 1.5 },
  closeRowBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: BorderRadius.lg },
});