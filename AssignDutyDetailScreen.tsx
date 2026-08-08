import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Alert, 
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AVAILABLE_DEPARTMENTS } from './SharedData';

export default function AssignDutyDetailScreen({ onBack, official, editData, onConfirm }: any) {
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [date, setDate] = useState('');
  const [deptModalVisible, setDeptModalVisible] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (editData) {
      setSelectedDepts(editData.departments || []);
      setSelectedShift(editData.shift || '');
      setDate(editData.date || '');
    }
  }, [editData]);

  const toggleDepartment = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleConfirm = () => {
    if (selectedDepts.length === 0 || !selectedShift || !date) {
      Alert.alert('⚠️ Error', 'Please select at least one department, shift, and date.');
      return;
    }

    const dutyData = {
      id: editData?.id || Date.now(),
      officialId: official.id,
      officialName: official.name,
      departments: selectedDepts,
      shift: selectedShift,
      date: date,
      status: 'assigned'
    };

    Alert.alert(
      `✅ Duty ${editData ? 'Updated' : 'Assigned'} Successfully`,
      `Official: ${official.name}\nDepartments: ${selectedDepts.join(', ')}\nShift: ${selectedShift}\nDate: ${date}`,
      [{ text: 'OK', onPress: () => { onConfirm(dutyData); onBack(); }}]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editData ? 'Edit Duty' : 'Assign Duty'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Official Info Card */}
          <View style={styles.officialCard}>
            <View style={styles.officialIcon}>
              <MaterialCommunityIcons name="account-circle" size={50} color="#1A237E" />
            </View>
            <View style={styles.officialInfo}>
              <Text style={styles.officialName}>{official.name}</Text>
            </View>
          </View>

          {/* Select Departments */}
          <Text style={styles.label}>Select Departments *</Text>
          <TouchableOpacity 
            style={styles.selectBox} 
            onPress={() => setDeptModalVisible(true)}
          >
            <Text style={selectedDepts.length > 0 ? styles.selectedText : styles.placeholderText}>
              {selectedDepts.length > 0 ? `${selectedDepts.length} Department(s) Selected` : 'Tap to select departments...'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Selected Departments Chips */}
          {selectedDepts.length > 0 && (
            <View style={styles.chipsContainer}>
              {selectedDepts.map(dept => (
                <View key={dept} style={styles.chip}>
                  <Text style={styles.chipText}>{dept}</Text>
                  <TouchableOpacity onPress={() => toggleDepartment(dept)}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Select Shift */}
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

          {/* Date Input */}
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            keyboardType="default"
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>{editData ? 'Update' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Department Selection Modal - CENTERED */}
      <Modal visible={deptModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Departments</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {AVAILABLE_DEPARTMENTS.map(dept => {
                const isSelected = selectedDepts.includes(dept);
                return (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => toggleDepartment(dept)}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {dept}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={24} color="#FFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalDoneBtn} 
              onPress={() => setDeptModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  content: { padding: 20, paddingBottom: 40 },
  officialCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  officialIcon: { marginRight: 15 },
  officialInfo: { flex: 1 },
  officialName: { fontSize: 20, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  
  label: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 10, marginTop: 15 },
  
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  placeholderText: { fontSize: 15, color: '#999' },
  selectedText: { fontSize: 15, color: '#1A237E', fontWeight: '600' },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A237E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  chipText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  shiftContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 15 },
  shiftBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1A237E', alignItems: 'center' },
  shiftBtnActive: { backgroundColor: '#1A237E' },
  shiftText: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  shiftTextActive: { color: '#FFF' },

  dateInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 20 },

  actionButtons: { flexDirection: 'row', gap: 15, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#E0E0E0', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  cancelText: { color: '#666', fontSize: 16, fontWeight: '700' },
  confirmBtn: { flex: 1, backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Modal Styles - CENTERED
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    width: '100%', 
    maxWidth: 400,
    maxHeight: '80%'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  modalList: { maxHeight: 300, marginBottom: 15 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 10, marginBottom: 8 },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },
  modalDoneBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalDoneText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});