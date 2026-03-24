import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import IDCardItem from '../components/IDCardItem';
import { loadIDs, saveIDs } from '../constants/storage';
import type { StoredID } from '../constants/types';

const ID_TEMPLATES = [
  { name: 'PhilSys ID', iconEmoji: '🪪', iconColor: '#3B82F6', issuedBy: 'PSA Philippines' },
  { name: "Driver's License", iconEmoji: '🚗', iconColor: '#EF4444', issuedBy: 'LTO Philippines' },
  { name: 'SSS ID', iconEmoji: '🏛️', iconColor: '#10B981', issuedBy: 'Social Security System' },
  { name: 'Passport', iconEmoji: '📘', iconColor: '#6366F1', issuedBy: 'DFA Philippines' },
  { name: 'UMID', iconEmoji: '🪪', iconColor: '#F59E0B', issuedBy: 'SSS / GSIS' },
  { name: 'Voter\'s ID', iconEmoji: '🗳️', iconColor: '#8B5CF6', issuedBy: 'COMELEC' },
  { name: 'PhilHealth ID', iconEmoji: '🏥', iconColor: '#06B6D4', issuedBy: 'PhilHealth' },
  { name: 'TIN ID', iconEmoji: '📋', iconColor: '#84CC16', issuedBy: 'BIR Philippines' },
  { name: 'Postal ID', iconEmoji: '📮', iconColor: '#F97316', issuedBy: 'PhilPost' },
  { name: 'PRC ID', iconEmoji: '🎓', iconColor: '#EC4899', issuedBy: 'PRC Philippines' },
];

const EMPTY_FORM = { name: '', cardNumber: '', expiryDate: '', issuedBy: '', iconEmoji: '🪪', iconColor: '#3B82F6', status: 'valid' as const };

