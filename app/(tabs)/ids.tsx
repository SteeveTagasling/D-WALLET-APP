import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Alert, TextInput,
} from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../constants/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/colors';
import IDCardItem from '../../components/IDCardItem';
import { loadIDs, saveIDs } from '../../constants/storage';
import type { StoredID } from '../../constants/types';

// ── Official-style ID logos ────────────────────────────────────────────────

function PhilSysLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#0038A8" />
      {/* Philippine sun rays */}
      <G transform="translate(50,44)">
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <Path key={i} d={`M0,0 L${Math.cos((deg-90)*Math.PI/180)*22} ${Math.sin((deg-90)*Math.PI/180)*22}`}
            stroke="#FCD116" strokeWidth="2.5" strokeLinecap="round" />
        ))}
        <Circle cx="0" cy="0" r="10" fill="#FCD116" />
        <Circle cx="0" cy="0" r="6" fill="#0038A8" />
      </G>
      {/* PSA text */}
      <Rect x="12" y="72" width="76" height="18" rx="4" fill="#CE1126" />
      <Path d="M20 76 L20 86 M20 81 L26 81 M26 76 L26 86" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <Path d="M32 76 L36 86 L40 76" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LTOLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#D32F2F" />
      {/* Steering wheel */}
      <Circle cx="50" cy="46" r="28" stroke="white" strokeWidth="5" fill="none" />
      <Circle cx="50" cy="46" r="10" stroke="white" strokeWidth="4" fill="#D32F2F" />
      <Path d="M50 18 L50 36 M50 56 L50 74 M22 46 L40 46 M60 46 L78 46"
        stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* LTO badge */}
      <Rect x="18" y="76" width="64" height="17" rx="4" fill="white" />
      <Path d="M26 80 L26 89 L32 89" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M36 80 L40 84 L44 80 L44 89 M36 80 L36 89" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M50 84 L50 89 M50 80 L50 84 M48 80 L54 80 M48 84 L54 84 M48 89 L54 89" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M60 80 L60 89 M60 80 L68 80 L68 84 L60 84" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function SSSLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#003087" />
      {/* SSS shield */}
      <Path d="M50 10 L80 25 L80 55 C80 72 65 86 50 92 C35 86 20 72 20 55 L20 25 Z"
        fill="none" stroke="#FFD700" strokeWidth="3" />
      <Path d="M50 18 L74 31 L74 55 C74 69 61 81 50 86 C39 81 26 69 26 55 L26 31 Z"
        fill="#003087" />
      {/* SSS letters */}
      <Path d="M32 42 C32 38 38 36 42 39 C44 41 42 44 38 45 C34 46 32 49 35 52 C38 54 44 53 44 49"
        stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Path d="M48 42 C48 38 54 36 58 39 C60 41 58 44 54 45 C50 46 48 49 51 52 C54 54 60 53 60 49"
        stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Path d="M64 42 C64 38 70 36 74 39 C76 41 74 44 70 45 C66 46 64 49 67 52 C70 54 76 53 76 49"
        stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Rect x="20" y="73" width="60" height="16" rx="4" fill="#FFD700" />
      <Path d="M30 77 L30 85 L36 85" stroke="#003087" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M40 81 A4 5 0 0 1 48 81 A4 5 0 0 1 40 81 Z" stroke="#003087" strokeWidth="2.5" fill="none" />
      <Path d="M52 77 L52 85 M52 77 L60 77 L60 81 L52 81" stroke="#003087" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M64 77 L64 85 M64 77 L72 77 M64 81 L70 81 M64 85 L72 85" stroke="#003087" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function PassportLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#0038A8" />
      {/* Passport book */}
      <Rect x="18" y="14" width="64" height="76" rx="6" fill="#0D3B8A" stroke="#FCD116" strokeWidth="2" />
      {/* Philippine eagle stylized */}
      <Circle cx="50" cy="38" r="14" fill="none" stroke="#FCD116" strokeWidth="2" />
      <G transform="translate(50,38)">
        {[0,60,120,180,240,300].map((deg, i) => (
          <Path key={i} d={`M0,0 L${Math.cos((deg-90)*Math.PI/180)*10} ${Math.sin((deg-90)*Math.PI/180)*10}`}
            stroke="#FCD116" strokeWidth="2" />
        ))}
        <Circle cx="0" cy="0" r="4" fill="#FCD116" />
      </G>
      {/* DFA text */}
      <Rect x="24" y="62" width="52" height="14" rx="3" fill="#CE1126" />
      <Path d="M30 65 L30 74 C30 74 34 76 36 72 C38 68 36 65 30 65Z" stroke="white" strokeWidth="2" fill="none" />
      <Path d="M40 65 L40 74 M40 65 L46 65" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M50 65 L50 74 M48 65 L54 65 M48 74 L54 74" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* PASSPORT text bar */}
      <Rect x="18" y="80" width="64" height="12" rx="3" fill="#FCD116" />
      <Path d="M22 83 L22 90 L25 90 C27 90 28 88 27 86 C26 84 24 84 22 84" stroke="#0038A8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function UMIDLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#F59E0B" />
      <Rect x="15" y="22" width="70" height="56" rx="8" fill="white" opacity="0.2" stroke="white" strokeWidth="2" />
      <Circle cx="35" cy="46" r="12" fill="white" opacity="0.9" />
      <Rect x="52" y="36" width="26" height="5" rx="2.5" fill="white" />
      <Rect x="52" y="45" width="20" height="4" rx="2" fill="rgba(255,255,255,0.7)" />
      <Rect x="52" y="53" width="22" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
      <Rect x="15" y="68" width="70" height="10" rx="4" fill="rgba(0,0,0,0.2)" />
      <Path d="M24 71 L24 75 M24 71 L27 71 L27 73 L24 73" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M31 71 L31 75 L35 71 L35 75" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M39 73 A3 3 0 1 1 45 73 A3 3 0 0 1 39 73 Z" stroke="white" strokeWidth="2" fill="none" />
    </Svg>
  );
}

function VoterLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#7C3AED" />
      {/* Ballot box */}
      <Rect x="20" y="30" width="60" height="50" rx="6" fill="none" stroke="white" strokeWidth="3" />
      <Rect x="38" y="18" width="24" height="20" rx="4" fill="none" stroke="white" strokeWidth="3" />
      <Rect x="44" y="22" width="12" height="4" rx="2" fill="white" />
      {/* Check mark */}
      <Path d="M33 52 L43 63 L67 40" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function PhilHealthLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#00853F" />
      {/* Cross + heart */}
      <Path d="M42 20 L42 40 L22 40 L22 58 L42 58 L42 78 L58 78 L58 58 L78 58 L78 40 L58 40 L58 20 Z"
        fill="white" opacity="0.9" />
      <Path d="M50 52 C50 52 36 43 36 35 C36 29 42 26 50 35 C58 26 64 29 64 35 C64 43 50 52 50 52Z"
        fill="#CE1126" />
    </Svg>
  );
}

function TINLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#16A34A" />
      <Rect x="14" y="20" width="72" height="60" rx="8" fill="none" stroke="white" strokeWidth="2.5" />
      {/* Document lines */}
      <Path d="M26 36 L74 36" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <Path d="M26 46 L60 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <Path d="M26 56 L68 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <Path d="M26 66 L50 66" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* BIR seal */}
      <Circle cx="68" cy="62" r="14" fill="#15803D" stroke="white" strokeWidth="2" />
      <Path d="M62 62 L66 66 L74 57" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function PostalLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#EA580C" />
      {/* Envelope */}
      <Rect x="14" y="28" width="72" height="50" rx="6" fill="none" stroke="white" strokeWidth="3" />
      <Path d="M14 34 L50 58 L86 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Stamp */}
      <Rect x="62" y="16" width="24" height="24" rx="3" fill="white" />
      <Rect x="65" y="19" width="18" height="18" rx="2" fill="#EA580C" stroke="white" strokeWidth="1.5" strokeDasharray="3,2" />
      <Circle cx="74" cy="28" r="5" fill="white" opacity="0.8" />
    </Svg>
  );
}

function PRCLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#BE185D" />
      {/* Graduation cap */}
      <Path d="M50 22 L86 38 L50 54 L14 38 Z" fill="white" />
      <Path d="M50 54 L50 72" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <Path d="M30 46 L30 64 C30 64 40 72 50 72 C60 72 70 64 70 64 L70 46" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="80" cy="38" r="4" fill="white" />
      <Path d="M80 42 L80 55 L76 60" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

function CustomIDLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="16" fill="#64748B" />
      <Rect x="14" y="26" width="72" height="48" rx="8" fill="none" stroke="white" strokeWidth="3" />
      <Circle cx="34" cy="48" r="10" stroke="white" strokeWidth="2.5" fill="none" />
      <Path d="M48 40 L76 40 M48 50 L70 50 M48 60 L74 60" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

const ID_TEMPLATES = [
  { name: 'PhilSys ID', Logo: PhilSysLogo, iconEmoji: '🪪', iconColor: '#0038A8', issuedBy: 'PSA Philippines' },
  { name: "Driver's License", Logo: LTOLogo, iconEmoji: '🚗', iconColor: '#D32F2F', issuedBy: 'LTO Philippines' },
  { name: 'SSS ID', Logo: SSSLogo, iconEmoji: '🏛️', iconColor: '#003087', issuedBy: 'Social Security System' },
  { name: 'Passport', Logo: PassportLogo, iconEmoji: '📘', iconColor: '#0038A8', issuedBy: 'DFA Philippines' },
  { name: 'UMID', Logo: UMIDLogo, iconEmoji: '🪪', iconColor: '#F59E0B', issuedBy: 'SSS / GSIS' },
  { name: "Voter's ID", Logo: VoterLogo, iconEmoji: '🗳️', iconColor: '#7C3AED', issuedBy: 'COMELEC' },
  { name: 'PhilHealth ID', Logo: PhilHealthLogo, iconEmoji: '🏥', iconColor: '#00853F', issuedBy: 'PhilHealth' },
  { name: 'TIN ID', Logo: TINLogo, iconEmoji: '📋', iconColor: '#16A34A', issuedBy: 'BIR Philippines' },
  { name: 'Postal ID', Logo: PostalLogo, iconEmoji: '📮', iconColor: '#EA580C', issuedBy: 'PhilPost' },
  { name: 'PRC ID', Logo: PRCLogo, iconEmoji: '🎓', iconColor: '#BE185D', issuedBy: 'PRC Philippines' },
];

const EMPTY_FORM = { name: '', cardNumber: '', expiryDate: '', issuedBy: '', iconEmoji: '🪪', iconColor: '#64748B', status: 'valid' as const };

