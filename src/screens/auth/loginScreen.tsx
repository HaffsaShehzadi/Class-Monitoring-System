import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../services/tokenStorage';
import { setAuthToken } from '../../services/syncService';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: (userData: any) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onPendingStatus?: (userData: any) => void;
}

export default function LoginScreen({ 
  onBack, 
  onLogin,
  onSignUp,
  onForgotPassword,
  onPendingStatus,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('All Fields Required', 'Please enter email and password');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(cleanEmail, cleanPassword);

      if (response.status === 'pending') {
        setLoading(false);
        if (onPendingStatus) {
          onPendingStatus({
            email: response.user?.email || cleanEmail,
            role: response.user?.role || 'User',
            name: response.user?.name || cleanEmail.split('@')[0],
            password: cleanPassword,
            status: 'pending',
          });
        }
        return;
      }

      if (response.status === 'rejected') {
        setLoading(false);
        if (onPendingStatus) {
          onPendingStatus({
            email: response.user?.email || cleanEmail,
            role: response.user?.role || 'User',
            name: response.user?.name || cleanEmail.split('@')[0],
            password: cleanPassword,
            status: 'rejected',
          });
        }
        return;
      }

      if (response.status === 'approved' && response.token && response.user) {
        await tokenStorage.saveToken(response.token);
        await tokenStorage.saveUser(response.user);
        setAuthToken(response.token);
        
        setLoading(false);
        
        onLogin({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          department: response.user.department,
          token: response.token,
        });
      }

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Failed', error?.message || 'Invalid email or password');
    }
  };

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
                <Text style={styles.heroFeatureText}>GPS based Attendance System</Text>
              </View>
              <View style={styles.heroFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.heroFeatureText}>Timetable Validation</Text>
              </View>
              <View style={styles.heroFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.heroFeatureText}>PDF Report Generation</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column - Clean Sign In Form */}
        <View style={styles.webFormPanel}>
          <ScrollView 
            style={styles.webFormScrollView} 
            contentContainerStyle={styles.webFormContent} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.webFormInner}>
              <Text style={styles.webTitle}>Welcome</Text>
              <Text style={styles.webSubtitle}>Login to Class Monitoring System</Text>

              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onForgotPassword} style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>SIGN IN</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onSignUp}>
                  <Text style={styles.linkText}>Sign Up Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ KEYBOARD AVOIDING VIEW ADDED */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.mobileLogoWrapper}>
              <MaterialCommunityIcons name="school" size={76} color="#1A237E" />
              <View style={styles.mobileBadge}>
                <MaterialCommunityIcons name="clipboard-check" size={24} color="#4CAF50" />
              </View>
            </View>
          </View>

          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Login to Class Monitoring System</Text>

          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
              <MaterialCommunityIcons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onForgotPassword} style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.linkText}>Sign up here</Text>
            </TouchableOpacity>
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

  // Mobile & Common Styles
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
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  formContainer: { padding: 20, paddingTop: 30, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  logoContainer: { marginBottom: 20 },
  mobileLogoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBadge: {
    position: 'absolute',
    bottom: -4,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12, alignSelf: 'flex-start' },
  inputContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 6,
    width: '100%',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  eyeIcon: { padding: 4 },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 8 },
  forgotText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  loginButton: {
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
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { paddingHorizontal: 15, color: '#666', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 25 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '700' },
});