export default function IDsScreen() {
  const { theme } = useTheme();
  const [ids, setIds] = useState<StoredID[]>([]);
  const [selected, setSelected] = useState<StoredID | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useFocusEffect(useCallback(() => {
    loadIDs().then(setIds);
  }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Remove ID', 'Remove this ID from your vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const updated = ids.filter((i) => i.id !== id);
          setIds(updated);
          await saveIDs(updated);
          setSelected(null);
        }
      },
    ]);
  };

  const handleSelectTemplate = (t: typeof ID_TEMPLATES[0]) => {
    setForm({ ...EMPTY_FORM, name: t.name, iconEmoji: t.iconEmoji, iconColor: t.iconColor, issuedBy: t.issuedBy });
    setShowTemplates(false);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter an ID name.');
      return;
    }
    const expiryDisplay = form.expiryDate ? `Exp: ${form.expiryDate}` : 'No expiry';
    const newID: StoredID = {
      id: Date.now().toString(),
      name: form.name.trim(),
      expiryDate: form.expiryDate,
      expiryDisplay,
      status: form.status,
      iconEmoji: form.iconEmoji,
      iconColor: form.iconColor,
      issuedBy: form.issuedBy.trim() || undefined,
      cardNumber: form.cardNumber.trim() || undefined,
    };
    const updated = [...ids, newID];
    setIds(updated);
    await saveIDs(updated);
    setShowAddModal(false);
    setForm(EMPTY_FORM);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>ID Vault</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={() => setShowTemplates(true)}>
          <Ionicons name="add" size={20} color={theme.textInverse} />
          <Text style={[styles.addBtnText, { color: theme.textInverse }]}>Add ID</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryBar, { backgroundColor: theme.surfaceCard, borderBottomColor: theme.border }]}>
        {[
          { label: 'Valid', value: ids.filter((i) => i.status === 'valid').length, color: theme.success },
          { label: 'Expiring', value: ids.filter((i) => i.status === 'expiring').length, color: theme.warning },
          { label: 'Expired', value: ids.filter((i) => i.status === 'expired').length, color: theme.error },
          { label: 'Total', value: ids.length, color: theme.textPrimary },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ids.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No IDs Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Tap "Add ID" to store your government IDs.</Text>
          </View>
        ) : (
          ids.map((id) => <IDCardItem key={id.id} item={id} onPress={() => setSelected(id)} />)
        )}
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Template Picker Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <Text style={[styles.modalName, { color: theme.textPrimary, marginBottom: Spacing.lg }]}>Choose ID Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ID_TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.name}
                  style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]}
                  onPress={() => handleSelectTemplate(t)}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 24 }}>{t.iconEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateName, { color: theme.textPrimary }]}>{t.name}</Text>
                    <Text style={[styles.templateSub, { color: theme.textMuted }]}>{t.issuedBy}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]}
                onPress={() => { setShowTemplates(false); setShowAddModal(true); }}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 24 }}>📄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateName, { color: theme.textPrimary }]}>Other ID</Text>
                  <Text style={[styles.templateSub, { color: theme.textMuted }]}>Add a custom ID</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={[styles.deleteBtn, { borderColor: theme.border, marginTop: Spacing.md }]} onPress={() => setShowTemplates(false)}>
              <Text style={[styles.deleteBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add ID Form Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.modalTop}>
              <Text style={[styles.modalName, { color: theme.textPrimary }]}>
                {form.iconEmoji} Add {form.name || 'ID'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'ID Name *', key: 'name', placeholder: 'e.g. PhilSys ID' },
                { label: 'Card Number', key: 'cardNumber', placeholder: 'Optional' },
                { label: 'Expiry Date', key: 'expiryDate', placeholder: 'e.g. Dec 2030' },
                { label: 'Issued By', key: 'issuedBy', placeholder: 'e.g. PSA Philippines' },
              ].map((field, i, arr) => (
                <View key={field.key} style={[styles.infoRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={(form as any)[field.key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              ))}

              {/* Status Picker */}
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Status</Text>
                <View style={styles.statusRow}>
                  {(['valid', 'expiring', 'expired'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusBtn, { borderColor: form.status === s ? theme.primary : theme.border, backgroundColor: form.status === s ? theme.primaryMuted : 'transparent' }]}
                      onPress={() => setForm((f) => ({ ...f, status: s }))}
                    >
                      <Text style={[styles.statusBtnText, { color: form.status === s ? theme.primary : theme.textMuted }]}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.8}>
              <Ionicons name="save-outline" size={18} color={theme.textInverse} />
              <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>Save ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {selected && (
              <>
                <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
                <View style={styles.modalTop}>
                  <View style={[styles.modalIcon, { backgroundColor: theme.surfaceElevated }]}>
                    <Text style={{ fontSize: 28 }}>{selected.iconEmoji}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.modalName, { color: theme.textPrimary }]}>{selected.name}</Text>
                {selected.issuedBy && <Text style={[styles.modalSub, { color: theme.textMuted }]}>Issued by: {selected.issuedBy}</Text>}
                <View style={[styles.infoBox, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
                  {selected.cardNumber && (
                    <View style={[styles.infoRow, { borderBottomColor: theme.borderSubtle }]}>
                      <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Card No.</Text>
                      <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{selected.cardNumber}</Text>
                    </View>
                  )}
                  <View style={[styles.infoRow, { borderBottomColor: theme.borderSubtle }]}>
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Expiry</Text>
                    <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{selected.expiryDisplay}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Status</Text>
                    <Text style={[styles.infoValue, { color: selected.status === 'valid' ? theme.success : selected.status === 'expiring' ? theme.warning : theme.error, fontWeight: '700' }]}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.deleteBtn, { borderColor: theme.error }]} onPress={() => handleDelete(selected.id)} activeOpacity={0.75}>
                  <Ionicons name="trash-outline" size={16} color={theme.error} />
                  <Text style={[styles.deleteBtnText, { color: theme.error }]}>Remove ID</Text>
                </TouchableOpacity>
              </>
            )}
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
  summaryBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { ...Typography.h2 },
  summaryLabel: { ...Typography.caption, marginTop: 2 },
  divider: { width: 1, height: 28, marginHorizontal: Spacing.xs },
  list: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyTitle: { ...Typography.h2 },
  emptySub: { ...Typography.bodyMedium, textAlign: 'center', maxWidth: 280 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, padding: Spacing.xl, paddingBottom: 40 },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  modalIcon: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  modalName: { ...Typography.h1, marginBottom: 4 },
  modalSub: { ...Typography.bodyMedium, marginBottom: Spacing.lg },
  infoBox: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  infoLabel: { ...Typography.bodyMedium },
  infoValue: { ...Typography.bodyMedium, fontWeight: '600' },
  input: { ...Typography.bodyMedium, textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  statusRow: { flexDirection: 'row', gap: Spacing.xs },
  statusBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  statusBtnText: { ...Typography.labelSmall, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  saveBtnText: { ...Typography.labelMedium, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5 },
  deleteBtnText: { ...Typography.labelMedium, fontWeight: '700' },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  templateName: { ...Typography.bodyMedium, fontWeight: '600' },
  templateSub: { ...Typography.caption },
});