import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Animated, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { timetableService } from '../../services/timetableService';
import { sessionService, AcademicSession } from '../../services/sessionService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ✅ Convert 24-hour (13:00) to 12-hour (1:00 PM) for Display
const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr || !timeStr.includes(' - ')) return timeStr || 'N/A';
  const [start, end] = timeStr.split(' - ');
  
  const formatSingle = (t: string) => {
    if (!t) return 'N/A';
    const parts = t.trim().split(':');
    if (parts.length < 2) return t;
    
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    if (isNaN(hours)) return t;
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };
  return `${formatSingle(start)} - ${formatSingle(end)}`;
};

// ✅ Convert 12-hour input (1:00 PM) to 24-hour (13:00) for Backend
const convertTo24Hour = (time12: string): string => {
  if (!time12) return '00:00';
  const clean = time12.trim().toUpperCase();
  const hasPM = clean.includes('PM');
  const hasAM = clean.includes('AM');
  
  const timePart = clean.replace('AM', '').replace('PM', '').trim();
  const parts = timePart.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  
  if (isNaN(hours)) return '00:00';
  
  if (hasPM && hours < 12) hours += 12;
  if (hasAM && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// ✅ Convert 24-hour (13:00) to 12-hour (1:00 PM) for Input Field
const convertTo12Hour = (time24: string): string => {
  if (!time24) return '00:00';
  const parts = time24.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  
  return `${h12}:${minutes} ${ampm}`;
};

export default function TimetableManagementScreen({ onBack, onNavigate, params }: any) {
  const [currentStep, setCurrentStep] = useState<'session' | 'shift' | 'department' | 'timetable'>(params?.returnStep || 'session');
  const [selectedSession, setSelectedSession] = useState<AcademicSession | null>(params?.returnSession || null);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionMakeActive, setNewSessionMakeActive] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

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

  useEffect(() => {
    if (currentStep === 'session') {
      fetchSessions();
    } else if (currentStep === 'timetable') {
      fetchConfig();
      fetchTimetable(); 
    } else if (currentStep === 'department') {
      fetchConfig();
    }
  }, [currentStep, selectedShift, selectedDay, params?.refreshKey]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await sessionService.getAll();
      setSessions(data);
      if (selectedSession) {
        const fresh = data.find(s => s.id === selectedSession.id);
        if (fresh) setSelectedSession(fresh);
      }
    } catch (error: any) {
      console.error("Failed to load sessions:", error);
      Alert.alert('Error', error.message || 'Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCreateSession = async () => {
    const trimmed = newSessionName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a session name (e.g. Fall 2026, Spring 2027)');
      return;
    }
    setCreatingSession(true);
    try {
      await sessionService.create(trimmed, newSessionMakeActive);
      setShowCreateSessionModal(false);
      setNewSessionName('');
      setNewSessionMakeActive(false);
      showToast(`Session "${trimmed}" created successfully!`);
      await fetchSessions();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSetActiveSession = async (session: AcademicSession) => {
    Alert.alert(
      'Activate Session',
      `Set "${session.session_name}" as the ACTIVE session for the college?\n\nMonitoring officials and teachers will immediately see this session's timetable.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Active',
          onPress: async () => {
            try {
              await sessionService.setActive(session.id);
              showToast(`"${session.session_name}" is now Active`);
              await fetchSessions();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to activate session');
            }
          }
        }
      ]
    );
  };

  const handleDeleteSession = async (session: AcademicSession) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete session "${session.session_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionService.delete(session.id);
              showToast('Session deleted');
              await fetchSessions();
            } catch (error: any) {
              Alert.alert('Cannot Delete', error.message || 'Failed to delete session');
            }
          }
        }
      ]
    );
  };

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

  const fetchTimetable = async () => {
    if (!selectedDepartment || !selectedDay) return;
    setLoadingTimetable(true);
    try {
      const data = await timetableService.getAll(selectedSession?.id);
      setTimetable(data.map((item: any) => ({
        id: item.id, 
        dept: item.dept_name, 
        sem: item.semester, 
        day: item.day,
        period: item.period_number, 
        shift: item.shift,
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
    return timetable.find(c => c.dept === dept && c.sem === sem && c.day === selectedDay && c.period === periodId && c.shift === selectedShift);
  };

  const handleCellPress = (dept: string, sem: string, periodId: number, existingClass: any) => {
    onNavigate('addClassInTimetable', {
      mode: existingClass ? 'edit' : 'add',
      editData: existingClass,
      selectedSession: selectedSession,
      defaultShift: selectedShift, 
      defaultDept: dept, 
      defaultSem: sem,
      defaultDay: selectedDay, 
      defaultPeriod: periodId,
    });
  };

  // ✅ FIXED: Edit karte waqt 24-hour ko 12-hour mein convert kar ke dikhayein
  const handleEditPeriod = (period: any) => {
    setEditingPeriod(period);
    if (period.time && period.time.includes(' - ')) {
    const [start, end] = period.time.split(' - ');
       // ✅ Direct backend se jo 12-hour format aa raha hai, wahi input mein dalein
       // Koi conversion nahi karni!
       setPeriodStartTime(start.trim());
       setPeriodEndTime(end.trim());
      } else {
       setPeriodStartTime('');
       setPeriodEndTime('');
      }
    setShowPeriodModal(true);
  };

  // ✅ FIXED: Save karte waqt 12-hour ko 24-hour mein convert kar ke backend ko bhejein
  const handleSavePeriod = async () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    
    const start24 = convertTo24Hour(periodStartTime);
    const end24 = convertTo24Hour(periodEndTime);

    try {
      const targetDay = selectedDay === 'Friday' ? 'Friday' : 'Regular';
      await timetableService.updatePeriod(editingPeriod.id, start24, end24, selectedShift!, targetDay);
      
      const displayStart = convertTo12Hour(start24);
      const displayEnd = convertTo12Hour(end24);
      
      setPeriods(periods.map(p => (p.id === editingPeriod.id) ? { ...p, time: `${displayStart} - ${displayEnd}`, day: targetDay } : p).sort((a, b) => (a.period_number || 0) - (b.period_number || 0)));
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
    
    let defaultStartTime = '08:00 AM';
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

  // ✅ FIXED: Create karte waqt bhi 12-hour ko 24-hour mein convert kar ke bhejein
  const handleCreatePeriod = async () => {
    if (!periodStartTime.trim() || !periodEndTime.trim()) {
      Alert.alert('Error', 'Please fill both start and end time');
      return;
    }
    
    const start24 = convertTo24Hour(periodStartTime);
    const end24 = convertTo24Hour(periodEndTime);

    const maxPeriodNum = periods.length > 0 ? Math.max(...periods.map(p => p.period_number || 0)) : 0;
    const newPeriodNum = maxPeriodNum + 1;
    const targetDay = selectedDay === 'Friday' ? 'Friday' : 'Regular';
    
    try {
      await timetableService.addPeriod(newPeriodNum, start24, end24, selectedShift!, targetDay);
      
      const displayStart = convertTo12Hour(start24);
      const displayEnd = convertTo12Hour(end24);
      
      setPeriods([...periods, { id: Date.now(), period_number: newPeriodNum, time: `${displayStart} - ${displayEnd}`, day: targetDay, shift: selectedShift }].sort((a, b) => (a.period_number || 0) - (b.period_number || 0)));
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

  const handleBackFromTimetable = () => {
    setCurrentStep('department');
  };
  
  const handleBackFromDepartment = () => { 
    setSelectedDepartment(null); 
    setCurrentStep('shift'); 
  };

  const handleBackFromShift = () => {
    setSelectedShift(null);
    setCurrentStep('session');
  };

  if (currentStep === 'session') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Academic Sessions</Text>
          <TouchableOpacity 
            style={styles.addSessionBtn} 
            onPress={() => setShowCreateSessionModal(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addSessionBtnText}>New Session</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.sessionListContent}>
          {loadingSessions ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={{ marginTop: 10, color: '#666' }}>Loading sessions...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={54} color="#9E9E9E" />
              <Text style={styles.emptyText}>No academic sessions found.</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionCard, session.is_active ? styles.sessionCardActive : null]}
                onPress={() => {
                  setSelectedSession(session);
                  setCurrentStep('shift');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.sessionCardHeader}>
                  <View style={[styles.sessionIconBox, session.is_active ? styles.sessionIconBoxActive : null]}>
                    <MaterialCommunityIcons 
                      name="calendar-clock" 
                      size={24} 
                      color={session.is_active ? "#2E7D32" : "#1A237E"} 
                    />
                  </View>
                  <View style={styles.sessionCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <Text style={styles.sessionCardTitle}>{session.session_name}</Text>
                      {!!session.is_active && (
                        <View style={styles.activeBadge}>
                          <MaterialCommunityIcons name="check-circle" size={13} color="#2E7D32" />
                          <Text style={styles.activeBadgeText}>Live Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sessionCardSubtitle}>
                      {session.classes_count || 0} classes scheduled
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#9E9E9E" />
                </View>

                <View style={styles.sessionCardFooter}>
                  {!session.is_active ? (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSetActiveSession(session);
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={15} color="#2E7D32" />
                      <Text style={styles.activateBtnText}>Set as Active</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 }} />
                      <Text style={styles.activeFooterText}>Currently active for MO & Teachers</Text>
                    </View>
                  )}

                  {!session.is_active && (!session.classes_count || session.classes_count === 0) && (
                    <TouchableOpacity
                      style={styles.deleteSessionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session);
                      }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#D32F2F" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Modal: Create Session */}
        <Modal visible={showCreateSessionModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Academic Session</Text>
                <TouchableOpacity onPress={() => setShowCreateSessionModal(false)}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Session Name *</Text>
              <TextInput
                style={styles.sessionInput}
                placeholder="e.g. Fall 2026, Spring 2027"
                placeholderTextColor="#999"
                value={newSessionName}
                onChangeText={setNewSessionName}
                autoFocus
              />

              <TouchableOpacity 
                style={styles.modalCheckboxRow} 
                onPress={() => setNewSessionMakeActive(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxBox, newSessionMakeActive && styles.checkboxBoxChecked]}>
                  {newSessionMakeActive && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Set as Active Session immediately</Text>
              </TouchableOpacity>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setShowCreateSessionModal(false)}
                  disabled={creatingSession}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalSubmitBtn} 
                  onPress={handleCreateSession}
                  disabled={creatingSession}
                >
                  {creatingSession ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Create Session</Text>
                  )}
                </TouchableOpacity>
              </View>
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

  if (currentStep === 'shift') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackFromShift}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedSession?.session_name || 'Select Shift'}</Text>
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

  if (currentStep === 'department') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackFromDepartment}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedSession?.session_name ? `${selectedSession.session_name} • ` : ''}{selectedShift}</Text>
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackFromTimetable}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{selectedDepartment} - {selectedShift}</Text>
          {selectedSession?.session_name ? (
            <Text style={{ fontSize: 12, color: '#546E7A', fontWeight: '600', marginTop: 2 }}>{selectedSession.session_name}</Text>
          ) : null}
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
                    <Text style={styles.periodTime}>{p.time || 'Not Set'}</Text>
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
                  <View style={styles.addPeriodPlaceholder} />
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
            
            {/* ✅ Placeholders "00:00" aur labels clean kar diye gaye hain */}
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput style={styles.periodInput} placeholder="00:00" placeholderTextColor="#999" value={periodStartTime} onChangeText={setPeriodStartTime} />
            
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
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: Platform.OS === 'web' ? 16 : 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 2, 
    borderBottomColor: '#1A237E' 
  },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  addSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A237E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addSessionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  sessionListContent: {
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  sessionInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#C5CAE9',
    color: '#1A237E',
    marginTop: 6,
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  sessionCardActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#FAFFFA',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionIconBoxActive: {
    backgroundColor: '#E8F5E9',
  },
  sessionCardInfo: { flex: 1 },
  sessionCardTitle: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  sessionCardSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  sessionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 4,
  },
  activateBtnText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  activeFooterText: { fontSize: 12, fontWeight: '600', color: '#4CAF50' },
  deleteSessionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  modalCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 5,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#1A237E',
  },
  checkboxLabel: { fontSize: 14, color: '#333', fontWeight: '600' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: { color: '#546E7A', fontSize: 14, fontWeight: '700' },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#1A237E',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  shiftContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    gap: 20,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  shiftCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#E8EAF6' },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },
  deptListContent: { 
    padding: 20,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
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
  cornerCell: { width: 90, height: 60, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  periodHeaderCell: { width: 118, height: 60, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13.5, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9.5, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  cellEditIcon: { position: 'absolute', top: 6, right: 6 },
  addPeriodCell: { width: 80, height: 60, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#90A4AE' },
  addPeriodIcon: { fontSize: 22, color: '#4CAF50', fontWeight: '700' },
  addPeriodText: { fontSize: 11, color: '#4CAF50', fontWeight: '700', marginTop: 2 },
  addPeriodPlaceholder: { width: 80, minHeight: 105, borderBottomWidth: 1, borderColor: '#90A4AE', backgroundColor: '#FAFAFA' },
  deptSemCell: { width: 90, minHeight: 105, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  dataCell: { width: 118, minHeight: 105, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 4 },
  filledCell: { backgroundColor: '#FFF' },
  emptyCell: { backgroundColor: '#FAFAFA' },
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 2 },
  cellTeacher: { fontSize: 12.5, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 11, color: '#546E7A', fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  cellRoom: { fontSize: 11, color: '#D32F2F', fontWeight: '700', textAlign: 'center' },
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