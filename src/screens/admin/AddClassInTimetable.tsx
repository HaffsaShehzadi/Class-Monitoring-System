import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddClassInTimetable({ onBack, onNavigate, params }: any) {
  const mode = params?.mode || 'add';
  const editData = params?.editData || null;
  const defaultDept = params?.defaultDept || '';
  const defaultSem = params?.defaultSem || '';
  const defaultDay = params?.defaultDay || '';
  const defaultPeriod = params?.defaultPeriod || 0;

  const [classTeacher, setClassTeacher] = useState(editData?.teacher || '');
  const [classCode, setClassCode] = useState(editData?.code || '');
  const [classRoom, setClassRoom] = useState(editData?.room || '');

  const contextText = mode === 'add' 
    ? `${defaultDept} • ${defaultSem} Sem • ${defaultDay} • Period ${defaultPeriod}`
    : `${editData.dept} • ${editData.sem} Sem • ${editData.day} • Period ${editData.period}`;

  const handleSave = () => {
    if (!classTeacher.trim() || !classCode.trim() || !classRoom.trim()) {
      Alert.alert('Error', 'Teacher, Code and Room are required');
      return;
    }

    Alert.alert(
      'Success',
      mode === 'add' ? 'Class added successfully' : 'Class updated successfully',
      [{ text: 'OK', onPress: () => onNavigate('timetableManagement') }]
    );
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
          onPress: () => {
            Alert.alert('Deleted', 'Class removed successfully', [
              { text: 'OK', onPress: () => onNavigate('timetableManagement') }
            ]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add New Class' : 'Edit Class'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.contextInfo}>
          <MaterialCommunityIcons name="information" size={20} color="#1A237E" />
          <Text style={styles.contextText}>{contextText}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.iconHeader}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons 
                name={mode === 'add' ? 'book-plus' : 'book-edit'} 
                size={40} 
                color="#1A237E" 
              />
            </View>
            <Text style={styles.formTitle}>
              {mode === 'add' ? 'Class Details' : 'Update Class Details'}
            </Text>
          </View>

          <Text style={styles.inputLabel}>Teacher Name *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account-tie" size={20} color="#1A237E" />
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
            <MaterialCommunityIcons name="book" size={20} color="#1A237E" />
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
            <MaterialCommunityIcons name="door" size={20} color="#1A237E" />
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
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <MaterialCommunityIcons name="delete" size={20} color="#FFF" />
              <Text style={styles.deleteBtnText}>Delete Class</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>
              {mode === 'add' ? 'Add Class' : 'Update Class'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  content: { padding: 15, paddingBottom: 30 },
  contextInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 12, borderRadius: 10, marginBottom: 15, gap: 8,
  },
  contextText: { fontSize: 13, fontWeight: '700', color: '#1A237E', flex: 1 },
  formCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 3, marginBottom: 15,
  },
  iconHeader: { alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 6, marginTop: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#DDD', gap: 8,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#333' },
  actionButtons: { gap: 10 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, gap: 8, elevation: 3,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F44336', paddingVertical: 14, borderRadius: 12, gap: 8, elevation: 3,
  },
  deleteBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});