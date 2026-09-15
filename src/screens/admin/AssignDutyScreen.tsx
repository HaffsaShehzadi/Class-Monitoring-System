import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { monitoringDutyService } from '../../services/monitoringDutyService';

interface OfficialData {
  id: number;
  name: string;
  status: 'available' | 'assigned';
  assignment?: { departments: string[]; shift: string; date: string; dutyIds: number[] };
}

interface Department {
  id: number;
  name: string;
  dept_name?: string;
}

export default function AssignDutyScreen({ onBack }: any) {
  const [officials, setOfficials] = useState<OfficialData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDuties, setAllDuties] = useState<any[]>([]); // ✅ NEW: Store all duties to check conflicts
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState<'list' | 'form' | 'view'>('list');
  const [activeOfficialId, setActiveOfficialId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [date, setDate] = useState('');
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  const activeOfficial = officials.find(o => o.id === activeOfficialId) || null;

  const getDeptName = (id: number) => {
    const dept = departments.find(d => d.id === id);
    return dept ? (dept.dept_name || dept.name) : 'Unknown';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = await (await import('../../services/ipConfig')).detectBackend();
      const token = await (await import('../../services/tokenStorage')).tokenStorage.getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const deptsRes = await fetch(`${BACKEND_URL}/api/departments/all`, { headers });
      const deptsData = await deptsRes.json();
      setDepartments(deptsData);

      const usersRes = await fetch(`${BACKEND_URL}/api/users/all`, { headers });
      const allUsers = await usersRes.json();
      const mos = allUsers.filter((u: any) => String(u.role).toLowerCase().includes('monitor'));

      // ✅ Fetch all duties to check for conflicts
      const dutiesData = await monitoringDutyService.getAllDuties();
      setAllDuties(dutiesData);

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const formattedOfficials: OfficialData[] = mos.map((mo: any) => {
        const moDuties = dutiesData.filter((d: any) => {
          const dDate = d.duty_date ? String(d.duty_date).split('T')[0] : '';
          return Number(d.official_id) === Number(mo.id) && dDate === today;
        });

        if (moDuties.length > 0) {
          const uniqueDepts = [...new Set(moDuties.map((d: any) => d.dept_name || d.department))];
          const allDutyIds = moDuties.map((d: any) => d.id);
          const uniqueShifts = [...new Set(moDuties.map((d: any) => d.shift))];
          const displayShift = uniqueShifts.length > 1 ? 'Both' : uniqueShifts[0];
          
          return {
            id: mo.id,
            name: mo.name,
            status: 'assigned' as const,
            assignment: {
              departments: uniqueDepts,
              shift: displayShift, 
              date: moDuties[0].duty_date,
              dutyIds: allDutyIds
            }
          };
        } else {
          return { id: mo.id, name: mo.name, status: 'available' as const };
        }
      });

      setOfficials(formattedOfficials);
    } catch (error: any) {
      console.error("❌ FETCH DATA ERROR:", error);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 1500);
  };

  const toggleDepartment = (deptId: number) => {
    setSelectedDeptIds(prev => prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]);
  };

  const openAssign = (official: OfficialData) => {
    setActiveOfficialId(official.id);
    setSelectedDeptIds([]);
    setSelectedShift('');
    const today = new Date();
    setDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    setIsEditing(false);
    setScreen('form');
  };

  const openView = (official: OfficialData) => {
    setActiveOfficialId(official.id);
    setScreen('view');
  };

  const openEdit = () => {
    if (!activeOfficial?.assignment) return;
    
    const currentDeptIds = activeOfficial.assignment.departments.map(deptName => {
      const found = departments.find(d => (d.dept_name || d.name) === deptName);
      return found ? found.id : 0;
    }).filter(id => id !== 0);

    setSelectedDeptIds(currentDeptIds);
    setSelectedShift(activeOfficial.assignment.shift);
    const rawDate = activeOfficial.assignment.date;
    setDate(rawDate && rawDate.includes('T') ? rawDate.split('T')[0] : rawDate);
    setIsEditing(true);
    setScreen('form');
  };

  const handleSave = async () => {
    if (selectedDeptIds.length === 0 || !selectedShift || !date) {
      Alert.alert('Error', 'Please select at least one department, shift, and date.');
      return;
    }
    
    setSaving(true);
    try {
      if (activeOfficialId) {
        const existingDuties = officials.find(o => o.id === activeOfficialId)?.assignment?.dutyIds || [];
        for (const dutyId of existingDuties) {
          await monitoringDutyService.removeDuty(dutyId);
        }

        if (selectedShift === 'Both') {
          await monitoringDutyService.assignDuty(activeOfficialId, selectedDeptIds, '1st Shift', date);
          await monitoringDutyService.assignDuty(activeOfficialId, selectedDeptIds, '2nd Shift', date);
        } else {
          await monitoringDutyService.assignDuty(activeOfficialId, selectedDeptIds, selectedShift, date);
        }
        
        await fetchData();
        setScreen('list');
        showToast(isEditing ? 'Duty updated successfully' : 'Duty assigned successfully');
      }
    } catch (error: any) {
      console.error("❌ SAVE DUTY ERROR:", error);
      Alert.alert('Error', error.message || 'Failed to save duty');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDuty = async (officialName: string, dutyIds: number[]) => {
    Alert.alert('Remove Assignment', `Are you sure you want to remove all duties for ${officialName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: async () => {
          try {
            for (const dutyId of dutyIds) {
              await monitoringDutyService.removeDuty(dutyId);
            }
            await fetchData();
            setScreen('list');
            showToast('All duties removed successfully');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove duty');
          }
        }
      }
    ]);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) return cleanDate;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderToast = () => toast && (
    <View style={styles.toastOverlay} pointerEvents="none">
      <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
        <Text style={styles.toastText}>{toast.msg}</Text>
      </Animated.View>
    </View>
  );

  // ✅ NEW LOGIC: Filter departments based on selected Date and Shift
  const getAvailableDepartments = () => {
    if (!selectedShift || !date) return departments;

    // Find duties that conflict with the selected shift on the selected date
    const conflictingDuties = allDuties.filter((d: any) => {
      const dDate = d.duty_date ? String(d.duty_date).split('T')[0] : '';
      if (dDate !== date) return false;

      const deptName = d.dept_name || d.department;
      
      // If duty is 'Both', it conflicts with everything
      if (d.shift === 'Both') return true;
      
      // If duty is '1st Shift', it conflicts with '1st Shift' and 'Both'
      if (d.shift === '1st Shift' && (selectedShift === '1st Shift' || selectedShift === 'Both')) return true;
      
      // If duty is '2nd Shift', it conflicts with '2nd Shift' and 'Both'
      if (d.shift === '2nd Shift' && (selectedShift === '2nd Shift' || selectedShift === 'Both')) return true;

      return false;
    });

    const assignedDeptNames = new Set(conflictingDuties.map((d: any) => d.dept_name || d.department));

    // If editing, allow the departments currently assigned to THIS official to remain selectable
    let currentOfficialDepts: string[] = [];
    if (isEditing && activeOfficial?.assignment) {
      currentOfficialDepts = activeOfficial.assignment.departments;
    }

    return departments.filter(dept => {
      const deptName = dept.dept_name || dept.name;
      // Keep if NOT assigned to someone else, OR if it's currently assigned to this official (for editing)
      return !assignedDeptNames.has(deptName) || currentOfficialDepts.includes(deptName);
    });
  };

  // ==================== FORM SCREEN ====================
  if (screen === 'form' && activeOfficial) {
    const availableDepts = getAvailableDepartments();

    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen(isEditing ? 'view' : 'list')}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Duty' : 'Assign Duty'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <View style={styles.topCard}>
              <Text style={styles.topCardName}>{activeOfficial.name}</Text>
              <Text style={styles.topCardSub}>Monitoring Official</Text>
            </View>

            <View style={styles.formCard}>
              {/* 1. SHIFT PEHLE */}
              <Text style={styles.label}>Shift *</Text>
              <View style={styles.shiftContainer}>
                {['1st Shift', '2nd Shift', 'Both'].map(shift => (
                  <TouchableOpacity 
                    key={shift} 
                    style={[styles.shiftBtn, selectedShift === shift && styles.shiftBtnActive]} 
                    onPress={() => setSelectedShift(shift)}
                  >
                    <Text style={[styles.shiftText, selectedShift === shift && styles.shiftTextActive]}>{shift}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. DATE */}
              <Text style={styles.label}>Date *</Text>
              <TextInput 
                style={styles.dateInput} 
                placeholder="YYYY-MM-DD" 
                value={date} 
                onChangeText={setDate} 
                placeholderTextColor="#999" 
              />

              {/* 3. DEPARTMENTS BAAD MEIN (Filtered) */}
              <Text style={styles.label}>Departments *</Text>
              <TouchableOpacity 
                style={[styles.selectBtn, (!selectedShift || !date) && { opacity: 0.5 }]} 
                onPress={() => {
                  if (!selectedShift || !date) {
                    Alert.alert('Select Shift & Date First', 'Please select a shift and date to see available departments.');
                    return;
                  }
                  setDeptModalVisible(true);
                }}
              >
                <Text style={[styles.selectBtnText, selectedDeptIds.length === 0 && styles.placeholderText]}>
                  {selectedDeptIds.length ? `${selectedDeptIds.length} department(s) selected` : 'Select Departments'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              {selectedDeptIds.length > 0 && (
                <View style={styles.chipRow}>
                  {selectedDeptIds.map((id) => (
                    <View key={id} style={styles.chip}>
                      <Text style={styles.chipText}>{getDeptName(id)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 4. SAVE BUTTON */}
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.confirmText}>{saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Assign Duty')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={deptModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Departments</Text>
                <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {availableDepts.length === 0 ? (
                  <Text style={styles.emptyModalText}>All departments are already assigned for this shift.</Text>
                ) : (
                  availableDepts.map(dept => {
                    const deptId = dept.id;
                    const deptName = dept.dept_name || dept.name;
                    const sel = selectedDeptIds.includes(deptId);
                    return (
                      <TouchableOpacity key={deptId} style={[styles.modalItem, sel && styles.modalItemActive]} onPress={() => toggleDepartment(deptId)}>
                        <Text style={[styles.modalItemText, sel && styles.modalItemTextActive]}>{deptName}</Text>
                        {sel && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
              <TouchableOpacity style={styles.doneBtn} onPress={() => setDeptModalVisible(false)}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {renderToast()}
      </SafeAreaView>
    );
  }

  // ==================== VIEW SCREEN ====================
  if (screen === 'view' && activeOfficial && activeOfficial.assignment) {
    const a = activeOfficial.assignment;
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('list')}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Duty Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.topCard}>
            <Text style={styles.topCardName}>{activeOfficial.name}</Text>
            <Text style={styles.topCardSub}>Monitoring Official</Text>
            <View style={styles.topCardDivider} />
            <Text style={styles.topCardDate}>{formatDisplayDate(a.date)}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.detailLabel}>Departments</Text>
            <View style={styles.chipRow}>
              {a.departments.map((d, index) => (
                <View key={`${d}-${index}`} style={styles.chip}>
                  <Text style={styles.chipText}>{d}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.detailLabel}>Shift</Text>
            <Text style={styles.detailValue}>{a.shift}</Text>

            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDisplayDate(a.date)}</Text>

            <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
              <Text style={styles.editBtnText}>Edit Duty</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveDuty(activeOfficial.name, a.dutyIds)}>
              <Text style={styles.removeBtnText}>Remove Duty</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {renderToast()}
      </SafeAreaView>
    );
  }

  // ==================== LIST SCREEN ====================
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Duty</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading officials...</Text>
          </View>
        ) : officials.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: '#999' }}>No Monitoring Officials found</Text>
          </View>
        ) : (
          officials.map(official => (
            <View key={official.id} style={styles.officialCard}>
              <View style={styles.officialHeader}>
                <Text style={styles.officialName}>{official.name}</Text>
                <Text style={[styles.statusText, official.status === 'assigned' && styles.statusTextAssigned]}>
                  {official.status === 'assigned' ? 'Duty Assigned' : 'Available'}
                </Text>
              </View>
              <TouchableOpacity style={styles.viewBtn} onPress={() => official.status === 'assigned' ? openView(official) : openAssign(official)}>
                <Text style={styles.viewBtnText}>{official.status === 'assigned' ? 'View Duty' : 'Assign Duty'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      {renderToast()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  content: { padding: 15, paddingBottom: 40 },
  officialCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  officialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  officialName: { fontSize: 17, fontWeight: '700', color: '#1A237E' },
  statusText: { fontSize: 13, color: '#2E7D32', fontWeight: '600', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusTextAssigned: { color: '#FFF', backgroundColor: '#4CAF50' },
  viewBtn: { backgroundColor: '#1A237E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  viewBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  formContent: { padding: 15, paddingBottom: 40 },
  topCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  topCardName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  topCardSub: { fontSize: 13, color: '#666', marginTop: 3 },
  topCardDivider: { height: 1, backgroundColor: '#E8EAF6', marginVertical: 10 },
  topCardDate: { fontSize: 13, color: '#1A237E', fontWeight: '700' },
  formCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  label: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8, marginTop: 12 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  selectBtnText: { flex: 1, fontSize: 14, color: '#1A237E', fontWeight: '700' },
  placeholderText: { color: '#999' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#1A237E' },
  shiftContainer: { flexDirection: 'row', gap: 8 },
  shiftBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1A237E', alignItems: 'center' },
  shiftBtnActive: { backgroundColor: '#1A237E' },
  shiftText: { fontSize: 13, fontWeight: '700', color: '#1A237E' },
  shiftTextActive: { color: '#FFF' },
  dateInput: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#333' },
  confirmBtn: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  confirmText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  detailLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 6, marginTop: 12 },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  editBtn: { backgroundColor: '#1A237E', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  editBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  removeBtn: { backgroundColor: '#F44336', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  removeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '70%', elevation: 10, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1A237E' },
  modalClose: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
  modalList: { maxHeight: 300 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8 },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },
  doneBtn: { backgroundColor: '#1A237E', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  toastOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  toast: { paddingHorizontal: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, maxWidth: '80%', backgroundColor: '#FFF' },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  
  // ✅ NEW STYLES FOR INFO BOX AND EMPTY STATE
  infoBox: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 15,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1A237E', lineHeight: 16 },
  emptyModalText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
});