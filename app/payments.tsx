import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/colors';
import PaymentAccountCard from '../components/PaymentAccountCard';
import { mockAccounts } from '../constants/mockData';

export default function PaymentsScreen() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(true);
  const total = mockAccounts.reduce((s, a) => s + a.balance, 0);
  const formatted = `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Payments</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={theme.textInverse} />
          <Text style={[styles.addBtnText, { color: theme.textInverse }]}>Link Account</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Balance Card */}
        <View style={[styles.totalCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>{visible ? formatted : '₱ ••••••'}</Text>
            <TouchableOpacity onPress={() => setVisible((v) => !v)} activeOpacity={0.7}>
              <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.totalSub}>Across {mockAccounts.length} linked accounts</Text>
        </View>

        {/* Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>LINKED ACCOUNTS</Text>
          {mockAccounts.map((account) => (
            <PaymentAccountCard
              key={account.id}
              account={visible ? account : { ...account, balance: 0 }}
              onPress={() => {}}
            />
          ))}
        </View>

        {/* Add More */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>ADD MORE</Text>
          {['GrabPay', 'ShopeePay', 'PayMaya'].map((name) => (
            <TouchableOpacity
              key={name}
              style={[styles.addRow, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
              activeOpacity={0.75}
            >
              <View style={[styles.addRowIcon, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="wallet-outline" size={20} color={theme.textMuted} />
              </View>
              <Text style={[styles.addRowText, { color: theme.textSecondary }]}>{name}</Text>
              <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
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
  content: { padding: Spacing.xl },
  totalCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.xl },
  totalLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalAmount: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  totalSub: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.labelLarge, letterSpacing: 1.2, marginBottom: Spacing.md },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.sm,
  },
  addRowIcon: { width: 38, height: 38, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  addRowText: { ...Typography.bodyMedium, flex: 1 },
});
