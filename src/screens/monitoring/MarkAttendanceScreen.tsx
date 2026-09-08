import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkLocation } from '../../services/locationService';
import { saveOfflineAttendance } from '../../services/offlineStorage';
import { syncOfflineData } from '../../services/syncService';
import { moService } from '../../services/moService';
import { tokenStorage } from '../../services/tokenStorage';
import { attendanceService } from '../../services/attendanceService';

// ⚠️ TESTING ke liye false, VIVA/DEMO ke liye true
const ENFORCE_TIME_CHECK = true;

const SEMESTERS = ['2nd', '4th', '6th', '8th'];

const formatTime12Hour = (time24: string): string => {
  if (!time24 || !time24.includes('-')) return time24 || 'N/A';
  const [start, end] = time24.split(' - ');
  const formatSingle = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${formatSingle(start)} - ${formatSingle(end)}`;
};

const isWithinLectureTime = (timeStr: string, shift: string): boolean => {
  if (!ENFORCE_TIME_CHECK) return true;
  try {
    const [start, end] = timeStr.split(' - ');
    const parseTime = (time: string) => {
      const parts = time.split(':').map(Number);
      let hours = parts[0];
      const minutes = parts[1];
      if (shift === '2nd Shift' && hours < 12) {
        hours += 12;
      }
      return hours * 60 + minutes;
    };
    
    const startMin = parseTime(start);
    const endMin = parseTime(end);
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
    let adjustedEndMin = endMin;
    if (endMin < startMin) {
      adjustedEndMin = endMin + 12 * 60;
    }
    
    return currentMin >= startMin && currentMin <= adjustedEndMin;
  } catch (error) {
    console.error("Time check error:", error);
    return true;
  }
};

export default function MarkAttendanceScreen({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDay] = useState('Monday');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | ''>('');
  const [substituteName, setSubstituteName] = useState('');
  const [savedRecords, setSavedRecords] = useState<any>({});

  const [assignedDuties, setAssignedDuties] = useState<any[]>([]);
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Loading...', role: 'Monitoring Official' });

  // ✅ BILKUL WAHI LOGIC JO ViewAssignDutyScreen MEIN KAAM KAR RAHI HAI
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await tokenStorage.getUser();
        if (user) {
          setCurrentUser(user);
        }
        
        // ✅ 1. Bina kisi parameter ke saari duties fetch karein (Jaise ViewAssignDuty mein hai)
        const fetchedDuties = await moService.getMyDuties();
        console.log("📋 Fetched duties:", fetchedDuties);
        
        // ✅ 2. Aaj ki date nikalein
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // ✅ 3. Sirf aaj ki duties filter karein
        const todaysDuties = fetchedDuties.filter((d: any) => {
          const dDate = d.duty_date ? String(d.duty_date).split('T')[0] : '';
          return dDate === todayStr;
        });

        console.log("📅 Today's duties:", todaysDuties.length);

        // ✅ 4. Agar shift select hai, toh us hisaab se aur filter karein
        let filteredDuties = todaysDuties;
        if (selectedShift) {
          filteredDuties = filteredDuties.filter((d: any) => d.shift === selectedShift || d.shift === 'Both');
        }

        // ✅ 5. Unique departments nikalein
        const uniqueDepts = [...new Map(filteredDuties.map((item: any) => 
          [item.dept_name + '-' + item.shift, { 
            id: item.id, 
            department: item.dept_name, 
            shift: item.shift 
          }]
        )).values()];
        
        console.log("✅ Final departments to show:", uniqueDepts);
        setAssignedDuties(uniqueDepts);
      } catch (error: any) {
        console.error('❌ Failed to load duties:', error.message);
        Alert.alert('Error', error.message || 'Failed to load duties');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [selectedShift]);

  useEffect(() => {
    if (selectedShift && selectedDept) {
      fetchTimetable();
    }
  }, [selectedShift, selectedDept, selectedDay]);

  const fetchTimetable = async () => {
    if (!selectedShift || !selectedDept) return;
    setLoading(true);
    try {
      const config = await moService.getConfig();
      const filteredPeriods = (config.periods || []).filter((p: any) => {
        if (p.shift !== selectedShift) return false;
        if (selectedDay === 'Friday') return p.day === 'Friday';
        return p.day === 'Regular' || p.day === null || p.day === undefined;
      });
      setPeriods(filteredPeriods);
      
      const data = await moService.getTimetableByDayAndShift(selectedDay, selectedShift);
      const mappedData = data.map((item: any) => ({
        id: item.id,
        dept: item.dept_name,
        semester: item.semester,
        day: item.day,
        period: item.period_number,
        time: `${item.start_time} - ${item.end_time}`,
        subject: item.subject_code,
        code: item.subject_code,
        teacher: item.teacher_name,
        room: item.room_no
      }));
      setTimetableData(mappedData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = assignedDuties.filter(d => d.shift === selectedShift);
  
  const getAttendance = (sem: string, periodId: number) => 
    timetableData.find(t => t.dept === selectedDept && t.semester === sem && t.day === selectedDay && t.period === periodId);
    
  const getRecord = (id: number) => savedRecords[id] || null;

  const getStatusColor = (r: any) => {
    if (!r) return '#999';
    if (r.status === 'absent') return '#F44336';
    if (r.status === 'present' && r.isOffline) return '#FFC107';
    return '#4CAF50';
  };

  const getStatusDisplay = (r: any) => {
    if (!r) return '';
    if (r.status === 'absent') return 'Absent';
    if (r.status === 'present' && r.isOffline) return 'Present (Offline)';
    return 'Present';
  };

  const handleCellPress = (lecture: any) => {
    if (!lecture) return;
    if (getRecord(lecture.id)) {
      Alert.alert('Already Marked', 'Attendance already marked for this class. Cannot edit.');
      return;
    }
    setSelectedLecture(lecture);
    setSelectedStatus('');
    setSubstituteName('');
    setShowModal(true);
  };

  const handleStatusSelect = (status: 'present' | 'absent') => {
    setSelectedStatus(status);
    if (status === 'present') {
      setSubstituteName('');
    }
  };

  const handleSave = async () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select Present or Absent');
      return;
    }

    try {
      if (!isWithinLectureTime(selectedLecture.time, selectedShift || '')) {
        Alert.alert('⏰ Time Error', `Attendance sirf ${formatTime12Hour(selectedLecture.time)} ke doran mark ho sakti hai`);
        return;
      }

      const moLocation = await checkLocation();
      if (!moLocation.success) {
        Alert.alert('📍 MO Location Error', moLocation.error || 'Unable to verify your location');
        return;
      }

      try {
        await attendanceService.markAttendance(
          selectedLecture.id,
          selectedStatus === 'present' ? 'Present' : 'Absent',
          selectedStatus === 'absent' ? substituteName : null
        );

        setSavedRecords({ 
          ...savedRecords, 
          [selectedLecture.id]: { 
            status: selectedStatus, 
            substituteName: selectedStatus === 'absent' ? substituteName : '',
            timestamp: new Date().toLocaleString() 
          } 
        });

        setShowModal(false);
        Alert.alert('✅ Success', `Attendance marked as ${selectedStatus === 'present' ? 'Present' : 'Absent'}`);
        
      } catch (apiError: any) {
        console.log("Online attendance failed, saving offline:", apiError);
        const today = new Date().toISOString().split('T')[0];
        await saveOfflineAttendance({
          timetable_id: selectedLecture.id,
          teacher_name: selectedLecture.teacher,
          date: today,
          period: selectedLecture.period,
          status: selectedStatus === 'present' ? 'Present' : 'Absent',
          substitute: selectedStatus === 'absent' ? substituteName : '',
          latitude: moLocation.latitude!,
          longitude: moLocation.longitude!,
        });

        setSavedRecords({ 
          ...savedRecords, 
          [selectedLecture.id]: { 
            status: selectedStatus, 
            substituteName: selectedStatus === 'absent' ? substituteName : '',
            timestamp: new Date().toLocaleString(),
            isOffline: true
          } 
        });

        setShowModal(false);
        Alert.alert('📴 Offline Saved', 'No internet. Attendance saved locally and will sync when online.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    }
  };

  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : (
          <View style={styles.shiftContainer}>
            <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('1st Shift')}>
              <Text style={styles.shiftTitle}>1st Shift</Text>
              <Text style={styles.shiftSubtext}>Morning Classes</Text>
              <Text style={styles.shiftCount}>{assignedDuties.filter(d => d.shift === '1st Shift').length} Departments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('2nd Shift')}>
              <Text style={styles.shiftTitle}>2nd Shift</Text>
              <Text style={styles.shiftSubtext}>Evening Classes</Text>
              <Text style={styles.shiftCount}>{assignedDuties.filter(d => d.shift === '2nd Shift').length} Departments</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (!selectedDept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedShift(null)}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.teacherTopCard}>
            <Text style={styles.teacherTopName}>{currentUser.name}</Text>
            <Text style={styles.teacherTopDept}>{currentUser.role} • {selectedShift}</Text>
            <View style={styles.dateRangeLine}>
              <Text style={styles.dateRangeText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Departments</Text>
            <Text style={styles.sectionCount}>{filteredDepts.length} Departments</Text>
          </View>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator size="large" color="#1A237E" /></View>
          ) : filteredDepts.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>No duties assigned for this shift</Text></View>
          ) : (
            filteredDepts.map((duty, index) => (
              <TouchableOpacity key={index} style={styles.deptCard} onPress={() => setSelectedDept(duty.department)}>
                <View style={styles.deptInfo}><Text style={styles.deptName}>{duty.department} Department</Text></View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDept(null)}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDept} - Mark Attendance</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
        <View style={[styles.teacherTopCard, { marginHorizontal: 15, marginTop: 15 }]}>
          <Text style={styles.teacherTopName}>{currentUser.name}</Text>
          <Text style={styles.teacherTopDept}>{currentUser.role} • {selectedShift}</Text>
          <View style={styles.dateRangeLine}>
            <Text style={styles.dateRangeText}>{selectedDept} Department • {selectedDay} • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading timetable...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <View style={styles.grid}>
                <View style={styles.row}>
                  <View style={styles.cornerCell}><Text style={styles.cornerText}>Sem / Period</Text></View>
                  {periods.map(p => (
                    <View key={p.id} style={styles.periodHeaderCell}>
                      <Text style={styles.periodNum}>P{p.period_number}</Text>
                      <Text style={styles.periodTime}>{formatTime12Hour(p.time)}</Text>
                    </View>
                  ))}
                </View>
                {SEMESTERS.map(sem => (
                  <View key={sem} style={styles.row}>
                    <View style={styles.deptSemCell}>
                      <Text style={styles.deptText}>{selectedDept}</Text>
                      <Text style={styles.semText}>{sem}</Text>
                    </View>
                    {periods.map(p => {
                      const cls = getAttendance(sem, p.period_number);
                      const record = cls ? getRecord(cls.id) : null;
                      const isAlreadyMarked = !!record;
                      return (
                        <TouchableOpacity 
                          key={p.id} 
                          style={[styles.dataCell, cls ? styles.filledCell : styles.emptyCell]} 
                          onPress={() => handleCellPress(cls)} 
                          disabled={!cls || isAlreadyMarked}
                        >
                          {cls ? (
                            <View style={styles.cellContent}>
                              <Text style={styles.cellTeacher} numberOfLines={1}>{cls.teacher}</Text>
                              <Text style={styles.cellCode}>{cls.code}</Text>
                              <Text style={styles.cellRoom}>{cls.room}</Text>
                              {record ? (
                                <View>
                                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record) }]}>
                                    <Text style={styles.statusText}>{getStatusDisplay(record)}</Text>
                                  </View>
                                  {record.status === 'absent' && record.substituteName && record.substituteName.trim() ? (
                                    <Text style={styles.substituteText}>{record.substituteName}</Text>
                                  ) : null}
                                </View>
                              ) : (
                                <View style={styles.markBtn}><Text style={styles.markBtnText}>Mark</Text></View>
                              )}
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>No Class</Text>
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
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
            </View>
            {selectedLecture && (
              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
                <Text style={styles.label}>Select Status *</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity style={[styles.statusOption, selectedStatus === 'present' && styles.presentBtn]} onPress={() => handleStatusSelect('present')}>
                    <Text style={[styles.statusOptionText, selectedStatus === 'present' && styles.statusOptionTextActive]}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.statusOption, selectedStatus === 'absent' && styles.absentBtn]} onPress={() => handleStatusSelect('absent')}>
                    <Text style={[styles.statusOptionText, selectedStatus === 'absent' && styles.statusOptionTextActive]}>Absent</Text>
                  </TouchableOpacity>
                </View>
                {selectedStatus === 'absent' && (
                  <View style={styles.substituteSection}>
                    <Text style={styles.substituteLabel}>Substitute Teacher Name (Optional)</Text>
                    <TextInput style={styles.input} value={substituteName} onChangeText={setSubstituteName} />
                  </View>
                )}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15, paddingBottom: 30 },
  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#E8EAF6' },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666', marginBottom: 10 },
  shiftCount: { fontSize: 13, color: '#1A237E', fontWeight: '700', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  teacherTopCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  teacherTopName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  teacherTopDept: { fontSize: 13, color: '#666', marginTop: 3 },
  dateRangeLine: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E8EAF6' },
  dateRangeText: { fontSize: 13, color: '#1A237E', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  sectionCount: { fontSize: 13, color: '#666', fontWeight: '600' },
  deptCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  deptInfo: { flex: 1 },
  deptName: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  chevron: { fontSize: 28, color: '#1A237E', fontWeight: '300' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
  gridScrollView: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', marginTop: 2, textAlign: 'center' },
  deptSemCell: { width: 90, minHeight: 110, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  dataCell: { width: 115, minHeight: 110, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 4 },
  filledCell: { backgroundColor: '#FFF' },
  emptyCell: { backgroundColor: '#FAFAFA' },
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 3 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#1A237E', textAlign: 'center', lineHeight: 13 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', fontWeight: '600' },
  cellRoom: { fontSize: 9, color: '#D32F2F', fontWeight: '600', textAlign: 'center' },
  markBtn: { backgroundColor: '#1A237E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  markBtnText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginTop: 4, maxWidth: 110, alignSelf: 'center' },
  statusText: { color: '#FFF', fontSize: 8, fontWeight: '800', textAlign: 'center', lineHeight: 12 },
  substituteText: { fontSize: 8, color: '#64B5F6', marginTop: 3, fontWeight: '700', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '85%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 2, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  closeIcon: { fontSize: 20, color: '#666', fontWeight: '700' },
  modalBody: { padding: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  statusOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusOption: { width: '48%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#DDD', backgroundColor: '#FFF' },
  presentBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  absentBtn: { backgroundColor: '#F44336', borderColor: '#F44336' },
  statusOptionText: { fontSize: 13, fontWeight: '700', color: '#333' },
  statusOptionTextActive: { color: '#FFF' },
  substituteSection: { backgroundColor: '#FFF3E0', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#FFE0B2' },
  substituteLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 45 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#4CAF50' },
  cancelText: { color: '#333', fontSize: 14, fontWeight: '700' },
  saveText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});