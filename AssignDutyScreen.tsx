import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ Email puri tarah hata diya gaya hai security ke liye
const MONITORING_OFFICIALS = [
  { id: 1, name: 'Sara Ahmed', available: true },
  { id: 2, name: 'Ahmed Hassan', available: true },
  { id: 3, name: 'Zainab Ali', available: true },
];

export default function AssignDutyScreen({ onBack, onNavigate }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Duty</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ Sub-header line hata di gayi hai */}

      <ScrollView contentContainerStyle={styles.content}>
        {MONITORING_OFFICIALS.map(official => (
          <View key={official.id} style={styles.officialCard}>
            <View style={styles.officialIcon}>
              <MaterialCommunityIcons name="account-circle" size={45} color="#4CAF50" />
            </View>
            <View style={styles.officialInfo}>
              <Text style={styles.officialName}>{official.name}</Text>
              <View style={styles.availableBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.availableText}>Available</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.assignBtn}
              onPress={() => onNavigate('assignDutyDetail', { official })}
            >
              <Text style={styles.assignBtnText}>Assign Duty</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  // ✅ subHeader aur subHeaderText styles hata diye gaye hain
  
  content: { padding: 20 },
  officialCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    alignItems: 'center', 
  },
  officialIcon: { marginBottom: 10 },
  officialInfo: { marginBottom: 15, alignItems: 'center' },
  officialName: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  availableText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  assignBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%', 
  },
  assignBtnText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '700' 
  },
});