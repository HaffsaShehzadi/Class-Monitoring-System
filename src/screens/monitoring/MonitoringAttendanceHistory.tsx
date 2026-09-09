import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '14:00 - 14:45' },
  { id: 7, time: '15:00 - 15:45' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];

const ASSIGNED_DEPARTMENTS = [
  { id: 1, name: 'IT', shift: '1st Shift', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 2, name: 'BSCS', shift: '1st Shift', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 3, name: 'Math', shift: '2nd Shift', assignedBy: 'Admin', date: '2024-06-02' },
  { id: 4, name: 'Physics', shift: '2nd Shift', assignedBy: 'Admin', date: '2024-06-02' },
];

const MOCK_ATTENDANCE = [
  { id: 1, date: '2026-08-01', dept: 'IT', sem: '2nd', day: 'Saturday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', room: 'R39', status: 'Present', substitute: '' },
  { id: 2, date: '2026-08-01', dept: 'IT', sem: '2nd', day: 'Saturday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', room: 'R38', status: 'Absent', substitute: 'Ali Khan' },
  { id: 3, date: '2026-08-01', dept: 'IT', sem: '4th', day: 'Saturday', period: 1, teacher: 'Hasan Raza', code: 'CC-213L', room: 'R39', status: 'Present', substitute: '' },
  { id: 4, date: '2026-08-01', dept: 'BSCS', sem: '2nd', day: 'Saturday', period: 1, teacher: 'Asif Iqbal', code: 'GISL-101', room: 'R21', status: 'Present', substitute: '' },
  { id: 5, date: '2026-08-01', dept: 'Math', sem: '2nd', day: 'Saturday', period: 1, teacher: 'M. Kamran', code: 'MATH-201', room: 'R21', status: 'Absent', substitute: 'Hira Afzal' },
  { id: 6, date: '2026-08-03', dept: 'IT', sem: '2nd', day: 'Monday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', room: 'R39', status: 'Present', substitute: '' },
  { id: 7, date: '2026-08-03', dept: 'IT', sem: '2nd', day: 'Monday', period: 3, teacher: 'Mohsin Raza', code: 'GENG-201', room: 'R38', status: 'Absent', substitute: '' },
  { id: 8, date: '2026-08-03', dept: 'BSCS', sem: '2nd', day: 'Monday', period: 2, teacher: 'Asif Iqbal', code: 'GISL-101', room: 'R21', status: 'Absent', substitute: 'Dr. Imran' },
  { id: 9, date: '2026-08-03', dept: 'Physics', sem: '2nd', day: 'Monday', period: 1, teacher: 'Ahmad Ali', code: 'PHY-101', room: 'R22', status: 'Present', substitute: '' },
  { id: 10, date: '2026-08-04', dept: 'IT', sem: '4th', day: 'Tuesday', period: 2, teacher: 'Hasan Raza', code: 'CC-213L', room: 'R39', status: 'Present', substitute: '' },
  { id: 11, date: '2026-08-04', dept: 'Math', sem: '2nd', day: 'Tuesday', period: 1, teacher: 'M. Kamran', code: 'MATH-201', room: 'R21', status: 'Present', substitute: '' },
  { id: 12, date: '2026-08-04', dept: 'Physics', sem: '2nd', day: 'Tuesday', period: 2, teacher: 'Ahmad Ali', code: 'PHY-101', room: 'R22', status: 'Absent', substitute: 'Sara Ahmed' },
];

