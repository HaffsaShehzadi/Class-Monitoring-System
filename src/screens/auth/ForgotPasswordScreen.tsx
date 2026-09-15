import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen({ onBack, onSent }: { onBack: () => void, onSent: () => void }) {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const otpRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('⚠️ Email Required', 'Please enter your registered email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('⚠️ Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setLoading(false);
      setStep('otp');
      Alert.alert('✅ OTP Sent!', `A 4-digit OTP has been sent to:\n\n${email}`);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ Error', error?.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Step 2: Verify OTP (Move to next step)
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      Alert.alert('⚠️ Invalid Code', 'Please enter the 4-digit OTP');
      return;
    }
    setStep('password');
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('⚠️ Fields Required', 'Please enter and confirm your new password');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('⚠️ Weak Password', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('⚠️ Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const enteredOtp = otp.join('');
      await authService.resetPassword(email, enteredOtp, newPassword);
      
      setLoading(false);
      Alert.alert(
        '✅ Success!', 
        'Your password has been reset successfully.',
        [{ text: 'OK', onPress: onSent }] // onSent will navigate to Login
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ Error', error?.message || 'Failed to reset password');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <>
              <Text style={styles.title}>Reset Password </Text>
              <Text style={styles.subtitle}>Enter your registered email to receive a 4-digit OTP</Text>

              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.actionButtonDisabled]} 
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>We've sent a 4-digit code to {email}</Text>

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={otpRefs[index]}
                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOtp}>
                <Text style={styles.actionButtonText}>Verify OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('email')} style={styles.backLink}>
                <Text style={styles.backLinkText}>Change Email Address</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'password' && (
            <>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>Enter your new password below</Text>

              <Text style={styles.label}>New Password *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.actionButtonDisabled]} 
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('otp')} style={styles.backLink}>
                <Text style={styles.backLinkText}>Back to OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  formContainer: { padding: 20, paddingTop: 30, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 10, alignSelf: 'flex-start', marginLeft: 5 },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 5,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  actionButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    elevation: 3,
  },
  actionButtonDisabled: { backgroundColor: '#66739E' },
  actionButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  backLink: { marginTop: 25, marginBottom: 30 },
  backLinkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  
  // OTP Styles
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30, marginTop: 10 },
  otpInput: {
    width: 60, height: 60, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#DDD',
    borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: '700', color: '#1A237E',
  },
  otpInputFilled: { borderColor: '#1A237E' },
});