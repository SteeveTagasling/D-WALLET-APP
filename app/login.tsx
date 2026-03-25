import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import { useTheme } from '../constants/ThemeContext';
import { BorderRadius, Spacing } from '../constants/colors';
import { getAuthUser, saveAuthUser, getPin, savePin, setLoggedIn, generateOTP } from '../constants/auth';
import { saveUser } from '../constants/storage';

type Step = 'phone' | 'otp' | 'register' | 'set-pin' | 'enter-pin';

function DWalletLogo({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="logo_bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2ECC71" />
          <Stop offset="1" stopColor="#1A9B50" />
        </SvgGradient>
      </Defs>
      <Rect x="8" y="10" width="72" height="80" rx="18" fill="url(#logo_bg)" />
      <Rect x="72" y="38" width="18" height="24" rx="6" fill="rgba(255,255,255,0.35)" />
      <Circle cx="81" cy="50" r="3.5" fill="rgba(255,255,255,0.7)" />
      <Rect x="16" y="18" width="46" height="48" rx="8" fill="rgba(0,0,0,0.28)" />
      <Rect x="37" y="24" width="18" height="36" rx="11" fill="url(#logo_bg)" />
    </Svg>
  );
}

// ── PIN Dot Display ────────────────────────────────────────────────
function PinDots({ value, total = 4 }: { value: string; total?: number }) {
  const { theme } = useTheme();
  return (
    <View style={pinStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            pinStyles.dot,
            {
              backgroundColor: i < value.length ? theme.primary : 'transparent',
              borderColor: i < value.length ? theme.primary : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const pinStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginVertical: 28 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
});

// ── Numpad ─────────────────────────────────────────────────────────
function Numpad({ onPress, onDelete }: { onPress: (n: string) => void; onDelete: () => void }) {
  const { theme } = useTheme();
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  return (
    <View style={numStyles.grid}>
      {keys.map((k, i) => (
        <TouchableOpacity
          key={i}
          style={[
            numStyles.key,
            k === '' && { backgroundColor: 'transparent' },
            k !== '' && { backgroundColor: theme.surfaceCard, borderColor: theme.border },
          ]}
          onPress={() => k === '⌫' ? onDelete() : k !== '' ? onPress(k) : null}
          activeOpacity={k === '' ? 1 : 0.7}
          disabled={k === ''}
        >
          {k === '⌫' ? (
            <Ionicons name="backspace-outline" size={22} color={theme.textPrimary} />
          ) : (
            <Text style={[numStyles.keyText, { color: theme.textPrimary }]}>{k}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const numStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'center', gap: 14 },
  key: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  keyText: { fontSize: 26, fontWeight: '500' },
});

// ── OTP Boxes ──────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <TouchableOpacity onPress={() => inputRef.current?.focus()} activeOpacity={1}>
      <View style={otpStyles.row}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              otpStyles.box,
              {
                backgroundColor: theme.surfaceCard,
                borderColor: i === value.length ? theme.primary : theme.border,
                borderWidth: i === value.length ? 2 : 1,
              },
            ]}
          >
            <Text style={[otpStyles.digit, { color: theme.textPrimary }]}>{value[i] || ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        caretHidden
        autoFocus
        blurOnSubmit={false}
        showSoftInputOnFocus
        style={{ position: 'absolute', height: 1, width: 1, opacity: 0 }}
        onBlur={() => inputRef.current?.focus()}
      />
    </TouchableOpacity>
  );
}

const otpStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 24 },
  box: {
    width: 48, height: 58, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  digit: { fontSize: 24, fontWeight: '700' },
});

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [existingUser, setExistingUser] = useState(false);

  useEffect(() => {
    if (step === 'otp') {
      setOtpTimer(60);
      timerRef.current = setInterval(() => {
        setOtpTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0,4)} ${digits.slice(4)}`;
    return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
  };

  const rawPhone = phone.replace(/\D/g, '');

  const handleSendOTP = async () => {
    if (rawPhone.length !== 11 || !rawPhone.startsWith('09')) {
      Alert.alert('Invalid Number', 'Please enter a valid Philippine mobile number (09XX XXX XXXX).');
      return;
    }
    setLoading(true);
    const code = generateOTP();
    setGeneratedOtp(code);
    // Simulate SMS delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    // Check if user already registered
    const auth = await getAuthUser();
    if (auth && auth.phone === rawPhone) {
      setExistingUser(true);
    } else {
      setExistingUser(false);
    }

    console.log(`[D-Wallet OTP] Code for ${rawPhone}: ${code}`);
    Alert.alert('OTP Sent', `A 6-digit code has been sent to ${phone}.\n\n(Dev: ${code})`, [{ text: 'OK' }]);
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    if (otp !== generatedOtp) {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
      setOtp('');
      return;
    }
    if (existingUser) {
      // Returning user — go to PIN entry
      setStep('enter-pin');
    } else {
      // New user — collect name
      setStep('register');
    }
  };

  const handleRegister = () => {
    if (!firstName.trim()) { Alert.alert('Required', 'Please enter your first name.'); return; }
    setStep('set-pin');
  };

  const handleSetPin = () => {
    if (pin.length < 4) return;
    if (confirmPin.length === 0) {
      // Move to confirm step
      setConfirmPin('');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }
    completeRegistration();
  };

  const completeRegistration = async () => {
    setLoading(true);
    const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0) || ''}`.toUpperCase();
    const authUser = { phone: rawPhone, firstName: firstName.trim(), lastName: lastName.trim(), registeredAt: new Date().toISOString() };
    await saveAuthUser(authUser);
    await savePin(pin);
    await saveUser({
      firstName: firstName.trim(),
      lastName: lastName.trim() || '',
      initials,
      email: '',
      phone: rawPhone,
      memberSince: new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
      planType: 'Free',
    });
    await setLoggedIn(true);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const handleEnterPin = async (enteredPin: string) => {
    const savedPin = await getPin();
    if (enteredPin === savedPin) {
      await setLoggedIn(true);
      router.replace('/(tabs)');
    } else {
      setPinError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  const handleNumpad = (n: string) => {
    setPinError('');
    if (step === 'set-pin') {
      if (confirmPin.length === 0 && pin.length < 4) {
        const next = pin + n;
        setPin(next);
        if (next.length === 4) {
          // Wait a beat then move to confirm
          setTimeout(() => setConfirmPin(' '), 200);
        }
      } else if (confirmPin.trim().length < 4) {
        const cp = confirmPin.trim();
        const next = cp + n;
        setConfirmPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            if (pin !== next) {
              setPinError('PINs do not match. Try again.');
              setPin('');
              setConfirmPin('');
            } else {
              completeRegistration();
            }
          }, 300);
        }
      }
    } else if (step === 'enter-pin') {
      if (pin.length < 4) {
        const next = pin + n;
        setPin(next);
        if (next.length === 4) {
          setTimeout(() => handleEnterPin(next), 300);
        }
      }
    }
  };

  const handleNumpadDelete = () => {
    setPinError('');
    if (step === 'set-pin') {
      if (confirmPin.trim().length > 0) {
        setConfirmPin(confirmPin.trim().slice(0, -1));
      } else if (pin.length > 0) {
        setPin(pin.slice(0, -1));
        setConfirmPin('');
      }
    } else if (step === 'enter-pin') {
      setPin(pin.slice(0, -1));
    }
  };

  const isConfirming = step === 'set-pin' && confirmPin.trim().length >= 0 && pin.length === 4 && confirmPin !== ' ';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark ? ['#060E08', '#0A1A0D', '#0C1F10'] : ['#0B5C2A', '#16783C']}
        style={styles.heroBar}
      >
        <View style={styles.logoRow}>
          <DWalletLogo size={52} />
          <View>
            <Text style={styles.appName}>D-WALLET</Text>
            <Text style={styles.appTagline}>Secure Digital Finance</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* ── STEP: Phone ── */}
        {step === 'phone' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Enter your mobile number</Text>
            <Text style={[styles.stepSub, { color: theme.textMuted }]}>We'll send a one-time code to verify your SIM</Text>

            <View style={[styles.phoneInputWrap, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              <View style={[styles.flagChip, { backgroundColor: theme.primaryMuted }]}>
                <Text style={{ fontSize: 18 }}>🇵🇭</Text>
                <Text style={[styles.countryCode, { color: theme.primary }]}>+63</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, { color: theme.textPrimary }]}
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                placeholder="09XX XXX XXXX"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={13}
                autoFocus
              />
            </View>

            <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
              Standard SMS rates may apply. Your number is used only for verification.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }, (rawPhone.length !== 11 || loading) && styles.btnDisabled]}
              onPress={handleSendOTP}
              activeOpacity={0.85}
              disabled={rawPhone.length !== 11 || loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <>
                  <Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>Send OTP</Text>
                  <Ionicons name="send" size={16} color={theme.textInverse} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: OTP ── */}
        {step === 'otp' && (
          <View style={styles.stepContainer}>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
              <Text style={[styles.backText, { color: theme.textSecondary }]}>Back</Text>
            </TouchableOpacity>

            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Enter the OTP</Text>
            <Text style={[styles.stepSub, { color: theme.textMuted }]}>
              6-digit code sent to{' '}
              <Text style={{ color: theme.primary, fontWeight: '700' }}>{phone}</Text>
            </Text>

            <OTPInput value={otp} onChange={setOtp} />

            <View style={styles.timerRow}>
              {otpTimer > 0 ? (
                <Text style={[styles.timerText, { color: theme.textMuted }]}>
                  Resend in <Text style={{ color: theme.primary, fontWeight: '700' }}>{otpTimer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleSendOTP}>
                  <Text style={[styles.resendText, { color: theme.primary }]}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }, otp.length !== 6 && styles.btnDisabled]}
              onPress={handleVerifyOTP}
              activeOpacity={0.85}
              disabled={otp.length !== 6}
            >
              <Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>Verify OTP</Text>
              <Ionicons name="checkmark-circle" size={18} color={theme.textInverse} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: Register ── */}
        {step === 'register' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Create your account</Text>
            <Text style={[styles.stepSub, { color: theme.textMuted }]}>Tell us your name to get started</Text>

            <View style={[styles.formCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
              <View style={[styles.formRow, { borderBottomColor: theme.borderSubtle }]}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>First Name</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.textPrimary }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Juan"
                  placeholderTextColor={theme.textMuted}
                  autoFocus
                />
              </View>
              <View style={[styles.formRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>Last Name</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.textPrimary }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Dela Cruz"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }, !firstName.trim() && styles.btnDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={!firstName.trim()}
            >
              <Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.textInverse} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: Set PIN ── */}
        {step === 'set-pin' && (
          <View style={[styles.stepContainer, { alignItems: 'center' }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary, textAlign: 'center' }]}>
              {isConfirming ? 'Confirm your PIN' : 'Set your 4-digit PIN'}
            </Text>
            <Text style={[styles.stepSub, { color: theme.textMuted, textAlign: 'center' }]}>
              {isConfirming ? 'Enter the same PIN again to confirm' : 'This PIN protects your D-Wallet'}
            </Text>

            <PinDots value={isConfirming ? confirmPin.trim() : pin} />

            {pinError ? (
              <View style={[styles.errorRow, { backgroundColor: 'rgba(255,90,90,0.1)', borderColor: 'rgba(255,90,90,0.3)' }]}>
                <Ionicons name="warning-outline" size={14} color="#FF5A5A" />
                <Text style={styles.errorText}>{pinError}</Text>
              </View>
            ) : null}

            <Numpad onPress={handleNumpad} onDelete={handleNumpadDelete} />

            {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />}
          </View>
        )}

        {/* ── STEP: Enter PIN ── */}
        {step === 'enter-pin' && (
          <View style={[styles.stepContainer, { alignItems: 'center' }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary, textAlign: 'center' }]}>Welcome back!</Text>
            <Text style={[styles.stepSub, { color: theme.textMuted, textAlign: 'center' }]}>
              Enter your 4-digit PIN to continue
            </Text>

            <PinDots value={pin} />

            {pinError ? (
              <View style={[styles.errorRow, { backgroundColor: 'rgba(255,90,90,0.1)', borderColor: 'rgba(255,90,90,0.3)' }]}>
                <Ionicons name="warning-outline" size={14} color="#FF5A5A" />
                <Text style={styles.errorText}>{pinError}</Text>
              </View>
            ) : null}

            <Numpad onPress={handleNumpad} onDelete={handleNumpadDelete} />

            <TouchableOpacity
              onPress={() => { setStep('phone'); setPin(''); setPinError(''); }}
              style={styles.forgotBtn}
            >
              <Text style={[styles.forgotText, { color: theme.textMuted }]}>Forgot PIN? Re-verify with OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroBar: { paddingHorizontal: Spacing.xl, paddingTop: 54, paddingBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  appName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
  appTagline: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginTop: 2 },

  stepContainer: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 36 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  backText: { fontSize: 14, fontWeight: '600' },
  stepTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, marginBottom: 8 },
  stepSub: { fontSize: 14, lineHeight: 21, marginBottom: 28 },

  phoneInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.xl, borderWidth: 1,
    overflow: 'hidden', marginBottom: 16,
  },
  flagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 16,
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)',
  },
  countryCode: { fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, fontSize: 17, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 16, letterSpacing: 0.5 },

  disclaimer: { fontSize: 11, lineHeight: 17, marginBottom: 28 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: BorderRadius.xl,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 16, fontWeight: '800' },

  timerRow: { alignItems: 'center', marginBottom: 24 },
  timerText: { fontSize: 13 },
  resendText: { fontSize: 14, fontWeight: '700' },

  formCard: { borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: 28, overflow: 'hidden' },
  formRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  formLabel: { fontSize: 14, fontWeight: '500' },
  formInput: { fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 12 },

  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  errorText: { fontSize: 13, color: '#FF5A5A', fontWeight: '600' },

  forgotBtn: { marginTop: 24, alignItems: 'center' },
  forgotText: { fontSize: 13, textDecorationLine: 'underline' },
});