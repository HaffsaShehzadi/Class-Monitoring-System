import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Sample assigned duties data
const ASSIGNED_DUTIES = [
  {
    id: 1,
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
    department: 'BSCS',
    semester: '4th',
    day: 'Tuesday',
    periods: '1, 2',
    assignedDate: '2024-06-02',
    assignedBy: 'Admin',
    status: 'Active',
  },
  {
    id: 3,
    department: 'Math',
    semester: '6th',
    day: 'Wednesday',
    periods: '4, 5, 6',
    assignedDate: '2024-06-03',
    assignedBy: 'Admin',
    status: 'Active',
  },
];

export default function ViewAssignDutyScreen({ onBack }: any) {
  const [selectedDuty, setSelectedDuty] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Assigned Duties</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#1A237E" />
          <Text style={styles.infoText}>
            These are the duties assigned to you by Admin
          </Text>
        </View>

        {ASSIGNED_DUTIES.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="clipboard-off" size={60} color="#999" />
            <Text style={styles.emptyText}>No duties assigned yet</Text>
          </View>
        ) : (
          ASSIGNED_DUTIES.map(duty => (
            <TouchableOpacity
              key={duty.id}
              style={styles.dutyCard}
              onPress={() => setSelectedDuty(duty)}
            >
              <View style={styles.dutyHeader}>
                <View style={styles.deptBadge}>
                  <MaterialCommunityIcons name="school" size={20} color="#FFF" />
                  <Text style={styles.deptText}>{duty.department}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{duty.status}</Text>
                </View>
              </View>

              <View style={styles.dutyBody}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="book-open-variant" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Semester:</Text>
                  <Text style={styles.detailValue}>{duty.semester}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Day:</Text>
                  <Text style={styles.detailValue}>{duty.day}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Periods:</Text>
                  <Text style={styles.detailValue}>{duty.periods}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Assigned:</Text>
                  <Text style={styles.detailValue}>{duty.assignedDate}</Text>
                </View>
              </View>

              <View style={styles.dutyFooter}>
                <MaterialCommunityIcons name="account-check" size={16} color="#4CAF50" />
                <Text style={styles.footerText}>Assigned by: {duty.assignedBy}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      {selectedDuty && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Duty Details</Text>
              <TouchableOpacity onPress={() => setSelectedDuty(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Department:</Text>
                <Text style={styles.modalValue}>{selectedDuty.department}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Semester:</Text>
                <Text style={styles.modalValue}>{selectedDuty.semester}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Day:</Text>
                <Text style={styles.modalValue}>{selectedDuty.day}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Periods:</Text>
                <Text style={styles.modalValue}>{selectedDuty.periods}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Assigned Date:</Text>
                <Text style={styles.modalValue}>{selectedDuty.assignedDate}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Status:</Text>
                <Text style={[styles.modalValue, { color: '#4CAF50' }]}>{selectedDuty.status}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedDuty(null)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
  content: { padding: 15 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: { fontSize: 13, color: '#1A237E', fontWeight: '600', marginLeft: 8, flex: 1 },
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  deptText: { color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dutyBody: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 13, color: '#666', marginLeft: 8, marginRight: 8, width: 80 },
  detailValue: { fontSize: 13, color: '#333', fontWeight: '600', flex: 1 },
  dutyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginLeft: 6 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  modalBody: { padding: 20 },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  modalValue: { fontSize: 14, color: '#333', fontWeight: '700' },
  closeBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});