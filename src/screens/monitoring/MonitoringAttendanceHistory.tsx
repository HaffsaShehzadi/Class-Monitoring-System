import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../services/tokenStorage';
import { moService } from '../../services/moService';
import { detectBackend } from '../../services/ipConfig';

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

export default function MonitoringAttendanceHistory({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-01');
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [selectedMonitoringDept, setSelectedMonitoringDept] = useState<string | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  // ✅ REAL DATA STATES
  const [userInfo, setUserInfo] = useState<any>({ name: 'Loading...', role: 'Monitoring Official' });
  const [assignedDuties, setAssignedDuties] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Screen load hone par real user info aur duties fetch karein
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await tokenStorage.getUser();
        if (user) setUserInfo(user);
        
        const duties = await moService.getMyDuties();
        setAssignedDuties(duties);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ✅ Selected shift ke mutabiq unique departments filter karein
  const monitoringDepts = useMemo(() => {
    if (!selectedShift) return [];
    const uniqueDepts = [...new Map(
      assignedDuties
        .filter((d: any) => d.shift === selectedShift)
        .map((item: any) => [item.dept_name, item])
    ).values()];
    return uniqueDepts;
  }, [selectedShift, assignedDuties]);

  // ✅ Jab department select ho, toh us date ki attendance fetch karein
  useEffect(() => {
    if (selectedMonitoringDept && selectedDate) {
      fetchAttendance();
    }
  }, [selectedMonitoringDept, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      
      // Department ID dhundna taake backend ko bhej sakein
      const deptObj = assignedDuties.find((d: any) => d.dept_name === selectedMonitoringDept);
      const deptId = deptObj?.department_id || deptObj?.id; 

      // Backend se attendance fetch karna
      const url = `${BACKEND_URL}/api/attendance/mo-history?date=${selectedDate}&department_id=${deptId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance');
      
      // Backend data ko UI format mein map karna
      const mapped = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        dept: item.dept_name,
        sem: item.semester,
        day: item.day,
        period: item.period_number,
        teacher: item.teacher_name,
        code: item.subject_code,
        room: item.room_no,
        status: item.status,
        substitute: item.substitute_teacher_name || ''
      }));
      
      setAttendanceRecords(mapped);
    } catch (error: any) {
      console.error('Fetch attendance error:', error);
      // Agar backend endpoint abhi ready na ho, toh empty array set karein taake app crash na ho
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAttendance = (sem: string, periodId: number) => {
    return attendanceRecords.find(a => a.sem === sem && a.period === periodId);
  };

  const getStatusColor = (status: string) => {
    if (status?.toLowerCase() === 'present') return '#4CAF50';
    if (status?.toLowerCase() === 'absent') return '#F44336';
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
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : (
          <View style={styles.shiftContainer}>
            <TouchableOpacity 
              style={styles.shiftCard}
              onPress={() => { setSelectedShift('1st Shift'); setDateConfirmed(false); setSelectedMonitoringDept(null); }}
            >
              <Text style={styles.shiftTitle}>1st Shift</Text>
              <Text style={styles.shiftSubtext}>Morning Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.shiftCard}
              onPress={() => { setSelectedShift('2nd Shift'); setDateConfirmed(false); setSelectedMonitoringDept(null); }}
            >
              <Text style={styles.shiftTitle}>2nd Shift</Text>
              <Text style={styles.shiftSubtext}>Evening Classes</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Select Date
  // ==========================================
  if (!dateConfirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedShift(null)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Select Date</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.rangeContainer}>
          <View style={styles.dateCard}>
            <Text style={styles.dateCardTitle}>Select Date</Text>
            <Text style={styles.dateCardSubtitle}>
              Which date attendance history do you want to view?
            </Text>

            <View style={styles.dateInputWrapper}>
              <TextInput 
                style={styles.dateInput} 
                value={selectedDate} 
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={handleDateContinue}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Departments</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.teacherTopCard}>
            <Text style={styles.teacherTopName}>{userInfo.name}</Text>
            <Text style={styles.teacherTopDept}>{userInfo.role} • {selectedShift}</Text>
            <View style={styles.dateRangeLine}>
              <Text style={styles.dateRangeText}>{formatDisplayDate(selectedDate)}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Departments</Text>
            <Text style={styles.sectionCount}>{monitoringDepts.length} Departments</Text>
          </View>

          {loading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color="#1A237E" />
            </View>
          ) : monitoringDepts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No departments assigned for this shift</Text>
            </View>
          ) : (
            monitoringDepts.map((dept: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.deptCard}
                onPress={() => setSelectedMonitoringDept(dept.dept_name)}
              >
                <View style={styles.deptInfo}>
                  <Text style={styles.deptName}>{dept.dept_name} Department</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 4: Grid View
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedMonitoringDept(null)}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedMonitoringDept} - Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.teacherTopCard, { marginHorizontal: 15, marginTop: 15 }]}>
        <Text style={styles.teacherTopName}>{userInfo.name}</Text>
        <Text style={styles.teacherTopDept}>{userInfo.role} • {selectedShift}</Text>
        <View style={styles.dateRangeLine}>
          <Text style={styles.dateRangeText}>
            {selectedMonitoringDept} Department • {formatDisplayDate(selectedDate)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading attendance...</Text>
        </View>
      ) : (
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
                            {record.status?.toLowerCase() === 'absent' && record.substitute ? (
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
      )}

      {/* View Details Modal */}
      <Modal visible={viewDetailsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendance Details</Text>
              <TouchableOpacity onPress={() => setViewDetailsModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
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
                  {viewingRecord.status?.toLowerCase() === 'absent' && viewingRecord.substitute ? (
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

// ✅ STYLES: Bilkul same jaise aapke original code mein the
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15, paddingBottom: 30 },
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
  rangeContainer: { flex: 1, justifyContent: 'center', padding: 15 },
  dateCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 25, elevation: 3, alignItems: 'center',
  },
  dateCardTitle: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  dateCardSubtitle: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },
  dateInputWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD',
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 15,
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  continueBtn: {
    width: '100%', backgroundColor: '#1A237E', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', elevation: 3,
  },
  continueBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  teacherTopCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15,
    elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E',
  },
  teacherTopName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  teacherTopDept: { fontSize: 13, color: '#666', marginTop: 3 },
  dateRangeLine: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#E8EAF6',
  },
  dateRangeText: { fontSize: 13, color: '#1A237E', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  sectionCount: { fontSize: 13, color: '#666', fontWeight: '600' },
  deptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  deptInfo: { flex: 1 },
  deptName: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  chevron: { fontSize: 28, color: '#1A237E', fontWeight: '300' },
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
  substituteText: { fontSize: 8, color: '#64B5F6', marginTop: 3, fontWeight: '700', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  closeIcon: { fontSize: 20, color: '#1A237E', fontWeight: '700' },
  modalBody: { padding: 0 },
  viewInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 15 },
  viewLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 8 },
  viewValue: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  statusBadgeText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  closeBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  closeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});