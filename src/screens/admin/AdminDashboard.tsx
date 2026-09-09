import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ LOCAL admin info (App.tsx se nahi)
const ADMIN_INFO = { name: 'Admin' };

export default function AdminDashboard({ onNavigate, onLogout }: any) {
  const menuItems = [
    { id: 'pending', title: 'Pending Approvals', description: 'Approve or reject user requests' },
    { id: 'users', title: 'User Profiles', description: 'View all registered users' },
    { id: 'assignDuty', title: 'Assign Duty', description: 'Assign duty to monitoring officials' },
    { id: 'timetableManagement', title: 'Manage Timetable', description: 'Manage class timetable' },
    { id: 'complaints', title: 'Resolve Complaints', description: 'Resolve teacher complaints' },
    { id: 'adminAttendanceHistory', title: 'Attendance History', description: 'View and manage attendance records' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onLogout} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutIcon}>
          <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeBar}>
        <MaterialCommunityIcons name="account-tie" size={20} color="#1A237E" />
        <Text style={styles.welcomeText}>Welcome, {ADMIN_INFO.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuCard} 
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  backBtn: { padding: 4 },
  logoutIcon: { padding: 4 },
  welcomeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    gap: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#1A237E',
    fontWeight: '700',
  },
  content: { padding: 15, paddingBottom: 30 },
  menuCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  menuDescription: { fontSize: 13, color: '#666' },
  arrow: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
});
