import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MonitoringOfficialDashboard({ onNavigate, onLogout }: any) {
  const menuItems = [
    // ✅ Today's Attendance removed - sirf 3 options hain
    { id: 'viewAssignDuty', title: 'View Assign Duty', icon: 'calendar-check', color: '#2196F3' },
    { id: 'markAttendance', title: 'Mark Attendance', icon: 'clipboard-check', color: '#4CAF50' },
    { id: 'attendanceHistory', title: 'Attendance History', icon: 'history', color: '#00BCD4' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Monitoring</Text>
        <TouchableOpacity onPress={onLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card} 
              onPress={() => onNavigate(item.id, { userRole: 'monitoring' })}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={35} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#1A237E', 
    padding: 20, 
    paddingTop: 40, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  welcomeText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  content: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 15, 
    alignItems: 'center', 
    elevation: 2 
  },
  iconBox: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  cardTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333', 
    textAlign: 'center' 
  },
});