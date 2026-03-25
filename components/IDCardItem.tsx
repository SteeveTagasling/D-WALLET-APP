import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import type { StoredID } from '../constants/types';

function AgencyLogo({ iconColor, size = 42 }: { iconColor: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill={iconColor} />
      <Rect x="12" y="24" width="76" height="52" rx="9" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      <Circle cx="32" cy="50" r="12" fill="rgba(255,255,255,0.88)" />
      <Rect x="50" y="38" width="28" height="5" rx="2.5" fill="white" />
      <Rect x="50" y="48" width="22" height="4" rx="2" fill="rgba(255,255,255,0.65)" />
      <Rect x="50" y="58" width="25" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
}

const STATUS_CONFIG = {
  valid:    { label: 'Valid',    color: '#2ECC71', bg: 'rgba(46,204,113,0.12)',  dot: '#2ECC71' },
  expiring: { label: 'Expiring', color: '#F5A623', bg: 'rgba(245,166,35,0.12)', dot: '#F5A623' },
  expired:  { label: 'Expired',  color: '#FF5A5A', bg: 'rgba(255,90,90,0.12)',  dot: '#FF5A5A' },
};

export default function IDCardItem({ item, onPress }: { item: StoredID; onPress?: () => void }) {
  const { theme } = useTheme();
  const cfg = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
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
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
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
  },
  accentBar: { width: 3.5, alignSelf: 'stretch' },
  logoWrap: { paddingVertical: 14, paddingLeft: 14, paddingRight: 12 },
  info: { flex: 1, gap: 3, paddingVertical: 14 },
  name: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  issuer: { fontSize: 11, letterSpacing: 0.1 },
  expiry: { fontSize: 11 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 14,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
});