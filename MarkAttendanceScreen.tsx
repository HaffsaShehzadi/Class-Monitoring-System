import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const ROOM_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'R39': { lat: 33.6844, lng: 73.0479 },
  'R38': { lat: 33.6844, lng: 73.0479 },
  'R60': { lat: 33.6844, lng: 73.0479 },
  'R21': { lat: 33.6844, lng: 73.0479 },
  'R58': { lat: 33.6845, lng: 73.0480 },
  'R57': { lat: 33.6845, lng: 73.0480 },
};

const ALLOWED_RADIUS = 100;

// ⚠️ TESTING MODE: Set to true to enable validations
const ENABLE_VALIDATIONS = false;

const ASSIGNED_DEPARTMENTS = [
  { id: 1, name: 'IT', shift: '1st Shift', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 2, name: 'BSCS', shift: '1st Shift', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 3, name: 'Math', shift: '2nd Shift', assignedBy: 'Admin', date: '2024-06-02' },
];

const TIMETABLE_DATA = [
  { id: 1, dept: 'IT', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Programming', code: 'CC-213L', teacher: 'Hassan Raza', room: 'R39', section: '[1-2]' },
  { id: 2, dept: 'IT', semester: '2nd', day: 'Monday', period: 2, time: '09:30 - 10:15', subject: 'English', code: 'GE-222', teacher: 'Hira Afzal', room: 'R38', section: '[1-4]' },
  { id: 3, dept: 'IT', semester: '2nd', day: 'Monday', period: 3, time: '10:30 - 11:15', subject: 'Database', code: 'CC-233L', teacher: 'M. Kamran', room: 'R39', section: '[1-2]' },
  { id: 4, dept: 'IT', semester: '4th', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Web Dev', code: 'CC-311L', teacher: 'M. Ali Waqas', room: 'R60', section: '[1-4]' },
  { id: 5, dept: 'BSCS', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'CS Fundamentals', code: 'CS-101', teacher: 'Ahmad Ali', room: 'R21', section: '[1-3]' },
  { id: 6, dept: 'Math', semester: '2nd', day: 'Monday', period: 1, time: '14:00 - 14:45', subject: 'Calculus', code: 'MATH-201', teacher: 'Ali Khan', room: 'R21', section: '[1-4]' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '14:00 - 14:45' },
  { id: 7, time: '15:00 - 15:45' },
];

export default function MarkAttendanceScreen({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showModal, setShowModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'substitute' | ''>('');
  const [substituteName, setSubstituteName] = useState('');
  const [substituteDescription, setSubstituteDescription] = useState('');
  const [savedRecords, setSavedRecords] = useState<any>({});
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const getCurrentLocation = async () => {
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const isWithinLectureTime = (timeRange: string): boolean => {
    const now = new Date();
    const [startStr, endStr] = timeRange.split(' - ');
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const current = now.getHours() * 60 + now.getMinutes();
    return current >= parseTime(startStr) && current <= parseTime(endStr);
  };

  const validateLocation = async (roomNumber: string): Promise<boolean> => {
    if (!locationPermission) {
      Alert.alert('❌ Location Error', 'Please enable location to mark attendance');
      return false;
    }
    try {
      const loc = await getCurrentLocation();
      const roomCoords = ROOM_COORDINATES[roomNumber];
      if (!roomCoords) return false;
      const distance = calculateDistance(loc.lat, loc.lng, roomCoords.lat, roomCoords.lng);
      if (distance > ALLOWED_RADIUS) {
        Alert.alert('❌ Invalid Location', `You are ${Math.round(distance)}m away from ${roomNumber}`);
        return false;
      }
      return true;
    } catch {
      Alert.alert('❌ Location Error', 'Unable to get location');
      return false;
    }
  };

  const filteredDepts = ASSIGNED_DEPARTMENTS.filter(d => d.shift === selectedShift);
  const getAttendance = (sem: string, periodId: number) => TIMETABLE_DATA.find(t => t.dept === selectedDept && t.semester === sem && t.day === selectedDay && t.period === periodId);
  const getRecord = (id: number) => savedRecords[id] || null;
  const getStatusColor = (r: any) => r?.status === 'absent' ? '#F44336' : r?.status === 'substitute' ? '#2196F3' : r ? '#4CAF50' : '#999';
  const getStatusDisplay = (r: any) => r?.status === 'absent' ? 'A' : r?.status === 'substitute' ? 'S' : r ? 'P' : null;

  const handleCellPress = async (lecture: any) => {
    if (!lecture) return;

    // ⚠️ VALIDATIONS - Sirf tab chalegi jab ENABLE_VALIDATIONS = true ho
    if (ENABLE_VALIDATIONS) {
      if (!isWithinLectureTime(lecture.time)) {
        Alert.alert('⏰ Time Error', `Mark attendance only during: ${lecture.time}`);
        return;
      }
      if (!(await validateLocation(lecture.room))) return;
    }

    setSelectedLecture(lecture);
    const r = getRecord(lecture.id);
    setSelectedStatus(r?.status || '');
    setSubstituteName(r?.substituteName || '');
    setSubstituteDescription(r?.substituteDescription || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedStatus) return Alert.alert('⚠️ Error', 'Select a status');
    if (selectedStatus === 'substitute' && !substituteName.trim()) return Alert.alert('⚠️ Error', 'Enter substitute name');
    setSavedRecords({ 
      ...savedRecords, 
      [selectedLecture.id]: { 
        status: selectedStatus, 
        substituteName, 
        substituteDescription, 
        timestamp: new Date().toLocaleString() 
      } 
    });
    setShowModal(false);
    Alert.alert('✅ Success', 'Attendance saved');
  };

  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('1st Shift')}>
            <MaterialCommunityIcons name="weather-sunny" size={40} color="#FF9800" />
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('2nd Shift')}>
            <MaterialCommunityIcons name="weather-night" size={40} color="#3F51B5" />
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!selectedDept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedShift(null)}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Departments</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {filteredDepts.map(dept => (
            <TouchableOpacity key={dept.id} style={styles.deptCard} onPress={() => setSelectedDept(dept.name)}>
              <View style={styles.deptIcon}><MaterialCommunityIcons name="book-open-variant" size={40} color="#1A237E" /></View>
              <View style={styles.deptInfo}>
                <Text style={styles.deptName}>{dept.name} Department</Text>
                <Text style={styles.deptMeta}>Assigned by: {dept.assignedBy}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#1A237E" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDept(null)}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDept} - Mark Attendance</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.daySelectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map(day => (
            <TouchableOpacity key={day} style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]} onPress={() => setSelectedDay(day)}>
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
        <ScrollView showsVerticalScrollIndicator={true}>
          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={styles.cornerCell}><Text style={styles.cornerText}>Sem / Period</Text></View>
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
                  <Text style={styles.deptText}>{selectedDept}</Text>
                  <Text style={styles.semText}>{sem}</Text>
                </View>
                {PERIODS.map(p => {
                  const cls = getAttendance(sem, p.id);
                  const record = cls ? getRecord(cls.id) : null;
                  return (
                    <TouchableOpacity key={p.id} style={[styles.dataCell, cls ? styles.filledCell : styles.emptyCell, record && { borderLeftWidth: 4, borderLeftColor: getStatusColor(record) }]} onPress={() => handleCellPress(cls)} disabled={!cls}>
                      {cls ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellTeacher} numberOfLines={1}>{cls.teacher}</Text>
                          <Text style={styles.cellCode}>{cls.code}</Text>
                          <Text style={styles.cellRoom}>{cls.room}</Text>
                          {record ? <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record) }]}><Text style={styles.statusText}>{getStatusDisplay(record)}</Text></View> : <MaterialCommunityIcons name="clipboard-edit" size={20} color="#1A237E" />}
                        </View>
                      ) : <Text style={styles.emptyText}>No Class</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><MaterialCommunityIcons name="close" size={24} color="#666" /></TouchableOpacity>
            </View>
            {selectedLecture && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.lectureInfo}>
                  <Text style={styles.lectureInfoTitle}>{selectedLecture.subject}</Text>
                  <Text style={styles.lectureInfoSub}>{selectedLecture.code} {selectedLecture.section}</Text>
                  <Text style={styles.lectureInfoTeacher}>Teacher: {selectedLecture.teacher}</Text>
                  <Text style={styles.lectureInfoClass}>📍 {selectedLecture.room} • {selectedLecture.time}</Text>
                </View>
                <Text style={styles.label}>Select Status *</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity style={[styles.statusOption, selectedStatus === 'present' && styles.presentBtn]} onPress={() => setSelectedStatus('present')}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={selectedStatus === 'present' ? '#FFF' : '#4CAF50'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'present' && styles.statusOptionTextActive]}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.statusOption, selectedStatus === 'absent' && styles.absentBtn]} onPress={() => setSelectedStatus('absent')}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={selectedStatus === 'absent' ? '#FFF' : '#F44336'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'absent' && styles.statusOptionTextActive]}>Absent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.statusOption, selectedStatus === 'substitute' && styles.substituteBtn, { width: '100%', marginTop: 10 }]} onPress={() => setSelectedStatus('substitute')}>
                    <MaterialCommunityIcons name="account-switch" size={24} color={selectedStatus === 'substitute' ? '#FFF' : '#2196F3'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'substitute' && styles.statusOptionTextActive]}>Substitute</Text>
                  </TouchableOpacity>
                </View>
                {selectedStatus === 'substitute' && (
                  <>
                    <Text style={styles.label}>Substitute Teacher Name *</Text>
                    <TextInput style={styles.input} placeholder="Enter substitute teacher name" value={substituteName} onChangeText={setSubstituteName} />
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Add description..." value={substituteDescription} onChangeText={setSubstituteDescription} multiline numberOfLines={4} textAlignVertical="top" />
                  </>
                )}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
                </View>
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
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15 },
  shiftCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 30, marginBottom: 15, alignItems: 'center', elevation: 2 },
  shiftTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E', marginTop: 10 },
  shiftSubtext: { fontSize: 14, color: '#666', marginTop: 5 },
  deptCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  deptIcon: { backgroundColor: '#E8EAF6', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  deptInfo: { flex: 1 },
  deptName: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  deptMeta: { fontSize: 12, color: '#666' },
  daySelectorWrapper: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20, backgroundColor: '#ECEFF1', marginRight: 10, minWidth: 100, alignItems: 'center' },
  dayBtnActive: { backgroundColor: '#1A237E' },
  dayText: { fontSize: 13, fontWeight: '700', color: '#546E7A' },
  dayTextActive: { color: '#FFF' },
  gridScrollView: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', marginTop: 2 },
  deptSemCell: { width: 90, minHeight: 90, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  dataCell: { width: 115, minHeight: 90, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 4 },
  filledCell: { backgroundColor: '#FFF' },
  emptyCell: { backgroundColor: '#FAFAFA' },
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#1A237E', marginBottom: 2, textAlign: 'center' },
  cellCode: { fontSize: 9, color: '#546E7A', marginBottom: 2, textAlign: 'center' },
  cellRoom: { fontSize: 9, color: '#D32F2F', fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 2 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  emptyText: { fontSize: 10, color: '#B0BEC5', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', maxHeight: '85%' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 2, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  modalBody: { padding: 20 },
  lectureInfo: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 20 },
  lectureInfoTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  lectureInfoSub: { fontSize: 14, color: '#666', marginBottom: 4 },
  lectureInfoTeacher: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 4 },
  lectureInfoClass: { fontSize: 13, color: '#666' },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10, marginTop: 10 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  statusOption: { width: '48%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#DDD', backgroundColor: '#FFF', marginBottom: 10 },
  presentBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  absentBtn: { backgroundColor: '#F44336', borderColor: '#F44336' },
  substituteBtn: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  statusOptionText: { fontSize: 13, fontWeight: '700', marginTop: 5, color: '#333' },
  statusOptionTextActive: { color: '#FFF' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 45, marginBottom: 10 },
  textArea: { minHeight: 80 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#4CAF50' },
  cancelText: { color: '#333', fontSize: 14, fontWeight: '700' },
  saveText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});