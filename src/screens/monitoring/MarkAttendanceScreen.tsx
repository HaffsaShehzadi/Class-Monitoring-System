import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ Mock Data (SharedData ki jagah)
const ASSIGNED_DUTIES = [
  { id: 1, department: 'IT', shift: '1st Shift' },
  { id: 2, department: 'BSCS', shift: '1st Shift' },
  { id: 3, department: 'Math', shift: '1st Shift' },
  { id: 4, department: 'Physics', shift: '1st Shift' },
  { id: 5, department: 'English', shift: '1st Shift' },
  { id: 6, department: 'IT', shift: '2nd Shift' },
  { id: 7, department: 'BSCS', shift: '2nd Shift' },
];

const CURRENT_USER = {
  name: 'Ahmed Hassan',
  role: 'Monitoring Official',
};

const TIMETABLE_DATA = [
  { id: 1, dept: 'IT', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Programming', code: 'CC-213L', teacher: 'Hassan Raza', room: 'R39', section: '[1-2]' },
  { id: 2, dept: 'IT', semester: '2nd', day: 'Monday', period: 2, time: '09:30 - 10:15', subject: 'English', code: 'GE-222', teacher: 'Hira Afzal', room: 'R38', section: '[1-4]' },
  { id: 3, dept: 'IT', semester: '2nd', day: 'Monday', period: 3, time: '10:30 - 11:15', subject: 'Database', code: 'CC-233L', teacher: 'M. Kamran', room: 'R39', section: '[1-2]' },
  { id: 4, dept: 'IT', semester: '4th', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Web Dev', code: 'CC-311L', teacher: 'M. Ali Waqas', room: 'R60', section: '[1-4]' },
  { id: 5, dept: 'BSCS', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'CS Fundamentals', code: 'CS-101', teacher: 'Ahmad Ali', room: 'R21', section: '[1-3]' },
  { id: 6, dept: 'Math', semester: '2nd', day: 'Monday', period: 1, time: '14:00 - 14:45', subject: 'Calculus', code: 'MATH-201', teacher: 'Ali Khan', room: 'R21', section: '[1-4]' },
  { id: 7, dept: 'Physics', semester: '2nd', day: 'Monday', period: 2, time: '09:30 - 10:15', subject: 'Mechanics', code: 'PHY-101', teacher: 'Dr. Imran', room: 'R22', section: '[1-2]' },
  { id: 8, dept: 'English', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Literature', code: 'ENG-101', teacher: 'Sara Ahmed', room: 'R23', section: '[1-3]' },
  { id: 9, dept: 'English', semester: '4th', day: 'Monday', period: 2, time: '09:30 - 10:15', subject: 'Grammar', code: 'ENG-201', teacher: 'Sara Ahmed', room: 'R23', section: '[1-2]' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];
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
  const [selectedDay] = useState('Monday');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | ''>('');
  const [substituteName, setSubstituteName] = useState('');
  
  const [savedRecords, setSavedRecords] = useState<any>({});

  const filteredDepts = ASSIGNED_DUTIES.filter(d => d.shift === selectedShift);
  const getAttendance = (sem: string, periodId: number) => TIMETABLE_DATA.find(t => t.dept === selectedDept && t.semester === sem && t.day === selectedDay && t.period === periodId);
  const getRecord = (id: number) => savedRecords[id] || null;

  const getStatusColor = (r: any) => {
    if (!r) return '#999';
    if (r.status === 'absent') return '#F44336';
    return '#4CAF50';
  };

  const getStatusDisplay = (r: any) => {
    if (!r) return '';
    if (r.status === 'absent') {
      if (r.substituteName && r.substituteName.trim()) {
        return `Absent (${r.substituteName})`;
      }
      return 'Absent';
    }
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

  const handleSave = () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select Present or Absent');
      return;
    }

    setSavedRecords({ 
      ...savedRecords, 
      [selectedLecture.id]: { 
        status: selectedStatus, 
        substituteName: selectedStatus === 'absent' ? substituteName : '',
        timestamp: new Date().toLocaleString() 
      } 
    });
    
    setShowModal(false);
    Alert.alert('Success', `Attendance marked as ${selectedStatus === 'present' ? 'Present' : 'Absent'}`);
  };

  // ==========================================
  // STEP 1: Select Shift
  // ==========================================
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

        <View style={styles.shiftContainer}>
          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => setSelectedShift('1st Shift')}
          >
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

  // ==========================================
  // STEP 2: Select Department
  // ==========================================
  if (!selectedDept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedShift(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.officialHeader}>
          <View style={styles.officialAvatar}>
            <MaterialCommunityIcons name="account" size={30} color="#1A237E" />
          </View>
          <View style={styles.officialInfo}>
            <Text style={styles.officialName}>{CURRENT_USER.name}</Text>
            <Text style={styles.officialRole}>{CURRENT_USER.role}</Text>
            <Text style={styles.currentDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Departments</Text>
          <Text style={styles.sectionCount}>{filteredDepts.length} Departments</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {filteredDepts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No duties assigned for this shift</Text>
            </View>
          ) : (
            filteredDepts.map(duty => (
              <TouchableOpacity
                key={duty.id}
                style={styles.deptCard}
                onPress={() => setSelectedDept(duty.department)}
              >
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>{duty.department}</Text>
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
  // STEP 3: Timetable Grid
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDept(null)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDept} - Mark Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.dateInfoBar}>
        <Text style={styles.dateInfoText}>
          {selectedDay} • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
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
                  const isAlreadyMarked = !!record;
                  
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[
                        styles.dataCell, 
                        cls ? styles.filledCell : styles.emptyCell,
                        record && { borderLeftWidth: 4, borderLeftColor: getStatusColor(record) }
                      ]} 
                      onPress={() => handleCellPress(cls)} 
                      disabled={!cls || isAlreadyMarked}
                    >
                      {cls ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellTeacher} numberOfLines={1}>{cls.teacher}</Text>
                          <Text style={styles.cellCode}>{cls.code}</Text>
                          <Text style={styles.cellRoom}>{cls.room}</Text>
                          {record ? (
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record) }]}>
                              <Text style={styles.statusText} numberOfLines={2}>{getStatusDisplay(record)}</Text>
                            </View>
                          ) : (
                            <View style={styles.markBtn}>
                              <Text style={styles.markBtnText}>Mark</Text>
                            </View>
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

      {/* Mark Attendance Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedLecture && (
              <ScrollView 
                style={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.label}>Select Status *</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      selectedStatus === 'present' && styles.presentBtn
                    ]} 
                    onPress={() => handleStatusSelect('present')}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      selectedStatus === 'present' && styles.statusOptionTextActive
                    ]}>
                      Present
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      selectedStatus === 'absent' && styles.absentBtn
                    ]} 
                    onPress={() => handleStatusSelect('absent')}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      selectedStatus === 'absent' && styles.statusOptionTextActive
                    ]}>
                      Absent
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedStatus === 'absent' && (
                  <View style={styles.substituteSection}>
                    <Text style={styles.substituteLabel}>Substitute Teacher Name (Optional)</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Enter substitute teacher name if any" 
                      value={substituteName} 
                      onChangeText={setSubstituteName} 
                    />
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.cancelBtn]} 
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.saveBtn]} 
                    onPress={handleSave}
                  >
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
  shiftSubtext: { fontSize: 14, color: '#666', marginBottom: 10 },
  shiftCount: { fontSize: 13, color: '#1A237E', fontWeight: '700', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  
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
  
  deptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  deptBadge: {
    backgroundColor: '#1A237E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  deptBadgeText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
  
  dateInfoBar: {
    backgroundColor: '#E8EAF6',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  dateInfoText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  
  gridScrollView: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', marginTop: 2 },
  
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
  
  markBtn: {
    backgroundColor: '#1A237E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  markBtnText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10, 
    marginTop: 4,
    maxWidth: 110,
  },
  statusText: { 
    color: '#FFF', 
    fontSize: 8, 
    fontWeight: '800', 
    textAlign: 'center',
    lineHeight: 12,
  },
  
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  modal: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    width: '100%', 
    maxWidth: 400, 
    maxHeight: '85%' 
  },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 2, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  modalBody: { padding: 20 },
  
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  
  statusOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusOption: { width: '48%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#DDD', backgroundColor: '#FFF' },
  presentBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  absentBtn: { backgroundColor: '#F44336', borderColor: '#F44336' },
  statusOptionText: { fontSize: 13, fontWeight: '700', color: '#333' },
  statusOptionTextActive: { color: '#FFF' },
  
  substituteSection: { 
    backgroundColor: '#FFF3E0', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  substituteLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  
  input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 45 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#4CAF50' },
  cancelText: { color: '#333', fontSize: 14, fontWeight: '700' },
  saveText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});