import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableManagementScreen({ onBack, onNavigate }: any) {
  // Step Management: 'shift' -> 'department' -> 'timetable'
  const [currentStep, setCurrentStep] = useState<'shift' | 'department' | 'timetable'>('shift');
  
  // Shift & Department
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departments, setDepartments] = useState(['IT', 'BSCS', 'Math', 'Physics']);
  
  // Day & Semesters
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [semesters, setSemesters] = useState(['2nd', '4th', '6th', '8th']);
  
  // Periods (now editable)
  const [periods, setPeriods] = useState([
    { id: 1, time: '08:30 - 09:15' },
    { id: 2, time: '09:30 - 10:15' },
    { id: 3, time: '10:30 - 11:15' },
    { id: 4, time: '11:30 - 12:15' },
    { id: 5, time: '12:30 - 01:15' },
    { id: 6, time: '02:00 - 02:45' },
    { id: 7, time: '03:00 - 03:45' },
  ]);
  
  // Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newSemName, setNewSemName] = useState('');
  const [periodStartTime, setPeriodStartTime] = useState('');
  const [periodEndTime, setPeriodEndTime] = useState('');
  
  // Timetable Data
  const [timetable, setTimetable] = useState<any[]>([
    { id: 1, dept: 'IT', sem: '2nd', day: 'Monday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', room: 'R58', section: '[1-4]' },
    { id: 2, dept: 'IT', sem: '2nd', day: 'Monday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', room: 'R58', section: '[1-2]' },
    { id: 3, dept: 'IT', sem: '4th', day: 'Monday', period: 1, teacher: 'Hasan Raza', code: 'CC-213L', room: 'R59', section: '[1-2]' },
    { id: 4, dept: 'BSCS', sem: '2nd', day: 'Monday', period: 1, teacher: 'Asif Iqbal', code: 'GISL-101', room: 'R57', section: '[1-3]' },
  ]);

  const getClass = (dept: string, sem: string, periodId: number) => {
    return timetable.find(c => c.dept === dept && c.sem === sem && c.day === selectedDay && c.period === periodId);
  };

  const handleCellPress = (dept: string, sem: string, periodId: number, existingClass: any) => {
    if (existingClass) {
      onNavigate('addEditClass', { mode: 'edit', editData: existingClass });
    } else {
      onNavigate('addEditClass', { 
        mode: 'add', 
        defaultDept: dept, 
        defaultSem: sem, 
        defaultDay: selectedDay, 
        defaultPeriod: periodId 
      });
    }
  };

  // Helper: Sort semesters in ascending order
  const sortSemesters = (sems: string[]) => {
    return [...sems].sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });
  };

  // --- Department Actions ---
  const handleAddDepartment = () => {
    if (newDeptName.trim()) {
      const deptUpper = newDeptName.trim().toUpperCase();
      if (!departments.includes(deptUpper)) {
        setDepartments([...departments, deptUpper]);
        setNewDeptName('');
        setShowDeptModal(false);
      } else {
        Alert.alert('Already Exists', 'This department already exists!');
      }
    }
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    Alert.alert(
      'Remove Department',
      `Are you sure you want to remove ${deptToRemove}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => setDepartments(departments.filter(d => d !== deptToRemove)) 
        }
      ]
    );
  };

  // --- Semester Actions ---
  const handleAddSemester = () => {
    if (newSemName.trim()) {
      const semName = newSemName.trim();
      if (!semesters.includes(semName)) {
        const updatedSems = sortSemesters([...semesters, semName]);
        setSemesters(updatedSems);
        setNewSemName('');
        setShowSemModal(false);
      } else {
        Alert.alert('Already Exists', 'This semester already exists!');
      }
    }
  };

  const handleRemoveSemester = (semToRemove: string) => {
    Alert.alert(
      'Remove Semester',
      `Are you sure you want to remove ${semToRemove}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => setSemesters(semesters.filter(s => s !== semToRemove)) 
        }
      ]
    );
  };

  // --- Period Actions ---
  const handleEditPeriod = (period: any) => {
    setEditingPeriod(period);
    const [start, end] = period.time.split(' - ');
    setPeriodStartTime(start);
    setPeriodEndTime(end);
    setShowPeriodModal(true);
  };

  const handleSavePeriod = () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    setPeriods(periods.map(p => 
      p.id === editingPeriod.id 
        ? { ...p, time: `${periodStartTime} - ${periodEndTime}` } 
        : p
    ));
    setShowPeriodModal(false);
    setEditingPeriod(null);
    setPeriodStartTime('');
    setPeriodEndTime('');
  };

  const handleAddPeriod = () => {
    setEditingPeriod(null);
    setPeriodStartTime('');
    setPeriodEndTime('');
    setShowPeriodModal(true);
  };

  const handleCreatePeriod = () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    const newId = periods.length > 0 ? Math.max(...periods.map(p => p.id)) + 1 : 1;
    setPeriods([...periods, { id: newId, time: `${periodStartTime} - ${periodEndTime}` }]);
    setShowPeriodModal(false);
    setPeriodStartTime('');
    setPeriodEndTime('');
  };

  const handleDeletePeriod = (periodId: number) => {
    Alert.alert(
      'Remove Period',
      'Are you sure you want to remove this period?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => setPeriods(periods.filter(p => p.id !== periodId)) 
        }
      ]
    );
  };

  const handleBackFromTimetable = () => setCurrentStep('department');
  const handleBackFromDepartment = () => { setSelectedDepartment(null); setCurrentStep('shift'); };

  // ==========================================
  // STEP 1: Select Shift
  // ==========================================
  if (currentStep === 'shift') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('1st Shift'); setCurrentStep('department'); }}
          >
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('2nd Shift'); setCurrentStep('department'); }}
          >
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Department List
  // ==========================================
  if (currentStep === 'department') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackFromDepartment}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Departments</Text>
          <TouchableOpacity style={styles.addBtnHeader} onPress={() => setShowDeptModal(true)}>
            <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.deptListContent}>
          {departments.map(dept => (
            <View key={dept} style={styles.deptCard}>
              <TouchableOpacity 
                style={styles.deptCardInfo}
                onPress={() => { setSelectedDepartment(dept); setCurrentStep('timetable'); }}
              >
                <View style={styles.deptInfoText}>
                  <Text style={styles.deptCardName}>{dept} Department</Text>
                  <Text style={styles.deptCardSubtext}>Tap to view timetable</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteDeptBtn}
                onPress={() => handleRemoveDepartment(dept)}
              >
                <MaterialCommunityIcons name="delete-outline" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Add Dept Modal - CENTERED */}
        <Modal visible={showDeptModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Department</Text>
                <TouchableOpacity onPress={() => setShowDeptModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalInputRow}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter new department (e.g., SE)"
                  value={newDeptName}
                  onChangeText={setNewDeptName}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddDepartment}>
                  <MaterialCommunityIcons name="check" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 3: Timetable Grid
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackFromTimetable}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{selectedDepartment} - {selectedShift}</Text>
        </View>
        <TouchableOpacity style={styles.addBtnHeader} onPress={() => setShowSemModal(true)}>
          <MaterialCommunityIcons name="book-plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map(day => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
        <ScrollView showsVerticalScrollIndicator={true} style={styles.verticalScroll}>
          <View style={styles.grid}>
            
            {/* Header Row */}
            <View style={styles.row}>
              <View style={styles.cornerCell}>
                <Text style={styles.cornerText}>Sem / Period</Text>
              </View>
              {periods.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={styles.periodHeaderCell}
                  onPress={() => handleEditPeriod(p)}
                >
                  <Text style={styles.periodNum}>P{p.id}</Text>
                  <Text style={styles.periodTime}>{p.time}</Text>
                  <MaterialCommunityIcons name="pencil" size={12} color="#546E7A" style={{ marginTop: 2 }} />
                </TouchableOpacity>
              ))}
              {/* Add Period Button */}
              <TouchableOpacity style={styles.addPeriodCell} onPress={handleAddPeriod}>
                <MaterialCommunityIcons name="plus-circle" size={28} color="#4CAF50" />
                <Text style={styles.addPeriodText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Data Rows */}
            {semesters.map(sem => (
              <View key={`${selectedDepartment}-${sem}`} style={styles.row}>
                <View style={styles.deptSemCell}>
                  <Text style={styles.deptText}>{selectedDepartment}</Text>
                  <Text style={styles.semText}>{sem}</Text>
                </View>
                
                {periods.map(p => {
                  const cls = getClass(selectedDepartment, sem, p.id);
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.dataCell, cls ? styles.filledCell : styles.emptyCell]}
                      onPress={() => handleCellPress(selectedDepartment, sem, p.id, cls)}
                      activeOpacity={0.7}
                    >
                      {cls ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellTeacher} numberOfLines={1}>{cls.teacher}</Text>
                          <Text style={styles.cellCode} numberOfLines={1}>{cls.code} {cls.section}</Text>
                          <Text style={styles.cellRoom}>{cls.room}</Text>
                        </View>
                      ) : (
                        <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#B0BEC5" />
                      )}
                    </TouchableOpacity>
                  );
                })}
                <View style={styles.dataCell} />
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Add Semester Modal - CENTERED */}
      <Modal visible={showSemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Semesters</Text>
              <TouchableOpacity onPress={() => setShowSemModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {semesters.map(sem => (
                <View key={sem} style={styles.listItem}>
                  <Text style={styles.listItemText}>{sem}</Text>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleRemoveSemester(sem)}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new semester (e.g., 1st, 3rd)"
                value={newSemName}
                onChangeText={setNewSemName}
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddSemester}>
                <MaterialCommunityIcons name="check" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit/Add Period Modal - CENTERED */}
      <Modal visible={showPeriodModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPeriod ? 'Edit Period' : 'Add Period'}
              </Text>
              <TouchableOpacity onPress={() => setShowPeriodModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput
              style={styles.periodInput}
              placeholder="e.g., 08:30"
              value={periodStartTime}
              onChangeText={setPeriodStartTime}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput
              style={styles.periodInput}
              placeholder="e.g., 09:15"
              value={periodEndTime}
              onChangeText={setPeriodEndTime}
              placeholderTextColor="#999"
            />
            
            {editingPeriod && (
              <TouchableOpacity 
                style={styles.deletePeriodBtn}
                onPress={() => { handleDeletePeriod(editingPeriod.id); setShowPeriodModal(false); }}
              >
                <MaterialCommunityIcons name="delete" size={18} color="#FFF" />
                <Text style={styles.deletePeriodText}>Delete Period</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.savePeriodBtn}
              onPress={editingPeriod ? handleSavePeriod : handleCreatePeriod}
            >
              <Text style={styles.savePeriodText}>
                {editingPeriod ? 'Save Changes' : 'Add Period'}
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  addBtnHeader: { backgroundColor: '#4CAF50', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  
  // Shift Selection Styles
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
  
  // Department List Styles
  deptListContent: { padding: 20 },
  deptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  deptCardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deptInfoText: { flex: 1 },
  deptCardName: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  deptCardSubtext: { fontSize: 13, color: '#666', marginTop: 2 },
  deleteDeptBtn: { padding: 10 },

  // Grid Styles
  daySelectorWrapper: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20, backgroundColor: '#ECEFF1', marginRight: 10, minWidth: 100, alignItems: 'center' },
  dayBtnActive: { backgroundColor: '#1A237E', shadowColor: '#1A237E', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 },
  dayText: { fontSize: 13, fontWeight: '700', color: '#546E7A' },
  dayTextActive: { color: '#FFF', fontWeight: '800' },
  
  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  
  periodHeaderCell: { width: 115, height: 65, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  
  addPeriodCell: { width: 80, height: 65, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#90A4AE' },
  addPeriodText: { fontSize: 11, color: '#4CAF50', fontWeight: '700', marginTop: 2 },
  
  deptSemCell: { width: 90, minHeight: 75, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  
  dataCell: { width: 115, minHeight: 75, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 4 },
  filledCell: { backgroundColor: '#FFF' },
  emptyCell: { backgroundColor: '#FAFAFA' },
  
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginBottom: 2 },
  cellRoom: { fontSize: 9, color: '#D32F2F', fontWeight: '600', textAlign: 'center' },
  
  // Modal Styles - CENTERED
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalList: { maxHeight: 250, marginBottom: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8 },
  listItemText: { fontSize: 15, fontWeight: '700', color: '#333' },
  deleteBtn: { padding: 5 },
  modalInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  modalInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#DDD' },
  addBtn: { backgroundColor: '#4CAF50', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  
  // Period Modal Styles
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, marginTop: 10 },
  periodInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#DDD', marginBottom: 10 },
  deletePeriodBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F44336', paddingVertical: 12, borderRadius: 10, marginTop: 10, gap: 8 },
  deletePeriodText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  savePeriodBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  savePeriodText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});