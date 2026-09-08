import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

interface RequestStatusScreenProps {
  onBack: () => void;
  onApproved: () => void;
  userEmail: string;
  userRole: string;
  checkStatus: () => { status: 'pending' | 'approved' | 'rejected' };
  userPassword?: string;
}

export default function RequestStatusScreen({ 
  onBack, onApproved, userEmail, userRole, checkStatus, userPassword
}: RequestStatusScreenProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const result = checkStatus();
    setStatus(result.status);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // ✅ Try to login to check real status
      if (userPassword) {
        const response = await authService.login(userEmail, userPassword);
        setStatus(response.status);
        
        if (response.status === 'approved') {
          Alert.alert('✅ Approved!', 'Your account has been approved. Welcome!');
          setRefreshing(false);
          setTimeout(() => onApproved(), 1000);
          return;
        }
      }
      
      // Fallback to local check
      const result = checkStatus();
      setStatus(result.status);
    } catch (error: any) {
      // Error means still pending or rejected
      const result = checkStatus();
      setStatus(result.status);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {status === 'pending' && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={styles.statusTitle}>Request Pending</Text>
            <Text style={styles.statusText}>
              Your {userRole} account request has been submitted successfully.
            </Text>
            <Text style={styles.waitText}>
              Please wait for Admin approval.
            </Text>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{userEmail}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]} 
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
              <Text style={styles.refreshText}>
                {refreshing ? 'Checking...' : 'Check Status'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'approved' && (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#1A237E" />
            <Text style={styles.successTitle}>Request Approved!</Text>
            <Text style={styles.successText}>
              Congratulations! Your {userRole} account has been approved by Admin.
            </Text>
            <TouchableOpacity style={styles.welcomeBtn} onPress={onApproved}>
              <Text style={styles.welcomeText}>Welcome to Class Monitoring System</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'rejected' && (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="close-circle" size={80} color="#1A237E" />
            <Text style={styles.errorTitle}>Request Rejected</Text>
            <Text style={styles.errorText}>
              Sorry, your {userRole} account request has been rejected by Admin.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
              <Text style={styles.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
  },
  statusTitle: { fontSize: 24, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginTop: 20, marginBottom: 15 },
  statusText: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 10 },
  waitText: { fontSize: 14, color: '#666', textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  infoText: { fontSize: 14, color: '#333', marginLeft: 10 },
  refreshBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  refreshBtnDisabled: { backgroundColor: '#9E9E9E' },
  refreshText: { color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginTop: 20, marginBottom: 15 },
  successText: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 25 },
  welcomeBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errorTitle: { fontSize: 24, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginTop: 20, marginBottom: 15 },
  errorText: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 25 },
  backBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backText: { color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
});