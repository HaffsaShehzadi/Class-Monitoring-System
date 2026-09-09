import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SignUpScreenProps {
  onBack: () => void;
  onSignUp: (userData: any) => void;
}

const ROLES = ['Teacher', 'Monitoring Official'];
const DEPARTMENTS = ['Math', 'Urdu', 'English', 'Islamiat', 'IT', 'Zoology', 'Economics', 'Political Science'];

export default function SignUpScreen({ onBack, onSignUp }: SignUpScreenProps) {
  // Form states
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // OTP Verification states
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  // ===== VALIDATIONS =====
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

  // ===== SIGNUP HANDLER =====
  const handleSignUp = () => {
    if (!validateForm()) return;

    setLoading(true);

    // TODO: Backend API call
    // API: POST /api/auth/signup
    // Body: { fullName, email, password, role, department }
    // Backend se OTP generate hoga aur email pe bheja jayega

    // Mock: 4-digit OTP generate karo
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to:\n${email}\n\nDemo Code: ${mockOtp}\n(In real app, ye email se aayega)`
      );
      setResendTimer(30);
      startResendTimer();
    }, 1000);
  };

  // ===== RESEND TIMER =====
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

  // ===== RESEND OTP =====
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);
    Alert.alert('Code Resent', `New Demo Code: ${mockOtp}`);
    startResendTimer();
  };

  // ===== OTP INPUT HANDLER =====
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

  // ===== VERIFY OTP =====
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit verification code');
      return;
    }

    setOtpLoading(true);

    // TODO: Backend API call
    // API: POST /api/auth/verify-otp
    // Body: { email, otp }

    setTimeout(() => {
      setOtpLoading(false);

      if (enteredOtp === generatedOtp) {
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
      } else {
        Alert.alert('Verification Failed', 'Invalid code. Please try again.');
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    }, 1000);
  };

  // ===== RENDER: OTP SCREEN =====
  if (step === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.otpContainer}>
          <View style={styles.otpIconBox}>
            <MaterialCommunityIcons name="email-check" size={60} color="#1A237E" />
          </View>

          <Text style={styles.otpTitle}>Enter Verification Code</Text>
          <Text style={styles.otpSubtitle}>
            We've sent a 4-digit code to{'\n'}
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
            <Text style={styles.verifyBtnText}>
              {otpLoading ? 'Verifying...' : 'Verify & Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER: SUCCESS SCREEN =====
  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.successTitle}>Verified Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Your account has been created.{'\n'}Redirecting to request status...
        </Text>
      </View>
    );
  }

  // ===== RENDER: FORM SCREEN =====
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Class Monitoring System</Text>

          {/* Role Dropdown */}
          <Text style={styles.label}>Select Role *</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowRoleModal(true)}>
            <Text style={[styles.dropdownText, !role && styles.placeholderText]}>
              {role || 'Select your role'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your full name" 
            value={fullName} 
            onChangeText={setFullName} 
          />

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="your.email@example.com" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={setEmail} 
          />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="At least 6 characters" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />

          {/* Department (Teacher only) */}
          {role === 'Teacher' && (
            <>
              <Text style={styles.label}>Department *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowDeptModal(true)}>
                <Text style={[styles.dropdownText, !department && styles.placeholderText]}>
                  {department || 'Select department'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Sending Code...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.linkText}>Sign in here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal visible={showRoleModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowRoleModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.modalItem, role === r && styles.modalItemActive]}
                onPress={() => { setRole(r); setShowRoleModal(false); if (r !== 'Teacher') setDepartment(''); }}
              >
                <Text style={[styles.modalItemText, role === r && styles.modalItemTextActive]}>
                  {r}
                </Text>
                {role === r && (
                  <MaterialCommunityIcons name="check" size={22} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Department Selection Modal */}
      <Modal visible={showDeptModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDeptModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setShowDeptModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {DEPARTMENTS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.modalItem, department === d && styles.modalItemActive]}
                  onPress={() => { setDepartment(d); setShowDeptModal(false); }}
                >
                  <Text style={[styles.modalItemText, department === d && styles.modalItemTextActive]}>
                    {d}
                  </Text>
                  {department === d && (
                    <MaterialCommunityIcons name="check" size={22} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// SafeAreaView shim for OTP screen
const SafeAreaView = ({ children, style }: any) => <View style={[{ flex: 1 }, style]}>{children}</View>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
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
  formContainer: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A237E', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 16, color: '#333', flex: 1 },
  placeholderText: { color: '#999' },
  signUpButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  signUpButtonDisabled: { backgroundColor: '#9E9E9E' },
  signUpButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  modalScroll: { maxHeight: 350 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 8,
  },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },

  // OTP Screen
  otpContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  otpIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 10,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  otpEmail: { fontWeight: '700', color: '#1A237E' },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: 60,
    height: 65,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A237E',
  },
  otpInputFilled: { borderColor: '#1A237E' },
  verifyBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  verifyBtnDisabled: { backgroundColor: '#9E9E9E' },
  verifyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: { fontSize: 14, color: '#666' },
  resendLink: { fontSize: 14, color: '#1A237E', fontWeight: '700' },
  resendTimer: { fontSize: 14, color: '#999', fontWeight: '600' },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIconBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});