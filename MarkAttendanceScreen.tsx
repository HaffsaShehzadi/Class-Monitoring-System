import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ASSIGNED_DEPARTMENTS = [
  { id: 1, name: 'IT', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 2, name: 'BSCS', assignedBy: 'Admin', date: '2024-06-01' },
  { id: 3, name: 'Math', assignedBy: 'Admin', date: '2024-06-02' },
];

const TIMETABLE_DATA = [
  { id: 1, dept: 'IT', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Programming', code: 'CC-213L', teacher: 'Hassan Raza', room: 'R39', section: '[1-2]' },
  { id: 2, dept: 'IT', semester: '2nd', day: 'Monday', period: 2, time: '09:30 - 10:15', subject: 'English', code: 'GE-222', teacher: 'Hira Afzal', room: 'R38', section: '[1-4]' },
  { id: 3, dept: 'IT', semester: '2nd', day: 'Monday', period: 3, time: '10:30 - 11:15', subject: 'Database', code: 'CC-233L', teacher: 'M. Kamran', room: 'R39', section: '[1-2]' },
  { id: 4, dept: 'IT', semester: '4th', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Web Dev', code: 'CC-311L', teacher: 'M. Ali Waqas', room: 'R60', section: '[1-4]' },
  { id: 5, dept: 'BSCS', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'CS Fundamentals', code: 'CS-101', teacher: 'Ahmad Ali', room: 'R21', section: '[1-3]' },
  { id: 6, dept: 'Math', semester: '2nd', day: 'Monday', period: 1, time: '08:30 - 09:15', subject: 'Calculus', code: 'MATH-201', teacher: 'Ali Khan', room: 'R21', section: '[1-4]' },
];

const SEMESTERS = ['2nd', '4th', '6th', '8th'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '02:00 - 02:45' },
  { id: 7, time: '03:00 - 03:45' },
];

export default function MarkAttendanceScreen({ onBack }: any) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSem, setSelectedSem] = useState('2nd');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showModal, setShowModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'substitute' | ''>('');
  const [substituteName, setSubstituteName] = useState('');
  const [savedRecords, setSavedRecords] = useState<any>({});

  if (!selectedDept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Assigned Departments</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color="#1A237E" />
            <Text style={styles.infoText}>Select a department to mark attendance</Text>
          </View>

          {ASSIGNED_DEPARTMENTS.map(dept => (
            <TouchableOpacity
              key={dept.id}
              style={styles.deptCard}
              onPress={() => setSelectedDept(dept.name)}
            >
              <View style={styles.deptIcon}>
                <MaterialCommunityIcons name="book-open-variant" size={40} color="#1A237E" />
              </View>
              <View style={styles.deptInfo}>
                <Text style={styles.deptName}>{dept.name} Department</Text>
                <Text style={styles.deptMeta}>Assigned by: {dept.assignedBy}</Text>
                <Text style={styles.deptMeta}>Date: {dept.date}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#1A237E" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const filteredClasses = TIMETABLE_DATA.filter(t => 
    t.dept === selectedDept && 
    t.semester === selectedSem && 
    t.day === selectedDay
  );

  const openModal = (lecture: any) => {
    setSelectedLecture(lecture);
    const record = savedRecords[lecture.id];
    setSelectedStatus(record?.status || '');
    setSubstituteName(record?.substitute || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select a status (Present/Absent/Substitute)');
      return;
    }

    if (selectedStatus === 'substitute' && !substituteName.trim()) {
      Alert.alert('Error', 'Please enter substitute teacher name');
      return;
    }

    setSavedRecords({
      ...savedRecords,
      [selectedLecture.id]: {
        status: selectedStatus,
        substitute: substituteName,
        timestamp: new Date().toLocaleString()
      }
    });

    setShowModal(false);
    Alert.alert('Success', 'Attendance record saved successfully');
  };

  const getRecord = (lectureId: number) => {
    return savedRecords[lectureId] || null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'absent': return 'close-circle';
      case 'substitute': return 'account-switch';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'substitute': return '#2196F3';
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDept(null)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDept} - Mark Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Select Semester</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow}>
          {SEMESTERS.map(sem => (
            <TouchableOpacity
              key={sem}
              style={[styles.selectorBtn, selectedSem === sem && styles.selectorBtnActive]}
              onPress={() => setSelectedSem(sem)}
            >
              <Text style={[styles.selectorText, selectedSem === sem && styles.selectorTextActive]}>
                {sem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Select Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.selectorBtn, selectedDay === day && styles.selectorBtnActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.selectorText, selectedDay === day && styles.selectorTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>
          {selectedDept} - {selectedSem} Semester - {selectedDay}
        </Text>

        {PERIODS.map(period => {
          const periodClass = filteredClasses.find(c => c.period === period.id);
          const record = periodClass ? getRecord(periodClass.id) : null;
          
          return (
            <View key={period.id} style={styles.periodCard}>
              <View style={styles.periodHeader}>
                <View style={styles.periodTime}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#1A237E" />
                  <Text style={styles.periodTimeText}>Period {period.id}: {period.time}</Text>
                </View>
                {record && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                    <MaterialCommunityIcons name={getStatusIcon(record.status)} size={16} color="#FFF" />
                  </View>
                )}
              </View>

              {periodClass ? (
                <>
                  <View style={styles.classBox}>
                    <View style={styles.classInfo}>
                      <Text style={styles.classSubject}>{periodClass.subject}</Text>
                      <Text style={styles.classCode}>{periodClass.code} {periodClass.section}</Text>
                      <Text style={styles.classTeacher}>👨‍ {periodClass.teacher}</Text>
                      <Text style={styles.classRoom}>📍 Room: {periodClass.room}</Text>
                    </View>
                  </View>
                  
                  {record && (
                    <View style={[styles.recordBox, { borderLeftColor: getStatusColor(record.status) }]}>
                      <View style={styles.recordRow}>
                        <MaterialCommunityIcons name={getStatusIcon(record.status)} size={16} color={getStatusColor(record.status)} />
                        <Text style={styles.recordLabel}>Status:</Text>
                        <Text style={[styles.recordValue, { color: getStatusColor(record.status) }]}>
                          {record.status.toUpperCase()}
                        </Text>
                      </View>
                      {record.substitute && (
                        <View style={styles.recordRow}>
                          <MaterialCommunityIcons name="account" size={16} color="#4CAF50" />
                          <Text style={styles.recordLabel}>Substitute:</Text>
                          <Text style={styles.recordValue}>{record.substitute}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.markBtn, record && { backgroundColor: getStatusColor(record.status) }]}
                    onPress={() => openModal(periodClass)}
                  >
                    <MaterialCommunityIcons 
                      name={record ? "pencil" : "clipboard-edit"} 
                      size={20} 
                      color="#FFF" 
                    />
                    <Text style={styles.markBtnText}>
                      {record ? 'Update Record' : 'Mark Attendance'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyPeriod}>
                  <Text style={styles.emptyPeriodText}>No class scheduled</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedLecture && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.lectureInfo}>
                  <Text style={styles.lectureInfoTitle}>{selectedLecture.subject}</Text>
                  <Text style={styles.lectureInfoSub}>{selectedLecture.code} {selectedLecture.section}</Text>
                  <Text style={styles.lectureInfoTeacher}>Original Teacher: {selectedLecture.teacher}</Text>
                  <Text style={styles.lectureInfoClass}>
                    {selectedLecture.room} • {selectedLecture.time}
                  </Text>
                </View>

                <Text style={styles.label}>Select Status *</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity 
                    style={[styles.statusOption, selectedStatus === 'present' && styles.presentBtn]}
                    onPress={() => setSelectedStatus('present')}
                  >
                    <MaterialCommunityIcons name="check-circle" size={24} color={selectedStatus === 'present' ? '#FFF' : '#4CAF50'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'present' && styles.statusOptionTextActive]}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.statusOption, selectedStatus === 'absent' && styles.absentBtn]}
                    onPress={() => setSelectedStatus('absent')}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color={selectedStatus === 'absent' ? '#FFF' : '#F44336'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'absent' && styles.statusOptionTextActive]}>Absent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.statusOption, selectedStatus === 'substitute' && styles.substituteBtn]}
                    onPress={() => setSelectedStatus('substitute')}
                  >
                    <MaterialCommunityIcons name="account-switch" size={24} color={selectedStatus === 'substitute' ? '#FFF' : '#2196F3'} />
                    <Text style={[styles.statusOptionText, selectedStatus === 'substitute' && styles.statusOptionTextActive]}>Substitute</Text>
                  </TouchableOpacity>
                </View>

                {selectedStatus === 'substitute' && (
                  <>
                    <Text style={styles.label}>Substitute Teacher Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Dr. Ahmad Ali"
                      value={substituteName}
                      onChangeText={setSubstituteName}
                    />
                  </>
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
                    <Text style={styles.saveText}>Save Record</Text>
                  </TouchableOpacity>
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
  infoText: { fontSize: 14, color: '#1A237E', fontWeight: '600', marginLeft: 8 },
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
  deptMeta: { fontSize: 12, color: '#666', marginBottom: 2 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 10, marginTop: 15 },
  selectorRow: { marginBottom: 10 },
  selectorBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  selectorBtnActive: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  selectorText: { fontSize: 14, fontWeight: '600', color: '#666' },
  selectorTextActive: { color: '#FFF' },
  periodCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  periodTime: { flexDirection: 'row', alignItems: 'center' },
  periodTimeText: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginLeft: 6 },
  statusBadge: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  classBox: {
    backgroundColor: '#E8EAF6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  classInfo: { flex: 1 },
  classSubject: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  classCode: { fontSize: 13, color: '#666', marginBottom: 2 },
  classTeacher: { fontSize: 13, color: '#333', marginBottom: 2 },
  classRoom: { fontSize: 12, color: '#666' },
  recordBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginLeft: 6, marginRight: 6 },
  recordValue: { fontSize: 12, color: '#333', fontWeight: '600', flex: 1 },
  markBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  markBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyPeriod: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  emptyPeriodText: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
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
  lectureInfo: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  lectureInfoTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  lectureInfoSub: { fontSize: 14, color: '#666', marginBottom: 4 },
  lectureInfoTeacher: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 4 },
  lectureInfoClass: { fontSize: 13, color: '#666' },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10, marginTop: 10 },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusOption: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  presentBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  absentBtn: { backgroundColor: '#F44336', borderColor: '#F44336' },
  substituteBtn: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  statusOptionText: { fontSize: 13, fontWeight: '700', marginTop: 5, color: '#333' },
  statusOptionTextActive: { color: '#FFF' },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 45,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#4CAF50' },
  cancelText: { color: '#333', fontSize: 14, fontWeight: '700' },
  saveText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});