const STATUS_CFG = {
  valid:    { label: 'Valid',    color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)' },
  expiring: { label: 'Expiring', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  expired:  { label: 'Expired',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)' },
};

export default function IDsScreen() {
  const { theme, isDark } = useTheme();
  const [ids, setIds] = useState<StoredID[]>([]);
  const [selected, setSelected] = useState<StoredID | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [chosenLogo, setChosenLogo] = useState<React.ComponentType<{size?: number}> | null>(null);

  useFocusEffect(useCallback(() => { loadIDs().then(setIds); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Remove ID', 'Remove this ID from your vault?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const updated = ids.filter((i) => i.id !== id);
        setIds(updated); await saveIDs(updated); setSelected(null);
      }},
    ]);
  };

  const handleSelectTemplate = (t: typeof ID_TEMPLATES[0]) => {
    setForm({ ...EMPTY_FORM, name: t.name, iconEmoji: t.iconEmoji, iconColor: t.iconColor, issuedBy: t.issuedBy });
    setChosenLogo(() => t.Logo);
    setShowTemplates(false);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter an ID name.'); return; }
    const newID: StoredID = {
      id: Date.now().toString(),
      name: form.name.trim(),
      expiryDate: form.expiryDate,
      expiryDisplay: form.expiryDate ? `Exp: ${form.expiryDate}` : 'No expiry',
      status: form.status,
      iconEmoji: form.iconEmoji,
      iconColor: form.iconColor,
      issuedBy: form.issuedBy.trim() || undefined,
      cardNumber: form.cardNumber.trim() || undefined,
    };
    const updated = [...ids, newID];
    setIds(updated); await saveIDs(updated);
    setShowAddModal(false); setForm(EMPTY_FORM); setChosenLogo(null);
  };

  const stats = [
    { label: 'Valid',    value: ids.filter(i => i.status === 'valid').length,    ...STATUS_CFG.valid },
    { label: 'Expiring', value: ids.filter(i => i.status === 'expiring').length, ...STATUS_CFG.expiring },
    { label: 'Expired',  value: ids.filter(i => i.status === 'expired').length,  ...STATUS_CFG.expired },
    { label: 'Total',    value: ids.length, color: '#fff', bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' },
  ];

  // Find template logo for detail view
  const selectedTemplate = selected
    ? ID_TEMPLATES.find(t => t.iconColor === selected.iconColor && t.issuedBy === selected.issuedBy)
    : null;
  const SelectedLogo = selectedTemplate?.Logo ?? CustomIDLogo;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>

      {/* ── Hero ── */}
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D'] : ['#0B5C2A', '#16783C']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>D-WALLET</Text>
            <Text style={styles.heroTitle}>ID Vault</Text>
            <Text style={styles.heroSub}>Store & manage your Philippine IDs</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowTemplates(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color="#1A7A3C" />
            <Text style={styles.addBtnText}>Add ID</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroStats}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.statChipVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statChipLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* ── ID List ── */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ids.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              <CustomIDLogo size={48} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Your ID Vault is Empty</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              Tap "Add ID" to securely store your government-issued IDs.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowTemplates(true)} activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.textInverse} />
              <Text style={[styles.emptyBtnText, { color: theme.textInverse }]}>Add Your First ID</Text>
            </TouchableOpacity>
          </View>
        ) : (
          ids.map((id) => <IDCardItem key={id.id} item={id} onPress={() => setSelected(id)} />)
        )}
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Template Picker ── */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.sheetHead}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Choose ID Type</Text>
                <Text style={[styles.sheetSub, { color: theme.textMuted }]}>Select your government-issued ID</Text>
              </View>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => setShowTemplates(false)}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {ID_TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.name}
                  style={[styles.templateRow, { borderBottomColor: theme.borderSubtle }]}
                  onPress={() => handleSelectTemplate(t)}
                  activeOpacity={0.75}
                >
                  <t.Logo size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateName, { color: theme.textPrimary }]}>{t.name}</Text>
                    <Text style={[styles.templateSub, { color: theme.textMuted }]}>{t.issuedBy}</Text>
                  </View>
                  <View style={[styles.arrowChip, { backgroundColor: theme.surfaceElevated }]}>
                    <Ionicons name="chevron-forward" size={14} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.templateRow, { borderBottomWidth: 0 }]}
                onPress={() => { setChosenLogo(() => CustomIDLogo); setShowTemplates(false); setShowAddModal(true); }}
                activeOpacity={0.75}
              >
                <CustomIDLogo size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateName, { color: theme.textPrimary }]}>Other / Custom ID</Text>
                  <Text style={[styles.templateSub, { color: theme.textMuted }]}>Enter details manually</Text>
                </View>
                <View style={[styles.arrowChip, { backgroundColor: theme.surfaceElevated }]}>
                  <Ionicons name="chevron-forward" size={14} color={theme.primary} />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Add ID Form ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
            <View style={styles.sheetHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                {chosenLogo ? React.createElement(chosenLogo, { size: 44 }) : <CustomIDLogo size={44} />}
                <View>
                  <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Add {form.name || 'ID'}</Text>
                  <Text style={[styles.sheetSub, { color: theme.textMuted }]}>Fill in your ID details</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              {[
                { label: 'ID Name *', key: 'name', placeholder: 'e.g. PhilSys ID' },
                { label: 'Card Number', key: 'cardNumber', placeholder: 'Optional' },
                { label: 'Expiry Date', key: 'expiryDate', placeholder: 'e.g. Dec 2030' },
                { label: 'Issued By', key: 'issuedBy', placeholder: 'e.g. PSA Philippines' },
              ].map((f, i, arr) => (
                <View key={f.key} style={[styles.formRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.textPrimary }]}
                    value={(form as any)[f.key]}
                    onChangeText={(v) => setForm(p => ({ ...p, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              ))}
              <View style={[styles.formRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>Status</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['valid','expiring','expired'] as const).map((s) => {
                    const cfg = STATUS_CFG[s]; const active = form.status === s;
                    return (
                      <TouchableOpacity key={s}
                        style={[styles.statusChip, active ? { backgroundColor: cfg.bg, borderColor: cfg.color } : { backgroundColor: 'transparent', borderColor: theme.border }]}
                        onPress={() => setForm(p => ({ ...p, status: s }))}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? cfg.color : theme.textMuted }}>{cfg.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} activeOpacity={0.85}>
              <Ionicons name="save-outline" size={18} color={theme.textInverse} />
              <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>Save to Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {selected && (() => {
              const cfg = STATUS_CFG[selected.status];
              return (
                <>
                  <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: theme.border }]} /></View>
                  {/* ID Card Preview */}
                  <LinearGradient
                    colors={[selected.iconColor, selected.iconColor + '99']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.idPreview}
                  >
                    <View style={styles.idPreviewTop}>
                      <SelectedLogo size={52} />
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.idPreviewName}>{selected.name}</Text>
                    {selected.issuedBy && <Text style={styles.idPreviewIssuer}>{selected.issuedBy}</Text>}
                    {selected.cardNumber && (
                      <Text style={styles.idPreviewNum}>•••• {selected.cardNumber.slice(-4)}</Text>
                    )}
                  </LinearGradient>

                  {/* Info rows */}
                  <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border, marginBottom: 12 }]}>
                    {selected.cardNumber && (
                      <View style={[styles.formRow, { borderBottomColor: theme.borderSubtle }]}>
                        <Text style={[styles.formLabel, { color: theme.textMuted }]}>Card No.</Text>
                        <Text style={[styles.detailVal, { color: theme.textPrimary }]}>{selected.cardNumber}</Text>
                      </View>
                    )}
                    <View style={[styles.formRow, { borderBottomColor: theme.borderSubtle }]}>
                      <Text style={[styles.formLabel, { color: theme.textMuted }]}>Expiry</Text>
                      <Text style={[styles.detailVal, { color: theme.textPrimary }]}>{selected.expiryDisplay}</Text>
                    </View>
                    <View style={[styles.formRow, { borderBottomWidth: 0 }]}>
                      <Text style={[styles.formLabel, { color: theme.textMuted }]}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.deleteBtn, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.07)' }]}
                    onPress={() => handleDelete(selected.id)} activeOpacity={0.75}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>Remove from Vault</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.closeRowBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => setSelected(null)}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: Spacing.xl },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.xl },
  heroEyebrow: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, fontWeight: '700', marginBottom: 2 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontWeight: '500' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#1A7A3C' },
  heroStats: { flexDirection: 'row', gap: Spacing.sm },
  statChip: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: BorderRadius.md, borderWidth: 1, gap: 2 },
  statChipVal: { fontSize: 20, fontWeight: '800' },
  statChipLbl: { fontSize: 8, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.4 },
  list: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  emptyState: { alignItems: 'center', paddingTop: 54, gap: 12 },
  emptyIconWrap: { width: 90, height: 90, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.xl, paddingVertical: 13, borderRadius: 24, marginTop: 6 },
  emptyBtnText: { fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, padding: Spacing.xl, paddingBottom: 44 },
  handleRow: { alignItems: 'center', marginBottom: Spacing.lg },
  handle: { width: 36, height: 4, borderRadius: 2 },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  sheetSub: { fontSize: 12, marginTop: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1 },
  templateName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  templateSub: { fontSize: 11 },
  arrowChip: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  formCard: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, overflow: 'hidden' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  formLabel: { fontSize: 13, fontWeight: '600' },
  formInput: { fontSize: 13, textAlign: 'right', flex: 1, marginLeft: 12 },
  detailVal: { fontSize: 13, fontWeight: '600' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 24, borderWidth: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 15, borderRadius: BorderRadius.lg },
  saveBtnText: { fontSize: 15, fontWeight: '800' },
  idPreview: { borderRadius: BorderRadius.xl, padding: 18, marginBottom: 14, minHeight: 140 },
  idPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  idPreviewName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  idPreviewIssuer: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '500' },
  idPreviewNum: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8, fontWeight: '700', letterSpacing: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 24, borderWidth: 1 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginBottom: 8 },
  closeRowBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.lg },
});