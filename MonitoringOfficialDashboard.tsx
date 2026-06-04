import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MonitoringOfficialDashboard({ onNavigate, onLogout }: { onNavigate: (screen: string) => void, onLogout: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.roleText}>Monitoring Official</Text>
          <Text style={styles.welcomeText}>Welcome, Abdullah</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Main Menu Buttons */}
        <TouchableOpacity style={styles.menuBtn} onPress={() => onNavigate('assignDuty')}>
          <MaterialCommunityIcons name="clipboard-list" size={24} color="#1A237E" />
          <Text style={styles.menuText}>View Assign Duty</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => onNavigate('monitoringAttendance')}>
          <MaterialCommunityIcons name="account-check" size={24} color="#1A237E" />
          <Text style={styles.menuText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => onNavigate('timetable')}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#1A237E" />
          <Text style={styles.menuText}>Select Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => onNavigate('todayAttendance')}>
          <MaterialCommunityIcons name="eye" size={24} color="#1A237E" />
          <Text style={styles.menuText}>View Today Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => onNavigate('history')}>
          <MaterialCommunityIcons name="history" size={24} color="#1A237E" />
          <Text style={styles.menuText}>View Attendance History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#1A237E',
    padding: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  roleText: { color: '#B0BEC5', fontSize: 14, fontWeight: '500' },
  welcomeText: { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 },
  logoutBtn: { padding: 5 },
  content: { padding: 20, gap: 15 },
  menuBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});