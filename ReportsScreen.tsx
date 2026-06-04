import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// For production: import * as Print from 'expo-print'; import * as Sharing from 'expo-sharing';

export default function ReportsScreen({ onBack }: { onBack: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (format: 'pdf' | 'csv') => {
    if (!startDate || !endDate) {
      Alert.alert('⚠️ Date Range Required', 'Please select start and end dates');
      return;
    }
    setGenerating(true);
    
    // Simulate report generation (2 sec delay)
    setTimeout(() => {
      setGenerating(false);
      const fileName = `Attendance_Report_${startDate}_to_${endDate}.${format}`;
      
      if (Platform.OS === 'web') {
        Alert.alert(`📄 ${format.toUpperCase()} Generated`, `File: ${fileName}\n\n(Web demo) Download would start here.`);
      } else {
        Alert.alert(`✅ Report Saved`, `${fileName} has been saved to your device.`);
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Reports</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Attendance Report</Text>
          
          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} placeholder="2024-06-01" value={startDate} onChangeText={setStartDate} />
          
          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} placeholder="2024-06-30" value={endDate} onChangeText={setEndDate} />
          
          <Text style={styles.label}>Filter by Class (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g., 10-A, 10-B" value={filterClass} onChangeText={setFilterClass} />
          
          <Text style={styles.hint}>💡 Leave class blank for all classes report</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.genBtn, styles.pdfBtn]} 
              onPress={() => handleGenerate('pdf')}
              disabled={generating}
            >
              {generating ? (
                <Text style={styles.genBtnText}>⏳ Generating...</Text>
              ) : (
                <Text style={styles.genBtnText}>📄 Generate PDF</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.genBtn, styles.csvBtn]} 
              onPress={() => handleGenerate('csv')}
              disabled={generating}
            >
              {generating ? (
                <Text style={styles.genBtnText}>⏳ Generating...</Text>
              ) : (
                <Text style={styles.genBtnText}>📊 Generate CSV</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sample Report Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>📋 Sample Report Preview</Text>
          <View style={styles.previewTable}>
            <View style={[styles.previewRow, styles.previewHeader]}>
              <Text style={styles.previewCell}>Date</Text>
              <Text style={styles.previewCell}>Class</Text>
              <Text style={styles.previewCell}>Present</Text>
              <Text style={styles.previewCell}>Absent</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewCell}>2024-06-01</Text>
              <Text style={styles.previewCell}>10-A</Text>
              <Text style={styles.previewCell}>28</Text>
              <Text style={styles.previewCell}>2</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewCell}>2024-06-01</Text>
              <Text style={styles.previewCell}>10-B</Text>
              <Text style={styles.previewCell}>25</Text>
              <Text style={styles.previewCell}>5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  content: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 14 },
  hint: { fontSize: 12, color: '#666', marginTop: 8, fontStyle: 'italic' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 25 },
  genBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  pdfBtn: { backgroundColor: '#1A237E' },
  csvBtn: { backgroundColor: '#4CAF50' },
  genBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  previewCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 12, textAlign: 'center' },
  previewTable: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, overflow: 'hidden' },
  previewRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  previewHeader: { backgroundColor: '#F5F5F5' },
  previewCell: { flex: 1, padding: 10, fontSize: 13, color: '#333', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#EEE' },
});