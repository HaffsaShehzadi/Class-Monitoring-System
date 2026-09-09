import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const AVAILABLE_DEPARTMENTS = [
  'IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu', 
  'Islamiat', 'Zoology', 'Economics', 'Political Science'
];

const INITIAL_OFFICIALS = [
  { id: 1, name: 'Sara Ahmed' },
  { id: 2, name: 'Ahmed Hassan' },
  { id: 3, name: 'Zainab Ali' },
  { id: 4, name: 'Bilal Khan' },
];

interface OfficialData {
  id: number;
  name: string;
  status: 'available' | 'assigned';
  assignment?: {
    departments: string[];
    shift: string;
    date: string;
  };
}

export default function AssignDutyScreen({ onBack }: any) {
  const [officials, setOfficials] = useState<OfficialData[]>(
    INITIAL_OFFICIALS.map(o => ({ ...o, status: 'available' as const }))
  );
  
  const [selectedOfficialId, setSelectedOfficialId] = useState<number | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDepartment = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleSelectOfficial = (officialId: number) => {
    setSelectedOfficialId(officialId);
    setSelectedDepts([]);
    setSelectedShift('');
    setDate('');
  };

  const handleCancel = () => {
    setSelectedOfficialId(null);
    setSelectedDepts([]);
    setSelectedShift('');
    setDate('');
  };

  const handleConfirm = () => {
    if (selectedDepts.length === 0 || !selectedShift || !date) {
      Alert.alert('Error', 'Please select at least one department, shift, and date.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    setLoading(true);

    // TODO: Backend API call
    // API: POST /api/duty/assign
    
    setTimeout(() => {
      setOfficials(officials.map(o => 
        o.id === selectedOfficialId 
          ? {
              ...o,
              status: 'assigned' as const,
              assignment: {
                departments: selectedDepts,
                shift: selectedShift,
                date: date,
              }
            }
          : o
      ));
      
      setLoading(false);
      setSelectedOfficialId(null);
      Alert.alert('Success', 'Duty assigned successfully!');
    }, 800);
  };

  const handleRemoveDuty = (officialId: number) => {
    Alert.alert(
      'Remove Assignment',
      'Are you sure you want to remove this duty assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setOfficials(officials.map(o =>
              o.id === officialId
                ? { ...o, status: 'available' as const, assignment: undefined }
                : o
            ));
            Alert.alert('Removed', 'Duty assignment removed successfully');
          }
        }
      ]
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Duty</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {officials.map(official => (
            <View key={official.id} style={styles.officialCard}>
              
              {/* Header: Name + Status */}
              <View style={styles.officialHeader}>
                <Text style={styles.officialName}>{official.name}</Text>
                <Text style={[
                  styles.statusText,
                  official.status === 'assigned' && styles.statusTextAssigned
                ]}>
                  {official.status === 'assigned' ? 'Assigned' : 'Available'}
                </Text>
              </View>

              {/* ======================================== */}
              {/* ASSIGNED VIEW */}
              {/* ======================================== */}
              {official.status === 'assigned' && official.assignment && (
                <View style={styles.assignedDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Departments:</Text>
                    <Text style={styles.detailValue}>
                      {official.assignment.departments.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Shift:</Text>
                    <Text style={styles.detailValue}>{official.assignment.shift}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDisplayDate(official.assignment.date)}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => handleRemoveDuty(official.id)}
                  >
                    <Text style={styles.removeBtnText}>Remove Duty</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ======================================== */}
              {/* ASSIGNMENT FORM */}
              {/* ======================================== */}
              {official.status === 'available' && selectedOfficialId === official.id && (
                <View style={styles.formContainer}>
                  
                  {/* Departments */}
                  <Text style={styles.label}>Select Departments *</Text>
                  <View style={styles.deptGrid}>
                    {AVAILABLE_DEPARTMENTS.map(dept => {
                      const isSelected = selectedDepts.includes(dept);
                      return (
                        <TouchableOpacity
                          key={dept}
                          style={[styles.deptCard, isSelected && styles.deptCardSelected]}
                          onPress={() => toggleDepartment(dept)}
                        >
                          <Text style={[
                            styles.deptCardText,
                            isSelected && styles.deptCardTextSelected
                          ]}>
                            {dept}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Selected Count */}
                  {selectedDepts.length > 0 && (
                    <Text style={styles.selectedCount}>
                      {selectedDepts.length} department(s) selected
                    </Text>
                  )}

                  {/* Shift */}
                  <Text style={styles.label}>Select Shift *</Text>
                  <View style={styles.shiftContainer}>
                    {['Morning', 'Evening', 'Both'].map(shift => (
                      <TouchableOpacity
                        key={shift}
                        style={[styles.shiftBtn, selectedShift === shift && styles.shiftBtnActive]}
                        onPress={() => setSelectedShift(shift)}
                      >
                        <Text style={[styles.shiftText, selectedShift === shift && styles.shiftTextActive]}>
                          {shift}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Date */}
                  <Text style={styles.label}>Date *</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                    keyboardType="default"
                    placeholderTextColor="#999"
                  />

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.cancelBtn} 
                      onPress={handleCancel}
                      disabled={loading}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.confirmBtn} 
                      onPress={handleConfirm}
                      disabled={loading}
                    >
                      <Text style={styles.confirmText}>
                        {loading ? 'Assigning...' : 'Assign Duty'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ======================================== */}
              {/* ASSIGN BUTTON */}
              {/* ======================================== */}
              {official.status === 'available' && selectedOfficialId !== official.id && (
                <TouchableOpacity 
                  style={styles.assignBtn}
                  onPress={() => handleSelectOfficial(official.id)}
                >
                  <Text style={styles.assignBtnText}>Assign Duty</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn: { padding: 4 },
  backText: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E', flex: 1, textAlign: 'center' },

  content: { padding: 15, paddingBottom: 40 },
  
  officialCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  
  officialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  officialName: { fontSize: 17, fontWeight: '700', color: '#1A237E' },
  statusText: { 
    fontSize: 13, 
    color: '#2E7D32', 
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextAssigned: { 
    color: '#FFF', 
    backgroundColor: '#4CAF50',
  },

  assignBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  assignBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Form
  formContainer: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    padding: 15,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  label: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8, marginTop: 12 },

  // Department Grid
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptCard: {
    width: '30%',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  deptCardSelected: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  deptCardText: { fontSize: 12, fontWeight: '700', color: '#1A237E', textAlign: 'center' },
  deptCardTextSelected: { color: '#FFF' },

  selectedCount: { 
    fontSize: 12, 
    color: '#1A237E', 
    fontWeight: '600', 
    marginTop: 8 
  },

  // Shift
  shiftContainer: { flexDirection: 'row', gap: 8 },
  shiftBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#FFF', 
    borderWidth: 2, 
    borderColor: '#1A237E',
    alignItems: 'center',
  },
  shiftBtnActive: { backgroundColor: '#1A237E' },
  shiftText: { fontSize: 13, fontWeight: '700', color: '#1A237E' },
  shiftTextActive: { color: '#FFF' },

  // Date
  dateInput: { 
    backgroundColor: '#FFF', 
    borderWidth: 1.5, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    paddingHorizontal: 12,
    paddingVertical: 12, 
    fontSize: 14, 
    color: '#333' 
  },

  // Action Buttons
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 15 },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#E0E0E0', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  cancelText: { color: '#666', fontSize: 14, fontWeight: '700' },
  confirmBtn: { 
    flex: 2, 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  confirmText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // Assigned Details
  assignedDetails: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    padding: 15,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: { 
    fontSize: 13, 
    color: '#666', 
    fontWeight: '600', 
    minWidth: 100 
  },
  detailValue: { 
    fontSize: 13, 
    color: '#1A237E', 
    fontWeight: '600', 
    flex: 1 
  },
  removeBtn: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  removeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});