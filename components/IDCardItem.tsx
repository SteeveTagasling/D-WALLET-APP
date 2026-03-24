import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import type { StoredID } from '../constants/types';

// Map of issuer → mini logo rendered inline
function AgencyLogo({ iconColor, size = 40 }: { iconColor: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="14" fill={iconColor} />
      {/* Generic ID card placeholder — outer border */}
      <Rect x="12" y="24" width="76" height="52" rx="8" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
      {/* Photo placeholder circle */}
      <Circle cx="32" cy="50" r="12" fill="rgba(255,255,255,0.85)" />
      {/* Name lines */}
      <Rect x="50" y="38" width="28" height="5" rx="2.5" fill="white" />
      <Rect x="50" y="48" width="22" height="4" rx="2" fill="rgba(255,255,255,0.65)" />
      <Rect x="50" y="58" width="25" height="4" rx="2" fill="rgba(255,255,255,0.45)" />
    </Svg>
  );
}

const STATUS_CONFIG = {
  valid:    { label: 'Valid',    color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)' },
  expiring: { label: 'Expiring', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  expired:  { label: 'Expired',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)' },
};

interface Props {
  item: StoredID;
  onPress?: () => void;
}

export default function IDCardItem({ item, onPress }: Props) {
  const { theme } = useTheme();
  const cfg = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left accent bar matches ID color */}
      <View style={[styles.accentBar, { backgroundColor: item.iconColor }]} />

      <View style={styles.logoWrap}>
        <AgencyLogo iconColor={item.iconColor} size={44} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        {item.issuedBy && (
          <Text style={[styles.issuer, { color: theme.textMuted }]} numberOfLines={1}>{item.issuedBy}</Text>
        )}
        <Text style={[styles.expiry, { color: theme.textMuted }]}>{item.expiryDisplay}</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  logoWrap: {
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
  },
  info: {
    flex: 1,
    gap: 2,
    paddingVertical: 12,
  },
  name: { fontSize: 14, fontWeight: '700' },
  issuer: { fontSize: 11 },
  expiry: { fontSize: 11 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 14,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});