export default function MonitoringAttendanceHistory({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-01');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [selectedMonitoringDept, setSelectedMonitoringDept] = useState<string | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  const monitoringDepts = ASSIGNED_DEPARTMENTS.filter(d => d.shift === selectedShift);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filteredAttendance = useMemo(() => {
    return MOCK_ATTENDANCE.filter(a =>
      a.dept === selectedMonitoringDept && a.date === selectedDate
    );
  }, [selectedMonitoringDept, selectedDate]);

  const getAttendance = (sem: string, periodId: number) => {
    return filteredAttendance.find(a => a.sem === sem && a.period === periodId);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Present') return '#4CAF50';
    if (status === 'Absent') return '#F44336';
    return '#E0E0E0';
  };

  const handleDateContinue = () => {
    if (!selectedDate.trim()) {
      Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)');
      return;
    }
    if (isNaN(new Date(selectedDate).getTime())) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
      return;
    }
    setDateConfirmed(true);
  };

  const handleCellPress = (record: any) => {
    if (!record) return;
    setViewingRecord(record);
    setViewDetailsModal(true);
  };

  // ==========================================
  // STEP 1: Select Shift
  // ==========================================
  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('1st Shift'); setDateConfirmed(false); }}
          >
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('2nd Shift'); setDateConfirmed(false); }}
          >
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Select Date (SINGLE date, NO preview)
  // ==========================================
  if (!dateConfirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedShift(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Select Date</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.dateScreenContent}>
          <View style={styles.dateCard}>
            <View style={styles.dateIconWrap}>
              <MaterialCommunityIcons name="calendar-search" size={45} color="#1A237E" />
            </View>
            <Text style={styles.dateCardTitle}>Select Date</Text>
            <Text style={styles.dateCardSubtitle}>
              Kis date ki attendance history dekhni hai?
            </Text>

            {/* ✅ SINGLE date input - koi start/end nahi */}
            <View style={styles.dateInputWrapper}>
              <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
              <TextInput 
                style={styles.dateInput} 
                placeholder="YYYY-MM-DD" 
                value={selectedDate} 
                onChangeText={setSelectedDate}
                placeholderTextColor="#999"
              />
            </View>

            {/* ✅ Preview (day-date) YAHAN SE HATA DIYA */}

            <TouchableOpacity style={styles.continueBtn} onPress={handleDateContinue}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 3: Select Department
  // ==========================================
  if (!selectedMonitoringDept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDateConfirmed(false)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Departments</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.dateInfoBar}>
          <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
          <Text style={styles.dateInfoText}>{formatDisplayDate(selectedDate)}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {monitoringDepts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No departments assigned for this shift</Text>
            </View>
          ) : (
            monitoringDepts.map(dept => (
              <TouchableOpacity
                key={dept.id}
                style={styles.deptCard}
                onPress={() => setSelectedMonitoringDept(dept.name)}
              >
                <View style={styles.deptIcon}>
                  <MaterialCommunityIcons name="book-open-variant" size={40} color="#1A237E" />
                </View>
                <View style={styles.deptInfo}>
                  <Text style={styles.deptName}>{dept.name} Department</Text>
                  <Text style={styles.deptMeta}>Assigned by: {dept.assignedBy}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#1A237E" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 4: Grid View (DAY + DATE show hota hai)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedMonitoringDept(null)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedMonitoringDept} - Attendance History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ DAY + DATE yahan show hota hai */}
      <View style={styles.dateInfoBar}>
        <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
        <Text style={styles.dateInfoText}>{formatDisplayDate(selectedDate)}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
        <ScrollView showsVerticalScrollIndicator={true} style={styles.verticalScroll}>
          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={styles.cornerCell}>
                <Text style={styles.cornerText}>Sem / Period</Text>
              </View>
              {PERIODS.map(p => (
                <View key={p.id} style={styles.periodHeaderCell}>
                  <Text style={styles.periodNum}>P{p.id}</Text>
                  <Text style={styles.periodTime}>{p.time}</Text>
                </View>
              ))}
            </View>

            {SEMESTERS.map(sem => (
              <View key={sem} style={styles.row}>
                <View style={styles.deptSemCell}>
                  <Text style={styles.deptText}>{selectedMonitoringDept}</Text>
                  <Text style={styles.semText}>{sem}</Text>
                </View>
                
                {PERIODS.map(p => {
                  const record = getAttendance(sem, p.id);
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.dataCell, record ? { backgroundColor: '#FFF' } : styles.emptyCell]}
                      onPress={() => handleCellPress(record)}
                      activeOpacity={0.7}
                      disabled={!record}
                    >
                      {record ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellTeacher} numberOfLines={1}>{record.teacher}</Text>
                          <Text style={styles.cellCode} numberOfLines={1}>{record.code}</Text>
                          <TouchableOpacity 
                            style={[styles.statusButton, { backgroundColor: getStatusColor(record.status) }]}
                            onPress={() => handleCellPress(record)}
                          >
                            <Text style={styles.statusText}>{record.status}</Text>
                          </TouchableOpacity>
                          {record.status === 'Absent' && record.substitute ? (
                            <Text style={styles.substituteText}>→ {record.substitute}</Text>
                          ) : null}
                        </View>
                      ) : (
                        <Text style={styles.emptyCellText}>No Class</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* View Details Modal */}
      <Modal visible={viewDetailsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendance Details</Text>
              <TouchableOpacity onPress={() => setViewDetailsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            {viewingRecord && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.viewInfo}>
                  <Text style={styles.viewLabel}>Teacher:</Text>
                  <Text style={styles.viewValue}>{viewingRecord.teacher}</Text>
                  <Text style={styles.viewLabel}>Subject:</Text>
                  <Text style={styles.viewValue}>{viewingRecord.code}</Text>
                  <Text style={styles.viewLabel}>Room:</Text>
                  <Text style={styles.viewValue}>{viewingRecord.room}</Text>
                  <Text style={styles.viewLabel}>Date:</Text>
                  <Text style={styles.viewValue}>{formatDisplayDate(viewingRecord.date)}</Text>
                  <Text style={styles.viewLabel}>Period:</Text>
                  <Text style={styles.viewValue}>Period {viewingRecord.period}</Text>
                  <Text style={styles.viewLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(viewingRecord.status) }]}>
                    <Text style={styles.statusBadgeText}>{viewingRecord.status}</Text>
                  </View>
                  {viewingRecord.status === 'Absent' && viewingRecord.substitute ? (
                    <>
                      <Text style={styles.viewLabel}>Substitute Teacher:</Text>
                      <Text style={styles.viewValue}>{viewingRecord.substitute}</Text>
                    </>
                  ) : null}
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setViewDetailsModal(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#1A237E', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', flex: 1 },
  
  content: { padding: 15 },
  
  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },
  
  dateScreenContent: { padding: 20, paddingBottom: 40 },
  dateCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 25, elevation: 3, alignItems: 'center',
  },
  dateIconWrap: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 15,
  },
  dateCardTitle: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  dateCardSubtitle: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },
  dateInputWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD',
    borderRadius: 10, paddingHorizontal: 12, gap: 8, marginBottom: 15,
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  continueBtn: {
    width: '100%', backgroundColor: '#1A237E', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', elevation: 3,
  },
  continueBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  dateInfoBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 12, marginHorizontal: 15, marginTop: 15, marginBottom: 10,
    borderRadius: 10, gap: 8,
  },
  dateInfoText: { fontSize: 14, color: '#1A237E', fontWeight: '700', flex: 1 },
  
  deptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  deptIcon: {
    backgroundColor: '#E8EAF6',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deptInfo: { flex: 1 },
  deptName: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  deptMeta: { fontSize: 12, color: '#666' },
  
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },

  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  
  deptSemCell: { width: 90, minHeight: 100, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  
  dataCell: { width: 115, minHeight: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 6 },
  emptyCell: { backgroundColor: '#FAFAFA' },
  emptyCellText: { fontSize: 10, color: '#B0BEC5', fontWeight: '600' },
  
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginBottom: 4 },
  
  statusButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  
  substituteText: { fontSize: 8, color: '#2196F3', marginTop: 2, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalBody: { padding: 0 },
  
  viewInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15 },
  viewLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 8 },
  viewValue: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  statusBadgeText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  closeBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  closeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});