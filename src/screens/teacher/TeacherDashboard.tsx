import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../services/tokenStorage'; // ✅ Real user data ke liye import

export default function TeacherDashboard({ onNavigate, onLogout }: any) {
  const [teacherName, setTeacherName] = useState('Teacher'); // ✅ Dynamic name state

  // ✅ Screen load hone par real user data fetch karein
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await tokenStorage.getUser();
        if (user && user.name) {
          setTeacherName(user.name);
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

  const menuItems = [
    { id: 'myTimetable', title: 'My Timetable' },
    { id: 'teacherAttendanceHistory', title: 'My Attendance History' },
    { id: 'submitComplaint', title: 'Submit Complaint' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Teacher Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {teacherName}</Text> {/* ✅ Dynamic name */}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
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