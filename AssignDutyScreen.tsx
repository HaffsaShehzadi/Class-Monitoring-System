import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DUTIES = [
  { id: 1, title: 'Monitor Class 10-A', teacher: 'Mr. Hamza', time: '09:00 AM' },
  { id: 2, title: 'Check Lab 2', teacher: 'Mrs.Haffsa', time: '11:30 AM' },
  { id: 3, title: 'Exam Duty Hall B', teacher: 'Mrs. Eman', time: '02:00 PM' },
];

export default function AssignDutyScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" /></TouchableOpacity>
        <Text style={styles.headerTitle}>View Assign Duty</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subHeader}>Duty assigned to Abdullah</Text>
        <ScrollView contentContainerStyle={styles.list}>
          {DUTIES.map((duty) => (
            <View key={duty.id} style={styles.card}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={30} color="#4CAF50" />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{duty.title}</Text>
                <Text style={styles.cardMeta}>👨‍ {duty.teacher} • 🕒 {duty.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  content: { padding: 20 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center', fontStyle: 'italic' },
  list: { gap: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  cardInfo: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardMeta: { fontSize: 13, color: '#888', marginTop: 4 },
});
