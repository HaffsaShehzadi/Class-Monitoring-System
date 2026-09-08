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
    if (!email || !password) {
      Alert.alert('All Fields Required', 'Please enter email and password');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.status === 'pending') {
        setLoading(false);
        Alert.alert(
          'Account Pending',
          'Your account is pending admin approval. Please wait.',
          [
            {
              text: 'Check Status',
              onPress: () => {
                if (onPendingStatus) {
                  onPendingStatus({
                    email: email,
                    role: 'user',
                    name: email.split('@')[0],
                  });
                }
              }
            },
            { text: 'OK' }
          ]
        );
        return;
      }

      if (response.status === 'rejected') {
        setLoading(false);
        Alert.alert(
          'Account Rejected',
          response.message || 'Your account request has been rejected by admin.'
        );
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
            <MaterialCommunityIcons name="account-circle" size={80} color="#1A237E" />
          </View>

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Class Monitoring System</Text>

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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
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
  title: { fontSize: 26, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 10, alignSelf: 'flex-start', marginLeft: 5 },
  inputContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 5,
    width: '100%',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 20, width: '100%', marginTop: 5 },
  forgotText: { fontSize: 14, color: '#1A237E', fontWeight: '500' },
  loginButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 56,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { paddingHorizontal: 15, color: '#666', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
});