import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Sample data - Real app mein ye API se aayega
const ALL_CLASSES = [
  { id: 1, period: 1, time: '08:30 - 09:15', subject: 'Programming', code: 'CS-101', teacher: 'Ahmad Ali', room: 'R39', section: '[A]', present: 28, absent: 2, total: 30 },
  { id: 2, period: 2, time: '09:30 - 10:15', subject: 'English', code: 'ENG-102', teacher: 'Ahmad Ali', room: 'R38', section: '[B]', present: 25, absent: 5, total: 30 },
  { id: 3, period: 3, time: '10:30 - 11:15', subject: 'Database', code: 'CS-201', teacher: 'Hassan Raza', room: 'R39', section: '[A]', present: 30, absent: 0, total: 30 }, // Dusre teacher ki class
  { id: 4, period: 4, time: '11:30 - 12:15', subject: 'Web Dev', code: 'CS-301', teacher: 'Ahmad Ali', room: 'R40', section: '[C]', present: 27, absent: 3, total: 30 },
];

export default function TodayAttendanceScreen({ onBack, userRole, currentUser }: any) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // ✅ Filter: Sirf current teacher ki classes dikhao
  const myClasses = ALL_CLASSES.filter(cls => cls.teacher === currentUser?.name);

  const totalPresent = myClasses.reduce((sum, c) => sum + c.present, 0);
  const totalAbsent = myClasses.reduce((sum, c) => sum + c.absent, 0);
  const totalStudents = totalPresent + totalAbsent;
  const attendancePercent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date & Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.teacherName}>Teacher: {currentUser?.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalPresent}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalAbsent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{attendancePercent}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
        </View>

        {/* My Classes List */}
        <Text style={styles.sectionLabel}>My Classes Today</Text>
        
        {myClasses.length === 0 ? (
          <View style={styles.noClassBox}>
            <MaterialCommunityIcons name="calendar-blank" size={60} color="#999" />
            <Text style={styles.noClassText}>No classes scheduled today</Text>
          </View>
        ) : (
          myClasses.map(cls => (
            <View key={cls.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <View style={styles.periodBadge}>
                  <Text style={styles.periodText}>P{cls.period}</Text>
                </View>
                <Text style={styles.timeText}>{cls.time}</Text>
              </View>

              <Text style={styles.subjectText}>{cls.subject}</Text>
              <Text style={styles.codeText}>{cls.code} {cls.section}</Text>
              <Text style={styles.roomText}>📍 Room: {cls.room}</Text>

              <View style={styles.attendanceRow}>
                <View style={styles.attendanceItem}>
                  <Text style={styles.attendanceNumber}>{cls.present}</Text>
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
                <View style={styles.attendanceItem}>
                  <Text style={styles.attendanceNumber}>{cls.absent}</Text>
                  <Text style={styles.attendanceLabel}>Absent</Text>
                </View>
                <View style={styles.attendanceItem}>
                  <Text style={styles.attendanceNumber}>{cls.total}</Text>
                  <Text style={styles.attendanceLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(cls.present / cls.total) * 100}%`, backgroundColor: cls.present/cls.total >= 0.75 ? '#4CAF50' : '#FF9800' }
                  ]} 
                />
              </View>
            </View>
          ))
        )}
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
  content: { padding: 15 },
  summaryCard: {
    backgroundColor: '#1A237E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  dateText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 5, textAlign: 'center' },
  teacherName: { color: '#B0BEC5', fontSize: 14, marginBottom: 15, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#B0BEC5', fontSize: 12, marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  classCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  periodBadge: {
    backgroundColor: '#1A237E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  periodText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  timeText: { fontSize: 13, color: '#666', fontWeight: '600' },
  subjectText: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  codeText: { fontSize: 13, color: '#666', marginBottom: 4 },
  roomText: { fontSize: 12, color: '#666', marginBottom: 12 },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 10,
  },
  attendanceItem: { alignItems: 'center' },
  attendanceNumber: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  attendanceLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  noClassBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
  },
  noClassText: { fontSize: 16, color: '#999', marginTop: 15, textAlign: 'center' },
});