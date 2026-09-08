import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { timetableService } from '../../services/timetableService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ✅ YEH NAYA FUNCTION ADD KIYA HAI: 24-hour time ko 12-hour (AM/PM) mein convert karne ke liye
const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr || !timeStr.includes(' - ')) return timeStr || 'N/A';
  const [start, end] = timeStr.split(' - ');
  
  const formatSingle = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return `${formatSingle(start)} - ${formatSingle(end)}`;
};

export default function TimetableManagementScreen({ onBack, onNavigate, params }: any) {
  const [currentStep, setCurrentStep] = useState<'shift' | 'department' | 'timetable'>(params?.returnStep || 'shift');
  const [selectedShift, setSelectedShift] = useState<string | null>(params?.returnShift || null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(params?.returnDept || null);
  const [selectedDay, setSelectedDay] = useState(params?.returnDay || 'Monday');

  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showRenameSemModal, setShowRenameSemModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [renameSemInput, setRenameSemInput] = useState('');

  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [periodStartTime, setPeriodStartTime] = useState('');
  const [periodEndTime, setPeriodEndTime] = useState('');

  const [timetable, setTimetable] = useState<any[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 1500);
  };

  useEffect(() => {
    if (params?.toastMessage) showToast(params.toastMessage);
  }, []);

  // ✅ FIXED: Jab bhi step change ho, uske mutabiq data load karein
  useEffect(() => {
    if (currentStep === 'timetable') {
      fetchConfig();
      fetchTimetable(); 
    } else if (currentStep === 'department') {
      fetchConfig();
    }
  }, [currentStep, selectedShift, selectedDay]);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const config = await timetableService.getConfig();
      setDepartments(config.departments || []);
      setSemesters(config.semesters || []);
      
      const filteredPeriods = (config.periods || []).filter((p: any) => {
        if (p.shift !== selectedShift) return false;
        if (selectedDay === 'Friday') return p.day === 'Friday';
        return p.day === 'Regular' || p.day === null || p.day === undefined;
      });
      setPeriods(filteredPeriods);
    } catch (error: any) {
      console.error("Failed to load config:", error);
      Alert.alert('Error', 'Failed to load timetable configuration');
    } finally {
      setLoadingConfig(false);
    }
  };
  // ✅ FIXED: Timetable data fetch karne ka function
  const fetchTimetable = async () => {
    if (!selectedDepartment || !selectedDay) return;
    
    setLoadingTimetable(true);
    try {
      const data = await timetableService.getAll();
      setTimetable(data.map((item: any) => ({
        id: item.id, 
        dept: item.dept_name, 
        sem: item.semester, 
        day: item.day,
        period: item.period_number, 
        shift: item.shift, // ✅ YEH LINE ADD KAREIN: Shift ko bhi save karein
        teacher: item.teacher_name, 
        code: item.subject_code,
        room: item.room_no, 
        section: '[1-4]'
      })));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timetable');
    } finally {
      setLoadingTimetable(false);
    }
  };

  const getClass = (dept: string, sem: string, periodId: number) => {
    return timetable.find(c => c.dept === dept && c.sem === sem && c.day === selectedDay && c.period === periodId);
  };

  const handleCellPress = (dept: string, sem: string, periodId: number, existingClass: any) => {
    onNavigate('addClassInTimetable', {
      mode: existingClass ? 'edit' : 'add',
      editData: existingClass,
      defaultShift: selectedShift, defaultDept: dept, defaultSem: sem,
      defaultDay: selectedDay, defaultPeriod: periodId,
    });
  };

  const handleEditPeriod = (period: any) => {
    setEditingPeriod(period);
    if (period.time && period.time.includes(' - ')) {
      const [start, end] = period.time.split(' - ');
      setPeriodStartTime(start);
      setPeriodEndTime(end);
    } else {
      setPeriodStartTime('');
      setPeriodEndTime('');
    }
    setShowPeriodModal(true);
  };

  const handleSavePeriod = async () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    try {
      const targetDay = selectedDay === 'Friday' ? 'Friday' : 'Regular';
      await timetableService.updatePeriod(editingPeriod.id, periodStartTime, periodEndTime, selectedShift!, targetDay);
      
      setPeriods(periods.map(p => (p.id === editingPeriod.id) ? { ...p, time: `${periodStartTime} - ${periodEndTime}`, day: targetDay } : p).sort((a, b) => (a.period_number || 0) - (b.period_number || 0)));
      setShowPeriodModal(false);
      setEditingPeriod(null);
      setPeriodStartTime('');
      setPeriodEndTime('');
      showToast('Period time updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update period');
    }
  };

  const handleAddPeriod = () => {
    setEditingPeriod(null);
    setPeriodStartTime('');
    setPeriodEndTime('');
    
    let defaultStartTime = '08:00';
    if (periods.length > 0) {
      const sortedPeriods = [...periods].sort((a, b) => (a.period_number || 0) - (b.period_number || 0));
      const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
      if (lastPeriod && lastPeriod.time && lastPeriod.time.includes(' - ')) {
        defaultStartTime = lastPeriod.time.split(' - ')[1];
      }
    }
    setPeriodStartTime(defaultStartTime);
    setShowPeriodModal(true);
  };

  const handleCreatePeriod = async () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    const maxPeriodNum = periods.length > 0 ? Math.max(...periods.map(p => p.period_number || 0)) : 0;
    const newPeriodNum = maxPeriodNum + 1;
    const targetDay = selectedDay === 'Friday' ? 'Friday' : 'Regular';
    
    try {
      await timetableService.addPeriod(newPeriodNum, periodStartTime, periodEndTime, selectedShift!, targetDay);
      setPeriods([...periods, { id: Date.now(), period_number: newPeriodNum, time: `${periodStartTime} - ${periodEndTime}`, day: targetDay, shift: selectedShift }].sort((a, b) => (a.period_number || 0) - (b.period_number || 0)));
      setShowPeriodModal(false);
      setPeriodStartTime('');
      setPeriodEndTime('');
      showToast('New period added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add period');
    }
  };

  const handleDeletePeriod = async (periodId: number) => {
    const periodToDelete = periods.find(p => p.id === periodId);
    const targetId = periodToDelete ? periodToDelete.id : periodId;
    Alert.alert('Remove Period', 'Are you sure you want to remove this period?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', style: 'destructive', 
        onPress: async () => {
          try {
            await timetableService.deletePeriod(targetId);
            setPeriods(periods.filter(p => p.id !== periodId));
            showToast('Period deleted successfully');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete period');
          }
        }
      }
    ]);
  };

  const handleEditSemester = (semName: string) => {
    setEditingSemester(semName);
    setRenameSemInput(semName);
    setShowRenameSemModal(true);
  };

  const handleSaveRenamedSemester = async () => {
    const newName = renameSemInput.trim();
    if (!newName) {
      Alert.alert('Error', 'Please enter a semester name');
      return;
    }
    if (newName === editingSemester) {
      setShowRenameSemModal(false);
      return;
    }
    
    const otherSemesters = semesters.filter(s => s !== editingSemester);
    if (otherSemesters.includes(newName)) {
      Alert.alert('Error', `Semester "${newName}" already exists!`);
      return;
    }

    try {
      await timetableService.renameSemester(editingSemester!, newName);
      setSemesters(semesters.map(s => s === editingSemester ? newName : s));
      setShowRenameSemModal(false);
      showToast(`Semester renamed to ${newName}`);
    } catch (error: any) {
      console.error("Rename error:", error);
      Alert.alert('Error', error.message || 'Failed to rename semester. Check backend connection.');
    }
  };

  // ✅ FIXED: Step-by-step back navigation
  const handleBackFromTimetable = () => {
    setCurrentStep('department');
  };
  
  const handleBackFromDepartment = () => { 
    setSelectedDepartment(null); 
    setCurrentStep('shift'); 
  };

  // ==========================================
  // STEP 1: Select Shift
  // ==========================================
  if (currentStep === 'shift') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.shiftContainer}>
          <TouchableOpacity style={styles.shiftCard} onPress={() => { setSelectedShift('1st Shift'); setCurrentStep('department'); }}>
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shiftCard} onPress={() => { setSelectedShift('2nd Shift'); setCurrentStep('department'); }}>
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
        {toast && (
          <View style={styles.toastOverlay} pointerEvents="none">
            <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <Text style={styles.toastText}>{toast.msg}</Text>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Select Department
  // ==========================================
  if (currentStep === 'department') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackFromDepartment}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - Departments</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.deptListContent}>
          {loadingConfig ? (
            <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#1A237E" /></View>
          ) : departments.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>No departments found in database</Text></View>
          ) : (
            departments.map(dept => (
              <View key={dept} style={styles.deptCard}>
                <TouchableOpacity style={styles.deptCardInfo} onPress={() => { setSelectedDepartment(dept); setCurrentStep('timetable'); }}>
                  <View style={styles.deptInfoText}><Text style={styles.deptCardName}>{dept} Department</Text></View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
        {toast && (
          <View style={styles.toastOverlay} pointerEvents="none">
            <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <Text style={styles.toastText}>{toast.msg}</Text>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 3: Timetable Grid
  // ==========================================
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackFromTimetable}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{selectedDepartment} - {selectedShift}</Text>
        </View>
        <View style={{ width: 36 }} /> 
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
        <ScrollView showsVerticalScrollIndicator={true} style={styles.verticalScroll}>
          {loadingTimetable || loadingConfig ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={{ marginTop: 10, color: '#666' }}>Loading timetable...</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              <View style={styles.row}>
                <View style={styles.cornerCell}><Text style={styles.cornerText}>Sem / Period</Text></View>
                {periods.map(p => (
                  <TouchableOpacity key={p.id} style={styles.periodHeaderCell} onPress={() => handleEditPeriod(p)} activeOpacity={0.7}>
                    <Text style={styles.periodNum}>P{p.period_number}</Text>
                    {/* ✅ YAHAN CHANGE KIYA HAI: Ab time 1:00 PM - 1:45 PM format mein show hoga */}
                    <Text style={styles.periodTime}>{formatTime12Hour(p.time) || 'Not Set'}</Text>
                    <View style={styles.cellEditIcon}><MaterialCommunityIcons name="pencil" size={12} color="#1A237E" /></View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addPeriodCell} onPress={handleAddPeriod}>
                  <Text style={styles.addPeriodIcon}>+</Text>
                  <Text style={styles.addPeriodText}>Add</Text>
                </TouchableOpacity>
              </View>

              {semesters.map((sem, index) => (
                <View key={`${selectedDepartment}-${sem}-${index}`} style={styles.row}>
                  <TouchableOpacity style={styles.deptSemCell} onPress={() => handleEditSemester(sem)} activeOpacity={0.7}>
                    <Text style={styles.deptText}>{selectedDepartment}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.semText}>{sem}</Text>
                      <MaterialCommunityIcons name="pencil" size={10} color="#1A237E" style={{marginLeft: 4}} />
                    </View>
                  </TouchableOpacity>

                  {periods.map(p => {
                    const cls = getClass(selectedDepartment!, sem, p.period_number);
                    return (
                      <TouchableOpacity key={p.id} style={[styles.dataCell, cls ? styles.filledCell : styles.emptyCell]} onPress={() => handleCellPress(selectedDepartment!, sem, p.period_number, cls)} activeOpacity={0.7}>
                        {cls ? (
                          <View style={styles.cellContent}>
                            <Text style={styles.cellTeacher} numberOfLines={1}>{cls.teacher}</Text>
                            <Text style={styles.cellCode} numberOfLines={1}>{cls.code}</Text>
                            <Text style={styles.cellRoom}>{cls.room}</Text>
                          </View>
                        ) : (
                          <Text style={styles.cellPlusIcon}>+</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  <View style={styles.dataCell} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ScrollView>

      <Modal visible={showRenameSemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rename Semester</Text>
              <TouchableOpacity onPress={() => setShowRenameSemModal(false)}><Text style={styles.modalCloseIcon}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>New Semester Name</Text>
            <TextInput style={styles.periodInput} placeholder="e.g., 1st, 3rd" placeholderTextColor="#999" value={renameSemInput} onChangeText={setRenameSemInput} />
            <TouchableOpacity style={styles.savePeriodBtn} onPress={handleSaveRenamedSemester}>
              <Text style={styles.savePeriodText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPeriodModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPeriod ? 'Edit Period Time' : 'Add New Period'}</Text>
              <TouchableOpacity onPress={() => setShowPeriodModal(false)}><Text style={styles.modalCloseIcon}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput style={styles.periodInput} placeholder="08:30" placeholderTextColor="#999" value={periodStartTime} onChangeText={setPeriodStartTime} />
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput 
              style={styles.periodInput} 
              placeholder="00:00" 
              placeholderTextColor="#999" 
              value={periodEndTime} 
              onChangeText={setPeriodEndTime} 
            />
            {editingPeriod && (
              <TouchableOpacity style={styles.deletePeriodBtn} onPress={() => { handleDeletePeriod(editingPeriod.id); setShowPeriodModal(false); }}>
                <Text style={styles.deletePeriodText}>Delete Period</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.savePeriodBtn} onPress={editingPeriod ? handleSavePeriod : handleCreatePeriod}>
              <Text style={styles.savePeriodText}>{editingPeriod ? 'Save Time' : 'Add Period'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
            <Text style={styles.toastText}>{toast.msg}</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#E8EAF6' },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },
  deptListContent: { padding: 20 },
  deptCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  deptCardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deptInfoText: { flex: 1 },
  deptCardName: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
  daySelectorWrapper: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20, backgroundColor: '#ECEFF1', marginRight: 10, minWidth: 100, alignItems: 'center' },
  dayBtnActive: { backgroundColor: '#1A237E', elevation: 5 },
  dayText: { fontSize: 13, fontWeight: '700', color: '#546E7A' },
  dayTextActive: { color: '#FFF', fontWeight: '800' },
  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF', margin: 15 },
  row: { flexDirection: 'row' },
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  periodHeaderCell: { width: 115, height: 65, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 14, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  cellEditIcon: { position: 'absolute', top: 8, right: 8 },
  addPeriodCell: { width: 80, height: 65, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#90A4AE' },
  addPeriodIcon: { fontSize: 22, color: '#4CAF50', fontWeight: '700' },
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
  cellPlusIcon: { fontSize: 20, color: '#B0BEC5', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalCloseIcon: { fontSize: 20, color: '#1A237E', fontWeight: '700' },
  modalInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  modalInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#DDD' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, marginTop: 10 },
  periodInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#DDD', marginBottom: 10 },
  deletePeriodBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F44336', paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  deletePeriodText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  savePeriodBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  savePeriodText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  toastOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  toast: { paddingHorizontal: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, maxWidth: '80%', backgroundColor: '#FFF' },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});