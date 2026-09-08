import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

interface SignUpScreenProps {
  onBack: () => void;
  onSignUp: (userData: any) => void;
}

const ROLES = ['Teacher', 'Monitoring Official'];
const DEPARTMENTS = ['Math', 'Urdu', 'English', 'Islamiat', 'IT', 'Zoology', 'Economics', 'Political Science', 'Physics', 'Chemistry', 'BSCS'];

export default function SignUpScreen({ onBack, onSignUp }: SignUpScreenProps) {
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  const validateForm = () => {
    if (!fullName || !email || !password || !role) {
      Alert.alert('All Fields Required', 'Please fill in all required fields');
      return false;
    }
    if (role === 'Teacher' && !department) {
      Alert.alert('Department Required', 'Please select your department');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const roleBackend = role.toLowerCase().includes('monitor') ? 'monitoring' : 'teacher';
      
      // ✅ REAL backend signup call
      const response = await authService.signup({
        name: fullName,
        email,
        password,
        role: roleBackend as 'teacher' | 'monitoring',
        department: role === 'Teacher' ? department : undefined,
      });
      
      // ✅ OTP save karo (Internal logic ke liye)
      setGeneratedOtp(response.demo_otp || '');
      
      // ✅ OTP screen pe jao
      setStep('otp');
      
      // ✅ CORRECTION: Demo OTP text hata diya gaya hai professional look ke liye
      Alert.alert(
        '✅ Account Created - Verify Email',
        `Account created successfully!\n\nA 6-digit OTP has been sent to:\n${email}`
      );
      
      setResendTimer(30);
      startResendTimer();

    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ Signup Failed', error?.message || 'Something went wrong');
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    try {
      setOtpLoading(true);
      const response = await authService.resendOTP(email);
      setOtpLoading(false);
      setGeneratedOtp(response.demo_otp || '');
      
      // ✅ CORRECTION: Demo OTP text hata diya gaya hai
      Alert.alert(
        '✅ OTP Resent', 
        `New OTP sent to ${email}`
      );
      
      startResendTimer();
    } catch (error: any) {
      setOtpLoading(false);
      Alert.alert('❌ Error', error?.message || 'Failed to resend OTP');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);

    try {
      // ✅ REAL backend OTP verification
      await authService.verifyOTP(email, enteredOtp);
      setOtpLoading(false);
      
      const userData = {
        id: Date.now(),
        fullName,
        email,
        password,
        role: role.toLowerCase().includes('monitor') ? 'monitoring' : 'teacher',
        department: role === 'Teacher' ? department : null,
        status: 'pending',
        joinDate: new Date().toISOString(),
      };
      
      setStep('success');
      
      setTimeout(() => {
        onSignUp(userData);
      }, 2000);
      
    } catch (error: any) {
      setOtpLoading(false);
      Alert.alert('❌ Verification Failed', error?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  if (step === 'otp') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.otpContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.otpIconBox}>
              <Text style={styles.otpIconText}>✉</Text>
            </View>

            <Text style={styles.otpTitle}>Enter Verification Code</Text>
            <Text style={styles.otpSubtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.otpEmail}>{email}</Text>
            </Text>

            <View style={styles.otpInputRow}>
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

            <TouchableOpacity 
              onPress={handleVerifyOtp} 
              style={[styles.verifyBtn, otpLoading && styles.verifyBtnDisabled]}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={otpLoading}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Verified Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Your account has been created.{'\n'}Redirecting to request status...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign Up</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Class Monitoring System</Text>

            <Text style={styles.label}>Select Role *</Text>
            <TouchableOpacity 
              style={styles.dropdown} 
              onPress={() => { setShowRoleDropdown(!showRoleDropdown); setShowDeptDropdown(false); }}
            >
              <Text style={[styles.dropdownText, !role && styles.placeholderText]}>
                {role || 'Select your role'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showRoleDropdown && (
              <View style={styles.inlineDropdownList}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.inlineDropdownItem, role === r && styles.inlineDropdownItemActive]}
                    onPress={() => { 
                      setRole(r); 
                      setShowRoleDropdown(false); 
                      if (r !== 'Teacher') setDepartment(''); 
                    }}
                  >
                    <Text style={[styles.inlineDropdownItemText, role === r && styles.inlineDropdownItemTextActive]}>
                      {r}
                    </Text>
                    {role === r && <Text style={styles.inlineDropdownCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Full Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your full name" 
              placeholderTextColor="#999"
              value={fullName} 
              onChangeText={setFullName} 
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor="#999"
              keyboardType="email-address" 
              autoCapitalize="none" 
              value={email} 
              onChangeText={setEmail} 
            />

            <Text style={styles.label}>Password *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="At least 6 characters" 
              placeholderTextColor="#999"
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            {role === 'Teacher' && (
              <>
                <Text style={styles.label}>Department *</Text>
                <TouchableOpacity 
                  style={styles.dropdown} 
                  onPress={() => { setShowDeptDropdown(!showDeptDropdown); setShowRoleDropdown(false); }}
                >
                  <Text style={[styles.dropdownText, !department && styles.placeholderText]}>
                    {department || 'Select department'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {showDeptDropdown && (
                  <View style={[styles.inlineDropdownList, styles.inlineDropdownListScroll]}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                      {DEPARTMENTS.map(d => (
                        <TouchableOpacity
                          key={d}
                          style={[styles.inlineDropdownItem, department === d && styles.inlineDropdownItemActive]}
                          onPress={() => { setDepartment(d); setShowDeptDropdown(false); }}
                        >
                          <Text style={[styles.inlineDropdownItemText, department === d && styles.inlineDropdownItemTextActive]}>
                            {d}
                          </Text>
                          {department === d && <Text style={styles.inlineDropdownCheck}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity 
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={onBack}>
                <Text style={styles.linkText}> Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  backButton: { padding: 5 },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  formContainer: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A237E', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 16, color: '#333', flex: 1 },
  dropdownArrow: { fontSize: 14, color: '#666' },
  placeholderText: { color: '#999' },
  
  inlineDropdownList: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginTop: 5,
    paddingVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inlineDropdownListScroll: { maxHeight: 200 },
  inlineDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    marginBottom: 2,
  },
  inlineDropdownItemActive: { backgroundColor: '#1A237E' },
  inlineDropdownItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  inlineDropdownItemTextActive: { color: '#FFF' },
  inlineDropdownCheck: { fontSize: 16, color: '#FFF', fontWeight: '700' },
  
  signUpButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  signUpButtonDisabled: { backgroundColor: '#9E9E9E' },
  signUpButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },

  otpContainer: { flexGrow: 1, padding: 20, alignItems: 'center', paddingTop: 40 },
  otpIconBox: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 25,
  },
  otpIconText: { fontSize: 50, color: '#1A237E' },
  otpTitle: { fontSize: 22, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 10 },
  otpSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  otpEmail: { fontWeight: '700', color: '#1A237E' },
  otpInputRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  otpInput: {
    width: 50, height: 60, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#DDD',
    borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#1A237E',
  },
  otpInputFilled: { borderColor: '#1A237E' },
  verifyBtn: {
    backgroundColor: '#1A237E', paddingVertical: 16, paddingHorizontal: 60,
    borderRadius: 12, elevation: 3, marginBottom: 20, minWidth: 200,
    alignItems: 'center',
  },
  verifyBtnDisabled: { backgroundColor: '#9E9E9E' },
  verifyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resendText: { fontSize: 14, color: '#666' },
  resendLink: { fontSize: 14, color: '#1A237E', fontWeight: '700' },
  resendTimer: { fontSize: 14, color: '#999', fontWeight: '600' },

  successContainer: {
    flex: 1, backgroundColor: '#F5F5F5', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  },
  successIconBox: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 25,
  },
  successIconText: { fontSize: 70, color: '#4CAF50', fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1A237E', marginBottom: 10, textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});