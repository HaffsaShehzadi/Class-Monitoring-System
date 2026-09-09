import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:15 - 10:00' },
  { id: 3, time: '10:00 - 10:45' },
  { id: 4, time: '11:00 - 11:45' },
  { id: 5, time: '11:45 - 12:30' },
  { id: 6, time: '01:30 - 02:15' },
  { id: 7, time: '02:15 - 03:00' },
];

// ✅ LOCAL teacher info (TODO: backend se aayega)
const TEACHER_INFO = { name: 'Hassan Raza', department: 'IT' };

// ✅ LOCAL timetable (TODO: backend se aayega)
const TEACHER_TIMETABLE = [
  { id: 1, shift: '1st Shift', day: 'Monday', period: 1, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd' },
  { id: 2, shift: '1st Shift', day: 'Monday', period: 2, room: 'R58', code: 'GENG-201', dept: 'IT', sem: '4th' },
  { id: 3, shift: '1st Shift', day: 'Monday', period: 3, room: 'R59', code: 'CC-213L', dept: 'IT', sem: '2nd' },
  { id: 4, shift: '1st Shift', day: 'Monday', period: 4, room: 'R59', code: 'AI-301', dept: 'IT', sem: '6th' },
  { id: 5, shift: '1st Shift', day: 'Tuesday', period: 1, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd' },
  { id: 6, shift: '1st Shift', day: 'Tuesday', period: 3, room: 'R59', code: 'CC-213L', dept: 'IT', sem: '2nd' },
  { id: 7, shift: '1st Shift', day: 'Wednesday', period: 2, room: 'R60', code: 'CS-101', dept: 'BSCS', sem: '2nd' },
  { id: 8, shift: '1st Shift', day: 'Friday', period: 2, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd' },
  { id: 9, shift: '2nd Shift', day: 'Monday', period: 6, room: 'R61', code: 'AI-301', dept: 'IT', sem: '6th' },
  { id: 10, shift: '2nd Shift', day: 'Monday', period: 7, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd' },
  { id: 11, shift: '2nd Shift', day: 'Thursday', period: 6, room: 'R61', code: 'AI-301', dept: 'IT', sem: '6th' },
];

export default function MyTimetableScreen({ onBack }: any) {
  const [step, setStep] = useState<'shift' | 'day' | 'timetable'>('shift');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const dayLectures = TEACHER_TIMETABLE.filter(
    l => l.shift === selectedShift && l.day === selectedDay
  );
  const getLecture = (periodId: number) => dayLectures.find(l => l.period === periodId);

  const getFullDate = (dayName: string) => {
    const dayMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };
    const now = new Date();
    const diff = (dayMap[dayName] - now.getDay() + 7) % 7;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const formatRoom = (room: string) => `R#${room.replace('R', '')}`;

  const handleBack = () => {
    if (step === 'timetable') setStep('day');
    else if (step === 'day') setStep('shift');
    else onBack();
  };

  // ==========================================
  // STEP 1: Select Shift
  // ==========================================
  if (step === 'shift') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('1st Shift'); setStep('day'); }}
          >
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('2nd Shift'); setStep('day'); }}
          >
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Select Day
  // ==========================================
  if (step === 'day') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Day</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
          <View style={styles.teacherTopCard}>
            <View style={styles.teacherAvatar}>
              <MaterialCommunityIcons name="account-tie" size={30} color="#1A237E" />
            </View>
            <View style={styles.teacherTopInfo}>
              <Text style={styles.teacherTopName}>{TEACHER_INFO.name}</Text>
              <Text style={styles.teacherTopDept}>{TEACHER_INFO.department} Department • {selectedShift}</Text>
            </View>
          </View>

          <Text style={styles.chooseText}>Choose a day to view your timetable</Text>

          <View style={styles.dayGrid}>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={styles.dayCard}
                onPress={() => { setSelectedDay(day); setStep('timetable'); }}
              >
                <MaterialCommunityIcons name="calendar-blank" size={26} color="#1A237E" />
                <Text style={styles.dayCardText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 3: Timetable View
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Timetable</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        {/* ✅ Top Card - name side (left), IT Department, sirf date wala day */}
        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{TEACHER_INFO.name}</Text>
          <Text style={styles.infoLine}>{TEACHER_INFO.department} Department</Text>
          <Text style={styles.infoLine}>{getFullDate(selectedDay)}</Text>
        </View>

        {/* Timetable Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colPeriod}><Text style={styles.tableTh}>Period</Text></View>
            <View style={styles.colTiming}><Text style={styles.tableTh}>Timing</Text></View>
            <View style={styles.colLectures}><Text style={styles.tableTh}>Lectures</Text></View>
          </View>

          {PERIODS.map(p => {
            const lecture = getLecture(p.id);
            return (
              <View key={p.id} style={styles.tableRow}>
                <View style={styles.colPeriod}>
                  <Text style={styles.periodNum}>{p.id}</Text>
                </View>
                <View style={styles.colTiming}>
                  <Text style={styles.timeText}>{p.time}</Text>
                </View>
                <View style={styles.colLectures}>
                  {lecture ? (
                    <View style={styles.lectureCentered}>
                      <Text style={styles.lectureValue}>{formatRoom(lecture.room)}</Text>
                      <Text style={styles.lectureValue}>{lecture.code}</Text>
                      <Text style={styles.lectureValue}>{lecture.dept} {lecture.sem} sem</Text>
                    </View>
                  ) : (
                    <Text style={styles.freeText}>— Free —</Text>
                  )}
                </View>
              </View>
            );
          })}
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },

  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center',
    elevation: 3, borderWidth: 2, borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },

  teacherTopCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#1A237E',
  },
  teacherAvatar: {
    width: 55, height: 55, borderRadius: 28, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  teacherTopInfo: { flex: 1 },
  teacherTopName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  teacherTopDept: { fontSize: 13, color: '#666', marginTop: 3 },
  chooseText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15 },

  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayCard: {
    width: '48%', backgroundColor: '#FFF', borderRadius: 12, padding: 18,
    marginBottom: 12, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#E8EAF6',
  },
  dayCardText: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginTop: 8 },

  // ✅ Top info card - left aligned (side pe)
  infoCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 15,
    borderWidth: 2, borderColor: '#1A237E', elevation: 2,
  },
  infoName: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 6 },
  infoLine: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 4 },

  // Table
  table: { borderWidth: 2, borderColor: '#1A237E', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFF' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1A237E', paddingVertical: 14 },
  tableTh: { color: '#FFF', fontWeight: '800', fontSize: 14, textAlign: 'center', flex: 1 },
  colPeriod: { width: 70, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#C5CAE9' },
  colTiming: { width: 120, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#C5CAE9' },
  colLectures: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C5CAE9', minHeight: 85 },
  periodNum: { fontSize: 16, fontWeight: '800', color: '#1A237E' },
  timeText: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  lectureCentered: { alignItems: 'center', justifyContent: 'center' },
  lectureValue: { fontSize: 12, color: '#1A237E', fontWeight: '800', marginBottom: 3, textAlign: 'center' },
  freeText: { fontSize: 11, color: '#B0BEC5', fontStyle: 'italic', textAlign: 'center' },
});