import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:15 - 10:00' },
  { id: 3, time: '10:00 - 10:45' },
  { id: 4, time: '11:00 - 11:45' },
  { id: 5, time: '11:45 - 12:30' },
  { id: 6, time: '01:30 - 02:15' },
  { id: 7, time: '02:15 - 03:00' },
];

// ✅ LOCAL teacher info (App.tsx se nahi)
const TEACHER_INFO = { name: 'Hassan Raza', department: 'IT Department' };

// ✅ LOCAL mock data with shift (TODO: backend se aayega)
const MOCK_ATTENDANCE = [
  { id: 1, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-01', day: 'Saturday', period: 1, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd', status: 'Present', substitute: '' },
  { id: 2, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-01', day: 'Saturday', period: 2, room: 'R58', code: 'GENG-201', dept: 'IT', sem: '4th', status: 'Absent', substitute: 'Prof. Ali Waqas' },
  { id: 3, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-01', day: 'Saturday', period: 3, room: 'R59', code: 'CC-213L', dept: 'IT', sem: '2nd', status: 'Late', substitute: '' },
  { id: 4, teacher: 'Hassan Raza', shift: '2nd Shift', date: '2026-08-01', day: 'Saturday', period: 6, room: 'R60', code: 'AI-301', dept: 'IT', sem: '6th', status: 'Present', substitute: '' },
  { id: 5, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-03', day: 'Monday', period: 1, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd', status: 'Present', substitute: '' },
  { id: 6, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-03', day: 'Monday', period: 2, room: 'R59', code: 'CC-213L', dept: 'IT', sem: '2nd', status: 'Present', substitute: '' },
  { id: 7, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-03', day: 'Monday', period: 4, room: 'R59', code: 'AI-301', dept: 'IT', sem: '6th', status: 'Late', substitute: '' },
  { id: 8, teacher: 'Hassan Raza', shift: '2nd Shift', date: '2026-08-03', day: 'Monday', period: 7, room: 'R61', code: 'DB-401', dept: 'IT', sem: '8th', status: 'Absent', substitute: '' },
  { id: 9, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-04', day: 'Tuesday', period: 1, room: 'R58', code: 'UE-272', dept: 'IT', sem: '2nd', status: 'Present', substitute: '' },
  { id: 10, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-04', day: 'Tuesday', period: 3, room: 'R60', code: 'CS-101', dept: 'BSCS', sem: '2nd', status: 'Absent', substitute: '' },
  { id: 11, teacher: 'Hassan Raza', shift: '1st Shift', date: '2026-08-04', day: 'Tuesday', period: 5, room: 'R58', code: 'GENG-201', dept: 'IT', sem: '4th', status: 'Present', substitute: '' },
  { id: 12, teacher: 'Hassan Raza', shift: '2nd Shift', date: '2026-08-04', day: 'Tuesday', period: 6, room: 'R62', code: 'ML-501', dept: 'IT', sem: '6th', status: 'Present', substitute: '' },
];

export default function TeacherAttendanceHistory({ onBack }: any) {
  const [step, setStep] = useState<'shift' | 'range' | 'history'>('shift');
  const [selectedShift, setSelectedShift] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-04');
  const [filteredDates, setFilteredDates] = useState<any[]>([]);

  const teacherName = TEACHER_INFO.name;
  const teacherDept = TEACHER_INFO.department;

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ✅ Placeholder - Backend se PDF aayega
  const handleDownload = () => {
    Alert.alert(
      'Coming Soon',
      'PDF download feature will be available after backend integration.',
      [{ text: 'OK' }]
    );
  };

  const renderStatus = (record: any) => {
    if (!record) return <Text style={styles.freeStatus}>—</Text>;
    if (record.status === 'Present') {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#E8F5E9' }]}>
          <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
          <Text style={[styles.statusPillText, { color: '#4CAF50' }]}>Present</Text>
        </View>
      );
    }
    if (record.status === 'Late') {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FFF3E0' }]}>
          <MaterialCommunityIcons name="clock-alert" size={14} color="#FF9800" />
          <Text style={[styles.statusPillText, { color: '#FF9800' }]}>Late</Text>
        </View>
      );
    }
    if (record.status === 'Absent') {
      if (record.substitute) {
        return (
          <View style={[styles.statusPill, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="account-switch" size={14} color="#2196F3" />
            <Text style={[styles.statusPillText, { color: '#2196F3' }]} numberOfLines={2}>Sub: {record.substitute}</Text>
          </View>
        );
      }
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FFEBEE' }]}>
          <MaterialCommunityIcons name="close-circle" size={14} color="#F44336" />
          <Text style={[styles.statusPillText, { color: '#F44336' }]}>Absent</Text>
        </View>
      );
    }
    return null;
  };

  const formatRoom = (room: string) => `R#${room.replace('R', '')}`;

  const handleSearch = () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter both start and end dates (YYYY-MM-DD)');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    const myAttendance = MOCK_ATTENDANCE.filter(a =>
      a.teacher === teacherName && a.shift === selectedShift && a.date >= startDate && a.date <= endDate
    );

    if (myAttendance.length === 0) {
      Alert.alert('No Records', 'No attendance records found for this date range');
      return;
    }

    const dateMap: any = {};
    myAttendance.forEach(record => {
      if (!dateMap[record.date]) dateMap[record.date] = [];
      dateMap[record.date].push(record);
    });

    const sortedDates = Object.keys(dateMap)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({ date, day: dateMap[date][0].day, records: dateMap[date] }));

    setFilteredDates(sortedDates);
    setStep('history');
  };

  const handleBack = () => {
    if (step === 'history') setStep('range');
    else if (step === 'range') setStep('shift');
    else onBack();
  };

  // ==========================================
  // STEP 1: Select Shift (CENTERED)
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

        <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
          <View style={styles.teacherTopCard}>
            <View style={styles.teacherAvatar}>
              <MaterialCommunityIcons name="account-tie" size={30} color="#1A237E" />
            </View>
            <View style={styles.teacherTopInfo}>
              <Text style={styles.teacherTopName}>{teacherName}</Text>
              <Text style={styles.teacherTopDept}>{teacherDept}</Text>
            </View>
          </View>
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('1st Shift'); setStep('range'); }}
          >
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => { setSelectedShift('2nd Shift'); setStep('range'); }}
          >
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: Date Range
  // ==========================================
  if (step === 'range') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Attendance History</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
          <View style={styles.teacherTopCard}>
            <View style={styles.teacherAvatar}>
              <MaterialCommunityIcons name="account-tie" size={30} color="#1A237E" />
            </View>
            <View style={styles.teacherTopInfo}>
              <Text style={styles.teacherTopName}>{teacherName}</Text>
              <Text style={styles.teacherTopDept}>{teacherDept} • {selectedShift}</Text>
            </View>
          </View>

          <View style={styles.filterCard}>
            <View style={styles.filterIcon}>
              <MaterialCommunityIcons name="calendar-range" size={40} color="#1A237E" />
            </View>
            <Text style={styles.filterTitle}>Select Date Range</Text>
            <Text style={styles.filterSubtitle}>Enter dates in YYYY-MM-DD format</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateInputWrapper}>
                <TextInput style={styles.dateInput} placeholder="Start Date" value={startDate} onChangeText={setStartDate} placeholderTextColor="#999" />
              </View>
              <View style={styles.dateInputWrapper}>
                <TextInput style={styles.dateInput} placeholder="End Date" value={endDate} onChangeText={setEndDate} placeholderTextColor="#999" />
              </View>
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
              <Text style={styles.searchBtnText}>Search History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 3: History Table (with Status column)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{filteredDates.length} Days</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        <View style={styles.teacherTopCard}>
          <View style={styles.teacherAvatar}>
            <MaterialCommunityIcons name="account-tie" size={30} color="#1A237E" />
          </View>
          <View style={styles.teacherTopInfo}>
            <Text style={styles.teacherTopName}>{teacherName}</Text>
            <Text style={styles.teacherTopDept}>{teacherDept} • {selectedShift}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{startDate} to {endDate}</Text>
        </View>

        {filteredDates.map((dateData) => (
          <View key={dateData.date} style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateHeaderText}>{formatDisplayDate(dateData.date)}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.sketchTable}>
                <View style={styles.sketchHeader}>
                  <View style={styles.colPeriod}><Text style={styles.sketchTh}>Period</Text></View>
                  <View style={styles.colTiming}><Text style={styles.sketchTh}>Timing</Text></View>
                  <View style={styles.colLectures}><Text style={styles.sketchTh}>Lectures</Text></View>
                  <View style={styles.colStatus}><Text style={styles.sketchTh}>Status</Text></View>
                </View>

                {PERIODS.map(p => {
                  const lecture = dateData.records.find((r: any) => r.period === p.id);
                  return (
                    <View key={p.id} style={styles.sketchRow}>
                      <View style={styles.colPeriod}><Text style={styles.sketchPeriodNum}>{p.id}</Text></View>
                      <View style={styles.colTiming}><Text style={styles.sketchTimeText}>{p.time}</Text></View>
                      <View style={styles.colLectures}>
                        {lecture ? (
                          <View style={styles.lectureCentered}>
                            <Text style={styles.sketchVal}>{formatRoom(lecture.room)}</Text>
                            <Text style={styles.sketchVal}>{lecture.code}</Text>
                            <Text style={styles.sketchVal}>{lecture.dept} {lecture.sem} sem</Text>
                          </View>
                        ) : (
                          <Text style={styles.sketchFree}>— Free —</Text>
                        )}
                      </View>
                      <View style={styles.colStatus}>{renderStatus(lecture)}</View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ))}

        {/* ✅ Download button - Backend ready hone pe integrate hoga */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleDownload}>
          <MaterialCommunityIcons name="download" size={24} color="#FFF" />
          <Text style={styles.exportBtnText}>Download PDF Report</Text>
        </TouchableOpacity>
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
  resultBadge: { backgroundColor: '#1A237E', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  resultBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  teacherTopCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 0,
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

  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center',
    elevation: 3, borderWidth: 2, borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },

  filterCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 15,
    elevation: 3, alignItems: 'center',
  },
  filterIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 15,
  },
  filterTitle: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  filterSubtitle: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },

  dateRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  dateInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD',
    borderRadius: 10, paddingHorizontal: 10,
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#333' },

  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, gap: 8,
    elevation: 3, width: '100%',
  },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#E8EAF6', padding: 12, borderRadius: 10, marginBottom: 15,
  },
  summaryText: { fontSize: 14, color: '#1A237E', fontWeight: '700' },

  dateSection: { marginBottom: 20 },
  dateHeader: {
    backgroundColor: '#1A237E', paddingVertical: 12, paddingHorizontal: 15,
    borderRadius: 10, marginBottom: 10, elevation: 3,
  },
  dateHeaderText: { fontSize: 14, fontWeight: '800', color: '#FFF' },

  sketchTable: {
    borderWidth: 2, borderColor: '#1A237E', borderRadius: 8,
    overflow: 'hidden', backgroundColor: '#FFF',
  },
  sketchHeader: { flexDirection: 'row', backgroundColor: '#1A237E', paddingVertical: 12 },
  sketchTh: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  colPeriod: { width: 60, alignItems: 'center', justifyContent: 'center' },
  colTiming: { width: 110, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#C5CAE9' },
  colLectures: { width: 140, borderLeftWidth: 1, borderLeftColor: '#C5CAE9', paddingHorizontal: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  colStatus: { width: 130, borderLeftWidth: 1, borderLeftColor: '#C5CAE9', paddingHorizontal: 6, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  sketchRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C5CAE9', minHeight: 80 },
  sketchPeriodNum: { fontSize: 15, fontWeight: '800', color: '#1A237E' },
  sketchTimeText: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },
  lectureCentered: { alignItems: 'center', justifyContent: 'center' },
  sketchVal: { fontSize: 12, color: '#1A237E', fontWeight: '700', marginBottom: 3, textAlign: 'center' },
  sketchFree: { fontSize: 11, color: '#B0BEC5', fontStyle: 'italic', textAlign: 'center' },
  freeStatus: { fontSize: 12, color: '#B0BEC5' },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12,
  },
  statusPillText: { fontSize: 10, fontWeight: '800', flexShrink: 1 },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, gap: 8,
    elevation: 3, marginTop: 10,
  },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});