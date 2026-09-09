import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SignInScreenProps {
  onBack: () => void;
  onLogin: (userData: any) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onPendingStatus?: (userData: any) => void;
}

// ✅ MOCK USERS DATABASE
const MOCK_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
    department: null,
    status: 'approved',
    joinDate: '2024-01-01',
  },
  {
    id: 2,
    name: 'Hassan Raza',
    email: 'teacher@test.com',
    password: '123456',
    role: 'teacher',
    department: 'IT',
    status: 'approved',
    joinDate: '2024-06-01',
  },
  {
    id: 3,
    name: 'Ali Hassan',
    email: 'monitor@test.com',
    password: '123456',
    role: 'monitoring',
    department: null,
    status: 'approved',
    joinDate: '2024-06-01',
  },
  {
    id: 4,
    name: 'Pending Teacher',
    email: 'pending@test.com',
    password: '123456',
    role: 'teacher',
    department: 'Math',
    status: 'pending',
    joinDate: '2024-08-15',
  },
  {
    id: 5,
    name: 'Rejected User',
    email: 'rejected@test.com',
    password: '123456',
    role: 'teacher',
    department: 'Physics',
    status: 'rejected',
    joinDate: '2024-08-10',
  },
];

export default function SignInScreen({ 
  onBack, 
  onLogin,
  onSignUp,
  onForgotPassword,
  onPendingStatus,
}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // ✅ Frontend validations
    if (!email || !password) {
      Alert.alert('⚠️ All Fields Required', 'Please enter email and password');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('⚠️ Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('⚠️ Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // TODO: Backend API call karna hai
    // API: POST /api/auth/login
    // Body: { email, password }
    
    // Mock delay (simulate API call)
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // ✅ Mock authentication
      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        setLoading(false);
        Alert.alert('❌ Login Failed', 'Invalid email or password');
        return;
      }

      // ✅ Status check
      if (user.status === 'pending') {
        setLoading(false);
        Alert.alert(
          '⏳ Account Pending',
          'Your account is pending admin approval. Please wait.',
          [
            {
              text: 'Check Status',
              onPress: () => {
                if (onPendingStatus) {
                  onPendingStatus(user);
                }
              }
            },
            { text: 'OK' }
          ]
        );
        return;
      }

      if (user.status === 'rejected') {
        setLoading(false);
        Alert.alert(
          '❌ Account Rejected',
          'Your account request has been rejected by admin. Please contact support.',
        );
        return;
      }

      // ✅ Approved user - login successful
      setLoading(false);
      
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        joinDate: user.joinDate,
        token: 'mock_jwt_token_' + Date.now(),
      });

    } catch (error: any) {
      setLoading(false);
      Alert.alert('❌ Login Failed', error?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#1A237E" />
        </View>

        <Text style={styles.title}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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

        <Text style={styles.label}>Password *</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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
          style={styles.signInButton} 
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
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

        {/* ✅ Demo Login Info */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>📌 Demo Credentials:</Text>
          <Text style={styles.demoText}>👑 Admin: admin@test.com</Text>
          <Text style={styles.demoText}>👨‍🏫 Teacher: teacher@test.com</Text>
          <Text style={styles.demoText}>👁️ Monitor: monitor@test.com</Text>
          <Text style={styles.demoText}>⏳ Pending: pending@test.com</Text>
          <Text style={styles.demoText}>🔑 Password: 123456 (all users)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

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
  formContainer: { padding: 20, paddingTop: 30, alignItems: 'center' },
  logoContainer: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 10, alignSelf: 'flex-start', marginLeft: 5 },
  inputContainer: {
    backgroundColor: '#FFFFFF',
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
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  eyeIcon: { padding: 5 },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 20, width: '100%', marginTop: 5 },
  forgotText: { fontSize: 14, color: '#1A237E', fontWeight: '500' },
  signInButton: {
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
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { paddingHorizontal: 15, color: '#666', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  demoBox: {
    backgroundColor: '#E8EAF6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  demoTitle: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  demoText: { fontSize: 13, color: '#333', marginBottom: 4, fontWeight: '500' },
});