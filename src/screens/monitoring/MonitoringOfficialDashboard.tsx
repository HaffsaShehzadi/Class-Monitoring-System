import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { tokenStorage } from '../../services/tokenStorage';

export default function MonitoringOfficialDashboard({ onNavigate, onLogout, onToggleSidebar, sidebarOpen }: any) {
  const [monitorName, setMonitorName] = useState('Monitoring Official');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await tokenStorage.getUser();
        if (user && user.name) {
          setMonitorName(user.name);
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

  const menuItems = [
    { id: 'viewAssignDuty', title: 'View Assign Duty' },
    { id: 'markAttendance', title: 'Mark Attendance' },
    { id: 'monitoringAttendanceHistory', title: 'Attendance History' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {Platform.OS === 'web' && onToggleSidebar && !sidebarOpen && (
            <TouchableOpacity 
              onPress={onToggleSidebar} 
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="menu" size={28} color="#FFF" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Monitoring Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {monitorName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.menuCard} onPress={() => onNavigate(item.id)}>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#1A237E', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  hamburgerBtn: {
    marginRight: 14,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: '#B3B8FF', marginTop: 4 },
  logoutBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#1A237E', fontWeight: '700', fontSize: 14 },
  content: { padding: 15, paddingBottom: 30 },
  menuCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  arrow: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
});