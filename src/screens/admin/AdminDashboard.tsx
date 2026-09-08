import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../services/tokenStorage';
import { dashboardService } from '../../services/dashboardService';

export default function AdminDashboard({ onNavigate, onLogout }: any) {
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await tokenStorage.getUser();
        if (user && user.name) {
          setAdminName(user.name);
        }
        
        const dashboardData = await dashboardService.getAdminStats();
        setStats(dashboardData);
      } catch (error) {
        console.log('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const menuItems = [
    { id: 'pending', title: 'Pending Approvals' },
    { id: 'users', title: 'User Profiles' },
    { id: 'assignDuty', title: 'Assign Duty' },
    { id: 'timetableManagement', title: 'Manage Timetable' },
    { id: 'complaints', title: 'Resolve Complaints' },
    { id: 'adminAttendanceHistory', title: 'Attendance History' }
  ];

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1A237E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {adminName}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ✅ FIXED: Stats Cards (Dono cards ab bilkul simple aur same hain) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_teachers || 0}</Text>
            <Text style={styles.statLabel}>Total Teachers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_monitors || 0}</Text>
            <Text style={styles.statLabel}>Total Monitoring Officials</Text>
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuCard} 
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
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
  logoutBtn: { 
    backgroundColor: '#FFF', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  logoutText: { color: '#1A237E', fontWeight: '700', fontSize: 14 },
  content: { padding: 15, paddingBottom: 30 },

  // Stats Cards Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8EAF6',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A237E',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },

  // Menu Styles
  menuCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  arrow: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
});