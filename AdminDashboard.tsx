import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminDashboard({ onNavigate, onLogout }: { onNavigate: (screen: string) => void, onLogout: () => void }) {
  const menuItems = [
    { id: 'pending', title: 'Pending Approvals', icon: 'account-clock', color: '#FF9800' },
    { id: 'users', title: 'User Profiles & Duty', icon: 'account-group', color: '#2196F3' },
    { id: 'timetable', title: 'Timetable & Attendance', icon: 'calendar-clock', color: '#4CAF50' },
    { id: 'history', title: 'Attendance History', icon: 'history', color: '#9C27B0' },
    { id: 'complaints', title: 'Resolve Complaints', icon: 'alert-circle', color: '#F44336' },
    { id: 'reports', title: 'Generate Reports', icon: 'file-chart', color: '#00BCD4' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Admin Dashboard</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => onNavigate(item.id)}>
            <MaterialCommunityIcons name={item.icon} size={40} color={item.color} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#1A237E', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  logoutBtn: { padding: 8 },
  grid: { padding: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardTitle: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
});