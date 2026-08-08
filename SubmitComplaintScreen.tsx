import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SubmitComplaintScreen({ onBack }: any) {
  const [complaint, setComplaint] = useState('');

  // submit complaint
  const handleSubmit = () => {
    if (!complaint.trim()) {
      Alert.alert('Error', 'Please write description first');
      return;
    }
    
    Alert.alert('Success', 'Complaint submitted', [
      { 
        text: 'OK', 
        onPress: () => { 
          setComplaint(''); 
          onBack(); 
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Complaint</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submit Complaint</Text>
          
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            placeholder="Write about wrong attendance or any issue..."
            multiline
            numberOfLines={6}
            value={complaint}
            onChangeText={setComplaint}
            textAlignVertical="top"
          />
          
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 25,
    width: '100%',
    elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A237E', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});