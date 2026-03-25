import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import type { StoredID } from '../constants/types';

const STATUS_CONFIG = {
  valid:    { label: 'Valid',    color: '#10B981', bg: 'rgba(16,185,129,0.13)', dot: '#10B981', border: 'rgba(16,185,129,0.3)' },
  expiring: { label: 'Expiring', color: '#F59E0B', bg: 'rgba(245,158,11,0.13)', dot: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  expired:  { label: 'Expired',  color: '#EF4444', bg: 'rgba(239,68,68,0.13)',  dot: '#EF4444', border: 'rgba(239,68,68,0.3)' },
};

export default function IDCardItem({
  item,
  onPress,
  onLongPress,
}: {
  item: StoredID;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const { theme } = useTheme();
  const cfg = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.78}
    >
      {/* Left color bar */}
      <View style={[styles.accentBar, { backgroundColor: item.iconColor }]} />

      {/* Icon badge */}
      <View style={[styles.iconWrap, { backgroundColor: item.iconColor + '22', borderColor: item.iconColor + '44' }]}>
        <Text style={styles.iconEmoji}>{item.iconEmoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        {item.issuedBy && (
          <Text style={[styles.issuer, { color: theme.textMuted }]} numberOfLines={1}>{item.issuedBy}</Text>
        )}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={10} color={theme.textMuted} />
          <Text style={[styles.expiry, { color: theme.textMuted }]}>{item.expiryDisplay}</Text>
          {item.cardNumber && (
            <>
              <Text style={[styles.dot2, { color: theme.textMuted }]}>·</Text>
              <Ionicons name="card-outline" size={10} color={theme.textMuted} />
              <Text style={[styles.expiry, { color: theme.textMuted }]}>••{item.cardNumber.slice(-4)}</Text>
            </>
          )}
        </View>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={styles.longPressHint}>
          <Ionicons name="ellipsis-horizontal" size={12} color={theme.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    minHeight: 76,
  },
  accentBar: { width: 4, alignSelf: 'stretch' },
  iconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 14, marginRight: 12, borderWidth: 1,
  },
  iconEmoji: { fontSize: 22 },
  info: { flex: 1, gap: 3, paddingVertical: 14 },
  name: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  issuer: { fontSize: 11, letterSpacing: 0.1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  expiry: { fontSize: 10 },
  dot2: { fontSize: 10, opacity: 0.4 },
  right: { alignItems: 'flex-end', gap: 8, paddingRight: 14, paddingVertical: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  longPressHint: { opacity: 0.4 },
});