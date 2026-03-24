import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import IDCardItem from '../components/IDCardItem';
import { mockIDs } from '../constants/mockData';
import type { StoredID } from '../constants/types';

export default function IDsScreen() {
  const { theme } = useTheme();
  const [ids, setIds] = useState<StoredID[]>(mockIDs);
  const [selected, setSelected] = useState<StoredID | null>(null);

  const handleDelete = (id: string) => {
    Alert.alert('Remove ID', 'Remove this ID from your vault?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { setIds((p) => p.filter((i) => i.id !== id)); setSelected(null); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>ID Vault</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={theme.textInverse} />
          <Text style={[styles.addBtnText, { color: theme.textInverse }]}>Add ID</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
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
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Add your government IDs to keep them organized.</Text>
          </View>
        ) : (
          ids.map((id) => <IDCardItem key={id.id} item={id} onPress={() => setSelected(id)} />)
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {selected && (
              <>
                <View style={styles.handleRow}>
                  <View style={[styles.handle, { backgroundColor: theme.border }]} />
                </View>
                <View style={styles.modalTop}>
                  <View style={[styles.modalIcon, { backgroundColor: theme.surfaceElevated }]}>
                    <Text style={{ fontSize: 28 }}>{selected.iconEmoji}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelected(null)}
                    style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
                  >
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.modalName, { color: theme.textPrimary }]}>{selected.name}</Text>
                {selected.issuedBy && (
                  <Text style={[styles.modalSub, { color: theme.textMuted }]}>Issued by: {selected.issuedBy}</Text>
                )}
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
                    <Text style={[styles.infoValue, {
                      color: selected.status === 'valid' ? theme.success : selected.status === 'expiring' ? theme.warning : theme.error,
                      fontWeight: '700',
                    }]}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: theme.error }]}
                  onPress={() => handleDelete(selected.id)}
                  activeOpacity={0.75}
                >
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1,
  },
  title: { ...Typography.h1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  addBtnText: { ...Typography.labelMedium, fontWeight: '700' },
  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { ...Typography.h2 },
  summaryLabel: { ...Typography.caption, marginTop: 2 },
  divider: { width: 1, height: 28, marginHorizontal: Spacing.xs },
  list: { padding: Spacing.xl },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyTitle: { ...Typography.h2 },
  emptySub: { ...Typography.bodyMedium, textAlign: 'center', maxWidth: 280 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    padding: Spacing.xl, paddingBottom: 40,
  },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  modalIcon: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  modalName: { ...Typography.h1, marginBottom: 4 },
  modalSub: { ...Typography.bodyMedium, marginBottom: Spacing.lg },
  infoBox: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1 },
  infoLabel: { ...Typography.bodyMedium },
  infoValue: { ...Typography.bodyMedium, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5 },
  deleteBtnText: { ...Typography.labelMedium, fontWeight: '700' },
});
