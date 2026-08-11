import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock current user (Monitoring Official)
const CURRENT_USER = {
  name: 'Ahmed Hassan',
  role: 'Monitoring Official',
};

// Assigned duties data with shift information
const ASSIGNED_DUTIES = [
  {
    id: 1,
    shift: '1st Shift',
    department: 'IT',
    semester: '2nd',
    day: 'Monday',
    periods: '1, 2, 3',
    assignedDate: '2024-06-01',
    assignedBy: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    shift: '1st Shift',
    department: 'BSCS',
    semester: '4th',
    day: 'Monday',
    periods: '1, 2',
    assignedDate: '2024-06-01',
    assignedBy: 'Admin',
    status: 'Active',
  },
  {
    id: 3,
    shift: '1st Shift',
    department: 'Math',
    semester: '6th',
    day: 'Tuesday',
    periods: '4, 5, 6',
    assignedDate: '2024-06-02',
    assignedBy: 'Admin',
    status: 'Active',
  },
  {
    id: 4,
    shift: '2nd Shift',
    department: 'Physics',
    semester: '2nd',
    day: 'Monday',
    periods: '1, 2, 3',
    assignedDate: '2024-06-01',
    assignedBy: 'Admin',
    status: 'Active',
  },
  {
    id: 5,
    shift: '2nd Shift',
    department: 'English',
    semester: '4th',
    day: 'Tuesday',
    periods: '1, 2',
    assignedDate: '2024-06-02',
    assignedBy: 'Admin',
    status: 'Active',
  },
];

export default function ViewAssignDutyScreen({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  const filteredDuties = selectedShift 
    ? ASSIGNED_DUTIES.filter(d => d.shift === selectedShift)
    : [];

  // Step 1: Select Shift
  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#1A237E" />
          <Text style={styles.infoText}>
            Select a shift to view your assigned duties
          </Text>
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => setSelectedShift('1st Shift')}
          >
            <MaterialCommunityIcons name="weather-sunny" size={50} color="#FF9800" />
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
            <Text style={styles.shiftCount}>
              {ASSIGNED_DUTIES.filter(d => d.shift === '1st Shift').length} Departments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => setSelectedShift('2nd Shift')}
          >
            <MaterialCommunityIcons name="weather-night" size={50} color="#3F51B5" />
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
            <Text style={styles.shiftCount}>
              {ASSIGNED_DUTIES.filter(d => d.shift === '2nd Shift').length} Departments
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Show Assigned Departments
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedShift(null)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedShift}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Official Info Header */}
      <View style={styles.officialHeader}>
        <View style={styles.officialAvatar}>
          <MaterialCommunityIcons name="account" size={30} color="#1A237E" />
        </View>
        <View style={styles.officialInfo}>
          <Text style={styles.officialName}>{CURRENT_USER.name}</Text>
          <Text style={styles.officialRole}>{CURRENT_USER.role}</Text>
          <Text style={styles.currentDate}>
            <MaterialCommunityIcons name="calendar" size={14} color="#666" />
            {' '}{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assigned Departments</Text>
        <Text style={styles.sectionCount}>{filteredDuties.length} Departments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredDuties.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="clipboard-off" size={60} color="#999" />
            <Text style={styles.emptyText}>No duties assigned for this shift</Text>
          </View>
        ) : (
          filteredDuties.map(duty => (
            <View key={duty.id} style={styles.dutyCard}>
              <View style={styles.dutyHeader}>
                <View style={styles.deptBadge}>
                  <MaterialCommunityIcons name="school" size={20} color="#FFF" />
                  <Text style={styles.deptText}>{duty.department}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="check-circle" size={14} color="#FFF" />
                  <Text style={styles.statusText}>{duty.status}</Text>
                </View>
              </View>

              <View style={styles.dutyBody}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="book-open-variant" size={18} color="#1A237E" />
                  <Text style={styles.detailLabel}>Semester:</Text>
                  <Text style={styles.detailValue}>{duty.semester}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={18} color="#1A237E" />
                  <Text style={styles.detailLabel}>Day:</Text>
                  <Text style={styles.detailValue}>{duty.day}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#1A237E" />
                  <Text style={styles.detailLabel}>Periods:</Text>
                  <Text style={styles.detailValue}>{duty.periods}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar-check" size={18} color="#1A237E" />
                  <Text style={styles.detailLabel}>Assigned:</Text>
                  <Text style={styles.detailValue}>{duty.assignedDate}</Text>
                </View>
              </View>

              <View style={styles.dutyFooter}>
                <MaterialCommunityIcons name="account-check" size={16} color="#4CAF50" />
                <Text style={styles.footerText}>Assigned by: {duty.assignedBy}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    margin: 15,
    borderRadius: 10,
  },
  infoText: { fontSize: 13, color: '#1A237E', fontWeight: '600', marginLeft: 8, flex: 1 },
  
  // Shift Selection Styles
  shiftContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    gap: 20 
  },
  shiftCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginTop: 10, marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666', marginBottom: 10 },
  shiftCount: { fontSize: 13, color: '#1A237E', fontWeight: '700', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  
  // Official Header
  officialHeader: {
    backgroundColor: '#FFF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  officialAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  officialInfo: { flex: 1 },
  officialName: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  officialRole: { fontSize: 13, color: '#666', marginBottom: 4 },
  currentDate: { fontSize: 12, color: '#888' },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  sectionCount: { fontSize: 13, color: '#666', fontWeight: '600' },
  
  content: { padding: 15 },
  
  dutyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  dutyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptBadge: {
    backgroundColor: '#1A237E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  deptText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 6 },
  statusBadge: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  dutyBody: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF6',
  },
  detailLabel: { fontSize: 13, color: '#666', marginLeft: 10, marginRight: 10, width: 90, fontWeight: '600' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '700', flex: 1 },
  dutyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginLeft: 6 },
  
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
});