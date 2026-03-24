import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';

// ── D-Wallet logo mark for Home tab ───────────────────────────────────────
function DWalletNavLogo({ active, color }: { active: boolean; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 100 100">
      <Rect x="8" y="10" width="72" height="80" rx="16" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 5} />
      <Rect x="72" y="38" width="18" height="24" rx="5" fill={active ? 'rgba(255,255,255,0.6)' : color} opacity={active ? 1 : 0.7} />
      <Circle cx="81" cy="50" r="3" fill={active ? color : 'rgba(255,255,255,0.3)'} />
      <Rect x="16" y="18" width="46" height="48" rx="6" fill={active ? 'rgba(0,0,0,0.35)' : color} opacity={active ? 1 : 0.5} />
      <Rect x="38" y="24" width="18" height="36" rx="10" fill={active ? color : 'rgba(255,255,255,0.4)'} />
    </Svg>
  );
}

// ── ID card icon for IDs tab ───────────────────────────────────────────────
function IDNavIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 100 100">
      <Rect x="6" y="22" width="88" height="56" rx="10"
        fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 5} />
      <Circle cx="30" cy="50" r="13"
        fill={active ? 'rgba(255,255,255,0.9)' : color} opacity={active ? 1 : 0.8} />
      <Rect x="50" y="38" width="30" height="6" rx="3"
        fill={active ? 'rgba(255,255,255,0.85)' : color} opacity={active ? 1 : 0.7} />
      <Rect x="50" y="50" width="22" height="5" rx="2.5"
        fill={active ? 'rgba(255,255,255,0.6)' : color} opacity={active ? 1 : 0.5} />
      <Rect x="50" y="62" width="26" height="5" rx="2.5"
        fill={active ? 'rgba(255,255,255,0.4)' : color} opacity={active ? 1 : 0.35} />
    </Svg>
  );
}

// ── Wallet icon for Payments tab ──────────────────────────────────────────
function WalletNavIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 100 100">
      <Rect x="6" y="28" width="84" height="58" rx="12"
        fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 5} />
      {/* Card slots strip */}
      <Rect x="60" y="38" width="24" height="26" rx="7"
        fill={active ? 'rgba(255,255,255,0.9)' : 'none'}
        stroke={active ? 'none' : color} strokeWidth="4" />
      <Circle cx="72" cy="51" r="5"
        fill={active ? color : color} opacity={active ? 1 : 0.6} />
      {/* Top flap */}
      <Path d="M6 44 C6 32 14 28 26 28 L74 28 C86 28 94 32 94 44"
        fill={active ? 'rgba(255,255,255,0.2)' : color} opacity={active ? 1 : 0.4} />
      {/* Card lines */}
      <Rect x="14" y="62" width="38" height="5" rx="2.5"
        fill={active ? 'rgba(255,255,255,0.7)' : color} opacity={active ? 1 : 0.6} />
      <Rect x="14" y="72" width="26" height="5" rx="2.5"
        fill={active ? 'rgba(255,255,255,0.45)' : color} opacity={active ? 1 : 0.4} />
    </Svg>
  );
}

// ── QR code icon ──────────────────────────────────────────────────────────
function QRNavIcon({ active, color }: { active: boolean; color: string }) {
  const fill = active ? 'rgba(255,255,255,0.9)' : color;
  const bg = active ? color : 'none';
  const stroke = active ? 'none' : color;
  return (
    <Svg width={24} height={24} viewBox="0 0 100 100">
      <Rect x="8" y="8" width="36" height="36" rx="6" fill={bg} stroke={stroke} strokeWidth="5" />
      <Rect x="18" y="18" width="16" height="16" rx="3" fill={fill} />
      <Rect x="56" y="8" width="36" height="36" rx="6" fill={bg} stroke={stroke} strokeWidth="5" />
      <Rect x="66" y="18" width="16" height="16" rx="3" fill={fill} />
      <Rect x="8" y="56" width="36" height="36" rx="6" fill={bg} stroke={stroke} strokeWidth="5" />
      <Rect x="18" y="66" width="16" height="16" rx="3" fill={fill} />
      <Rect x="56" y="56" width="16" height="16" rx="3" fill={active ? 'rgba(255,255,255,0.9)' : color} />
      <Rect x="78" y="56" width="16" height="16" rx="3" fill={active ? 'rgba(255,255,255,0.7)' : color} opacity={active ? 1 : 0.7} />
      <Rect x="56" y="78" width="16" height="16" rx="3" fill={active ? 'rgba(255,255,255,0.7)' : color} opacity={active ? 1 : 0.7} />
      <Rect x="78" y="78" width="16" height="16" rx="3" fill={active ? 'rgba(255,255,255,0.9)' : color} />
    </Svg>
  );
}

// ── Profile / person icon ─────────────────────────────────────────────────
function ProfileNavIcon({ active, color }: { active: boolean; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 100 100">
      <Circle cx="50" cy="35" r="20"
        fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 5} />
      <Path d="M10 88 C10 68 28 54 50 54 C72 54 90 68 90 88"
        fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 5}
        strokeLinecap="round" />
    </Svg>
  );
}

function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBarBg,
            borderTopWidth: 0,
            elevation: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: isDark ? 0.55 : 0.1,
            shadowRadius: 20,
            paddingBottom: Platform.OS === 'ios' ? 26 : 12,
            paddingTop: 10,
            height: Platform.OS === 'ios' ? 86 : 70,
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginTop: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'HOME',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeWrap, { backgroundColor: theme.primaryMuted }] : styles.iconWrap}>
                <DWalletNavLogo active={focused} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="ids"
          options={{
            title: 'IDs',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeWrap, { backgroundColor: theme.primaryMuted }] : styles.iconWrap}>
                <IDNavIcon active={focused} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: 'WALLET',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeWrap, { backgroundColor: theme.primaryMuted }] : styles.iconWrap}>
                <WalletNavIcon active={focused} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="qr"
          options={{
            title: 'QR',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeWrap, { backgroundColor: theme.primaryMuted }] : styles.iconWrap}>
                <QRNavIcon active={focused} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'PROFILE',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeWrap, { backgroundColor: theme.primaryMuted }] : styles.iconWrap}>
                <ProfileNavIcon active={focused} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 38, height: 30, alignItems: 'center', justifyContent: 'center' },
  activeWrap: { width: 52, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}