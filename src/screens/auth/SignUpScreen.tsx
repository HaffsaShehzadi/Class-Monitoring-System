import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

interface SignUpScreenProps {
  onBack: () => void;
  onSignUp: (userData: any) => void;
}

const ROLES = ['Teacher', 'Monitoring Official'];

export default function SignUpScreen({ onBack, onSignUp }: SignUpScreenProps) {
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const list = await authService.getDepartments();
        if (list && list.length > 0) {
          setDepartments(list);
        }
      } catch (err) {
        console.warn('Could not fetch departments from backend, using default fallback', err);
        setDepartments(['BSCS', 'Chemistry', 'Economics', 'English', 'Islamiat', 'IT', 'Math', 'Physics', 'Political Science', 'Urdu', 'Zoology']);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  
  // ✅ CHANGED: 6 digits se 4 digits kar diye
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // ✅ CHANGED: 4 refs for 4 inputs
  const otpRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

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
      await authService.signup({
        name: fullName,
        email,
        password,
        role: roleBackend as 'teacher' | 'monitoring',
        department: role === 'Teacher' ? department : undefined,
      });
      
      // ✅ OTP screen pe jao (demo_otp logic hata di)
      setStep('otp');
      
      Alert.alert(
        '✅ Account Created - Verify Email',
        `Account created successfully!\n\nA 4-digit OTP has been sent to:\n${email}`
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
      await authService.resendOTP(email);
      setOtpLoading(false);
      
      Alert.alert(
        '✅ OTP Resent', 
        `New 4-digit OTP sent to ${email}`
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

    // ✅ CHANGED: index < 3 (kyunke ab 4 boxes hain, max index 3 hai)
    if (value && index < 3) {
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
    
    // ✅ CHANGED: 6 ki jagah 4 check karein
    if (enteredOtp.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit verification code');
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
      setOtp(['', '', '', '']); // ✅ 4 empty strings
      otpRefs[0].current?.focus();
    }
  };

  // ✅ WEB SMART DESK 2-COLUMN SPLIT LAYOUT
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        {/* Left Column - Class Monitoring System Navy Blue Hero Panel */}
        <View style={styles.webHeroPanel}>
          <View style={styles.heroContent}>
            {/* App's Official Logo with Green Badge */}
            <View style={styles.heroLogoWrapper}>
              <MaterialCommunityIcons name="school" size={88} color="#FFFFFF" />
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="clipboard-check" size={26} color="#4CAF50" />
              </View>
            </View>

            <Text style={styles.heroTitle}>Class Monitoring System</Text>
            <Text style={styles.heroSubtitle}>Teachers Attendance Management</Text>
            
            {/* 3 Features in the Middle */}
            <View style={styles.heroFeatures}>
              <View style={styles.heroFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.heroFeatureText}>GPS based attendance system</Text>
              </View>
              <View style={styles.heroFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.heroFeatureText}>Timetable validation</Text>
              </View>
              <View style={styles.heroFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.heroFeatureText}>PDF report generation</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column - Clean Form / OTP / Success Panel */}
        <View style={styles.webFormPanel}>
          <ScrollView 
            style={styles.webFormScrollView} 
            contentContainerStyle={styles.webFormContent} 
            showsVerticalScrollIndicator={false}
          >
            {step === 'otp' ? (
              <View style={styles.webFormInner}>
                <TouchableOpacity onPress={() => setStep('form')} style={styles.webBackButton}>
                  <Text style={styles.webBackArrow}>← Back to Form</Text>
                </TouchableOpacity>

                <Text style={styles.webTitle}>Verify Email</Text>
                <Text style={styles.webSubtitle}>
                  We've sent a 4-digit code to <Text style={{ fontWeight: '700', color: '#1A237E' }}>{email}</Text>
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
                  style={[styles.webSubmitButton, otpLoading && styles.signUpButtonDisabled]}
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Verify & Create Account</Text>
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
              </View>
            ) : step === 'success' ? (
              <View style={styles.webFormInner}>
                <View style={[styles.successIconBox, { alignSelf: 'center' }]}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Verified Successfully!</Text>
                <Text style={[styles.successSubtitle, { textAlign: 'center' }]}>
                  Your account has been created.{'\n'}Redirecting to request status...
                </Text>
              </View>
            ) : (
              <View style={styles.webFormInner}>
                <Text style={styles.webTitle}>Create Account</Text>
                <Text style={styles.webSubtitle}>Join Class Monitoring System</Text>

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
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    placeholder="Enter your full name" 
                    placeholderTextColor="#999"
                    value={fullName} 
                    onChangeText={setFullName} 
                  />
                </View>

                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    placeholder="Enter your email" 
                    placeholderTextColor="#999"
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    value={email} 
                    onChangeText={setEmail} 
                  />
                </View>

                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    placeholder="At least 6 characters" 
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword} 
                    value={password} 
                    onChangeText={setPassword} 
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

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
                        {loadingDepartments ? (
                          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="#1A237E" />
                            <Text style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Loading departments...</Text>
                          </View>
                        ) : (
                          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                            {departments.map(d => (
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
                        )}
                      </View>
                    )}
                  </>
                )}

                <TouchableOpacity 
                  style={[styles.webSubmitButton, loading && styles.signUpButtonDisabled]} 
                  onPress={handleSignUp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.signUpButtonText}>SIGN UP</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={onBack}>
                    <Text style={styles.linkText}>Sign In Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  // ✅ MOBILE LAYOUT
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
            {/* ✅ FIXED: Password field with eye toggle icon */}
            <View style={styles.passwordInputContainer}>
              <TextInput 
                style={styles.passwordInput} 
                placeholder="At least 6 characters" 
                placeholderTextColor="#999"
                secureTextEntry={!showPassword} 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

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
                    {loadingDepartments ? (
                      <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="small" color="#1A237E" />
                        <Text style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Loading departments...</Text>
                      </View>
                    ) : (
                      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                        {departments.map(d => (
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
                    )}
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
  // Web 2-Column Split Styles (Smart Desk Style)
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
  },
  webHeroPanel: {
    flex: 1,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  heroContent: {
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heroLogoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  heroBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#C5CAE9',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  heroFeatures: {
    width: 'auto',
    gap: 18,
    alignSelf: 'center',
  },
  heroFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroFeatureText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Web Form Panel
  webFormPanel: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  webFormScrollView: {
    width: '100%',
    flex: 1,
  },
  webFormContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  webFormInner: {
    width: '90%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  webTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  webBackButton: {
    marginBottom: 16,
  },
  webBackArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A237E',
  },
  webSubmitButton: {
    backgroundColor: '#1A237E',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },

  // Form Fields & Icons
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 10,
    width: '100%',
  },
  inputIcon: { marginRight: 14 },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  passwordInputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 10,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeIcon: { padding: 8 },

  // Mobile & Common Styles
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'web' ? 16 : 50,
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
  formContainer: { 
    padding: Platform.OS === 'web' ? 30 : 20, 
    paddingTop: 30, 
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1A237E', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  dropdownText: { fontSize: 16, color: '#1E293B', flex: 1 },
  dropdownArrow: { fontSize: 14, color: '#64748B' },
  placeholderText: { color: '#94A3B8' },
  
  inlineDropdownList: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    marginTop: -2,
    marginBottom: 12,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
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
    marginTop: 24,
    elevation: 3,
  },
  signUpButtonDisabled: { backgroundColor: '#9E9E9E' },
  signUpButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '700' },

  // OTP Styles
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

  // Success Styles
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