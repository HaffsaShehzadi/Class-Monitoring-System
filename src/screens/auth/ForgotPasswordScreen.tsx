import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ onBack, onSent }: { onBack: () => void, onSent: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
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
    
    // Demo: 2 sec ka fake loading (API call simulation)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Reset Link Sent!', 
        `A password reset link has been sent to:\n\n${email}\n\nPlease check your inbox (and spam folder).`,
        [{ text: 'OK', onPress: onSent }]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="lock-reset" size={70} color="#1A237E" />
        </View>

        <Text style={styles.title}>Reset Password 🔐</Text>
        <Text style={styles.subtitle}>Enter your registered email to receive a reset link</Text>

        {/* Email Input */}
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

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#1A237E" />
          <Text style={styles.infoText}>
            We'll send you a link to reset your password. If you don't receive it, check your spam folder.
          </Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity 
          style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        {/* Back to Sign In */}
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <MaterialCommunityIcons name="arrow-left" size={16} color="#1A237E" />
          <Text style={styles.backLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
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
  iconContainer: { marginBottom: 20 },
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
  infoBox: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 20,
    width: '100%',
  },
  infoText: { flex: 1, fontSize: 13, color: '#1A237E', lineHeight: 18 },
  resetButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    elevation: 3,
  },
  resetButtonDisabled: { backgroundColor: '#66739E' },
  resetButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 25,
    marginBottom: 30,
  },
  backLinkText: { fontSize: 14, color: '#1A237E', fontWeight: '500' },
});