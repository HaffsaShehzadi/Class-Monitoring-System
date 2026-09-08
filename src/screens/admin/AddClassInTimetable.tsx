import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { timetableService } from '../../services/timetableService';

export default function AddClassInTimetable({ onBack, onNavigate, params }: any) {
  const mode = params?.mode || 'add';
  const editData = params?.editData || null;
  const defaultShift = params?.defaultShift || '';
  const defaultDept = params?.defaultDept || '';
  const defaultSem = params?.defaultSem || '';
  const defaultDay = params?.defaultDay || '';
  const defaultPeriod = params?.defaultPeriod || 0;

  const [classTeacher, setClassTeacher] = useState(editData?.teacher || '');
  const [classCode, setClassCode] = useState(editData?.code || '');
  const [classRoom, setClassRoom] = useState(editData?.room || '');
  const [isLoading, setIsLoading] = useState(false);

  const contextText = mode === 'add' 
    ? `${defaultDept} • ${defaultSem} Sem • ${defaultDay} • Period ${defaultPeriod}`
    : `${editData.dept} • ${editData.sem} Sem • ${editData.day} • Period ${editData.period}`;

  // ✅ FIXED: Timetable screen par wapis jayen with refresh
  const goBackToTimetable = (msg: string) => {
    onNavigate('timetableManagement', {
      returnStep: 'timetable',
      returnShift: defaultShift,
      returnDept: mode === 'edit' ? editData.dept : defaultDept,
      returnDay: mode === 'edit' ? editData.day : defaultDay,
      toastMessage: msg,
      refreshKey: Date.now(),
    });
  };

  // ✅ FIXED: Proper error handling
  // ✅ FIXED: Proper error handling and Auto-Navigation
  const handleSave = async () => {
    if (!classTeacher.trim() || !classCode.trim() || !classRoom.trim()) {
      Alert.alert('Error', 'Teacher, Code and Room are required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        teacher_name: classTeacher,
        subject_code: classCode,
        room_no: classRoom,
        department_name: mode === 'add' ? defaultDept : editData.dept,
        semester: mode === 'add' ? defaultSem : editData.sem,
        day: mode === 'add' ? defaultDay : editData.day,
        period_number: mode === 'add' ? defaultPeriod : editData.period,
      };

      if (mode === 'add') {
        await timetableService.create(payload);
        // ✅ YEH LINE CHANGE KI HAI: Ab add hone ke baad seedha timetable screen par refresh ke sath jayega
        goBackToTimetable('Class added successfully');
      } else {
        await timetableService.update(editData.id, payload);
        goBackToTimetable('Class updated successfully');
      }
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert('Error', error.message || 'Failed to save class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to remove this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await timetableService.remove(editData.id);
              goBackToTimetable('Class removed successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete class');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* ✅ FIXED: Yeh button ab timetable screen par wapis layega */}
        <TouchableOpacity onPress={() => goBackToTimetable('')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add New Class' : 'Edit Class'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contextInfo}>
            <Text style={styles.contextText}>{contextText}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {mode === 'add' ? 'Class Details' : 'Update Class Details'}
            </Text>

            <Text style={styles.inputLabel}>Teacher Name *</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., Hassan Raza" 
                value={classTeacher} 
                onChangeText={setClassTeacher} 
                placeholderTextColor="#999" 
              />
            </View>

            <Text style={styles.inputLabel}>Subject Code *</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., UE-272" 
                value={classCode} 
                onChangeText={setClassCode} 
                placeholderTextColor="#999" 
              />
            </View>

            <Text style={styles.inputLabel}>Room Number *</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., R58" 
                value={classRoom} 
                onChangeText={setClassRoom} 
                placeholderTextColor="#999" 
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            {mode === 'edit' && (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={isLoading}>
                <MaterialCommunityIcons name="delete" size={20} color="#FFF" />
                <Text style={styles.deleteBtnText}>Delete Class</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {mode === 'add' ? 'Add Class' : 'Update Class'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 2, borderBottomColor: '#1A237E',
  },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  content: { padding: 15, paddingBottom: 40 },
  contextInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 12, borderRadius: 10, marginBottom: 15,
  },
  contextText: { fontSize: 13, fontWeight: '700', color: '#1A237E', flex: 1 },
  formCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 3, marginBottom: 15,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', textAlign: 'center', marginBottom: 10 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 6, marginTop: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#DDD',
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#333' },
  actionButtons: { gap: 10 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, elevation: 3,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F44336', paddingVertical: 14, borderRadius: 12, gap: 8, elevation: 3,
  },
  deleteBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});