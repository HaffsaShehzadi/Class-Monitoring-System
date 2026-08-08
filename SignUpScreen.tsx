import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, // ✅ Keyboard fix ke liye import kiya
  Platform              // ✅ Platform check ke liye import kiya
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignUpScreen({ onBack, onSignUp }: { onBack: () => void, onSignUp: () => void }) {
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  // ✅ Admin hata diya gaya hai, sirf Teacher aur Monitoring Official signup kar sakte hain
  const roles = ['Monitoring Official', 'Teacher'];
  const departments = ['Math', 'Urdu', 'English', 'Islamiat', 'IT', 'Zoology', 'Economics', 'Political Science'];

  const handleSignUp = () => {
    if (!fullName || !email || !password || !role) {
      Alert.alert('⚠️ All Fields Required', 'Please fill in all required fields');
      return;
    }
    
    if (role === 'Teacher' && !department) {
      Alert.alert('⚠️ Department Required', 'Please select your department/subject');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('⚠️ Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('⚠️ Weak Password', 'Password must be at least 6 characters');
      return;
    }

    const deptMsg = role === 'Teacher' ? `\nDept: ${department}` : '';
    Alert.alert(
      '✅ Request Sent!', 
      `Role: ${role}${deptMsg}\n\nYour account creation request is pending admin approval.`,
      [{ text: 'OK', onPress: onSignUp }]
    );
  };

  const cycleRole = () => {
    const currentIndex = roles.indexOf(role);
    const nextIndex = (currentIndex + 1) % roles.length;
    setRole(roles[nextIndex]);
    if (roles[nextIndex] !== 'Teacher') setDepartment('');
  };

  const cycleDepartment = () => {
    const currentIndex = departments.indexOf(department);
    const nextIndex = (currentIndex + 1) % departments.length;
    setDepartment(departments[nextIndex]);
  };

  return (
    // ✅ KeyboardAvoidingView wrap kiya gaya hai taake keyboard khulne par screen upar push ho
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }} // ✅ Scroll ko properly kaam karne ke liye
        keyboardShouldPersistTaps="handled"     // ✅ Keyboard khula hone par bhi buttons click ho saken
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

          <Text style={styles.label}>Select Role *</Text>
          <TouchableOpacity style={styles.dropdown} onPress={cycleRole}>
            <Text style={[styles.dropdownText, !role && styles.placeholderText]}>{role || 'Select Role'}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>
          {role ? <Text style={styles.selectedText}>Selected: {role}</Text> : null}

          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Enter Email *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="your.email@example.com" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={setEmail} 
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter password (min 6 characters)" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />

          {/* ✅ CONDITIONAL: Department sirf Teacher ke liye dikhega */}
          {role === 'Teacher' && (
            <>
              <Text style={styles.label}>Department/Subject *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={cycleDepartment}>
                <Text style={[styles.dropdownText, !department && styles.placeholderText]}>{department || 'Select Department'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
              {department ? <Text style={styles.selectedText}>Selected: {department}</Text> : null}
            </>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onBack}><Text style={styles.linkText}>Sign in here</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: { padding: 20, paddingTop: 30, paddingBottom: 40 }, // ✅ Bottom padding thora barha diya
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
  selectedText: { fontSize: 13, color: '#4CAF50', marginTop: 5, fontWeight: '500', marginLeft: 5 },
  signUpButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  signUpButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 30 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
});