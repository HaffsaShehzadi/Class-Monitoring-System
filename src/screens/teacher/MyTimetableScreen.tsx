import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { tokenStorage } from '../../services/tokenStorage';
import { teacherService } from '../../services/teacherService';

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

export default function MyTimetableScreen({ onBack }: any) {
  const [step, setStep] = useState<'shift' | 'day' | 'timetable'>('shift');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  // ✅ NEW: Real data states
  const [myLectures, setMyLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any>({ name: 'Teacher', department: 'N/A' });

  // ✅ NEW: Fetch user info on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await tokenStorage.getUser();
      if (user) {
        setTeacherInfo({ name: user.name, department: user.department || 'N/A' });
      }
    };
    loadUser();
  }, []);

  // ✅ NEW: Fetch timetable when step, shift, or day changes
  useEffect(() => {
    if (step === 'timetable' && selectedShift && selectedDay) {
      fetchTimetable();
    }
  }, [step, selectedShift, selectedDay]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const user = await tokenStorage.getUser();
      const data = await teacherService.getTimetableByDayAndShift(selectedDay, selectedShift);
      
      // ✅ Filter: Sirf current logged-in teacher ki classes dikhayein
      const filtered = data.filter((item: any) => item.teacher_id === user.id);
      setMyLectures(filtered);
    } catch (error: any) {
      console.error('Failed to fetch timetable:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLecture = (periodId: number) => myLectures.find(l => l.period_number === periodId);

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

  // STEP 1: Select Shift
  if (step === 'shift') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
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

  // STEP 2: Select Day
  if (step === 'day') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Day</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
          <View style={styles.teacherTopCard}>
            <Text style={styles.teacherTopName}>{teacherInfo.name}</Text>
            <Text style={styles.teacherTopDept}>{teacherInfo.department} Department • {selectedShift}</Text>
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

  // STEP 3: Timetable View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Timetable</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        <View style={styles.teacherTopCard}>
          <Text style={styles.teacherTopName}>{teacherInfo.name}</Text>
          <Text style={styles.teacherTopDept}>{teacherInfo.department} Department • {selectedShift}</Text>
          <View style={styles.dateRangeLine}>
            <Text style={styles.dateRangeText}>{getFullDate(selectedDay)}</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading your timetable...</Text>
          </View>
        ) : (
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
                    {/* ✅ Real time from backend, fallback to hardcoded if needed */}
                    <Text style={styles.timeText}>
                      {lecture ? `${lecture.start_time} - ${lecture.end_time}` : p.time}
                    </Text>
                  </View>
                  <View style={styles.colLectures}>
                    {lecture ? (
                      <View style={styles.lectureCentered}>
                        <Text style={styles.lectureValue}>{formatRoom(lecture.room_no)}</Text>
                        <Text style={styles.lectureValue}>{lecture.subject_code}</Text>
                        <Text style={styles.lectureValue}>{lecture.dept_name} {lecture.semester} sem</Text>
                      </View>
                    ) : (
                      <Text style={styles.freeText}>— Free —</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },

  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center',
    elevation: 3, borderWidth: 2, borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },

  teacherTopCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15,
    elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E',
  },
  teacherTopName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  teacherTopDept: { fontSize: 13, color: '#666', marginTop: 3 },
  dateRangeLine: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#E8EAF6',
  },
  dateRangeText: { fontSize: 13, color: '#1A237E', fontWeight: '700' },

  chooseText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15, marginTop: 10 },

  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayCard: {
    width: '48%', backgroundColor: '#FFF', borderRadius: 12, padding: 18,
    marginBottom: 12, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#E8EAF6',
  },
  dayCardText: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginTop: 8 },

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