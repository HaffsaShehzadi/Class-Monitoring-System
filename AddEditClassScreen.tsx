import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:30 - 10:15' },
  { id: 3, time: '10:30 - 11:15' },
  { id: 4, time: '11:30 - 12:15' },
  { id: 5, time: '12:30 - 01:15' },
  { id: 6, time: '02:00 - 02:45' },
  { id: 7, time: '03:00 - 03:45' },
];

interface AddEditClassScreenProps {
  onBack: () => void;
  onSave: (classData: any) => void;
  editData?: any;
  defaultDept?: string;
  defaultSem?: string;
  defaultDay?: string;
  defaultPeriod?: number;
}

export default function AddEditClassScreen({ 
  onBack, 
  onSave, 
  editData, 
  defaultDept, 
  defaultSem, 
  defaultDay, 
  defaultPeriod 
}: AddEditClassScreenProps) {
  
  // Inputs ki state
  const [subject, setSubject] = useState(editData?.subject || '');
  const [subjectCode, setSubjectCode] = useState(editData?.code || '');
  const [teacher, setTeacher] = useState(editData?.teacher || '');
  const [room, setRoom] = useState(editData?.room || '');

  // Background mein data save karne ke liye (UI par nahi dikhega)
  const dept = editData?.dept || defaultDept || 'N/A';
  const sem = editData?.semester || defaultSem || 'N/A';
  const day = editData?.day || defaultDay || 'N/A';
  const period = editData?.period || defaultPeriod || 1;

  const handleSave = () => {
    if (!subject || !teacher || !room) {
      Alert.alert('️ Error', 'Please fill Subject, Teacher, and Room.');
      return;
    }

    const classData = {
      id: editData?.id || Date.now(),
      dept,
      semester: sem,
      day,
      period,
      subject,
      code: subjectCode,
      teacher,
      room
    };

    Alert.alert(
      'Confirm',
      `Are you sure you want to ${editData ? 'update' : 'add'} this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => onSave(classData)
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
        <Text style={styles.headerTitle}>{editData ? 'Edit Class' : 'Add New Class'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Subject */}
        <Text style={styles.label}>Subject Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Programming Fundamentals"
          value={subject}
          onChangeText={setSubject}
        />

        {/* Subject Code */}
        <Text style={styles.label}>Subject Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., CS-101"
          value={subjectCode}
          onChangeText={setSubjectCode}
        />

        {/* Teacher */}
        <Text style={styles.label}>Teacher Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Dr. Ahmad Ali"
          value={teacher}
          onChangeText={setTeacher}
        />

        {/* Room */}
        <Text style={styles.label}>Room Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., R-101"
          value={room}
          onChangeText={setRoom}
        />

        {/* ✅ Save Button (Text Changed) */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialCommunityIcons name="content-save" size={24} color="#FFF" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
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
  
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10, marginTop: 15 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    minHeight: 50,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    elevation: 3,
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 10 },
});