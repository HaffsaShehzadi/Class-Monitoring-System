import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { tokenStorage } from '../../services/tokenStorage';
import { attendanceService } from '../../services/attendanceService'; // ✅ Real API import

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' },
  { id: 2, time: '09:15 - 10:00' },
  { id: 3, time: '10:00 - 10:45' },
  { id: 4, time: '11:00 - 11:45' },
  { id: 5, time: '11:45 - 12:30' },
  { id: 6, time: '01:30 - 02:15' },
  { id: 7, time: '02:15 - 03:00' },
];

export default function TeacherAttendanceHistory({ onBack }: any) {
  const [step, setStep] = useState<'shift' | 'range' | 'history'>('shift');
  const [selectedShift, setSelectedShift] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-04');
  const [filteredDates, setFilteredDates] = useState<any[]>([]);
  
  // ✅ NEW: Real data states
  const [teacherInfo, setTeacherInfo] = useState({ name: 'Teacher', department: 'N/A' });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch real user info on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await tokenStorage.getUser();
      if (user) {
        setTeacherInfo({ name: user.name, department: user.department || 'N/A' });
      }
    };
    loadUser();
  }, []);

  const teacherName = teacherInfo.name;
  const teacherDept = teacherInfo.department;

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDownload = async () => {
    try {
      if (filteredDates.length === 0) {
        Alert.alert('No Data', 'No attendance records to download');
        return;
      }

      const allRecords: any[] = [];
      filteredDates.forEach(dateData => {
        dateData.records.forEach((r: any) => {
          const period = PERIODS.find(p => p.id === r.period);
          allRecords.push({
            date: r.date,
            day: r.day,
            period: r.period,
            timing: period ? period.time : (r.start_time ? `${r.start_time} - ${r.end_time}` : ''),
            room: r.room || r.room_no || 'N/A',
            code: r.code || r.subject_code || 'N/A',
            class: `${r.dept || r.dept_name} (${r.sem || r.semester})`,
            status: r.status,
            substitute: r.substitute || r.substitute_teacher_name || '-'
          });
        });
      });

      const rows = allRecords.map((r: any) => `
        <tr>
          <td>${r.date}</td>
          <td>${r.day}</td>
          <td>P${r.period}</td>
          <td>${r.timing}</td>
          <td>${r.room}</td>
          <td>${r.code}</td>
          <td>${r.class}</td>
          <td>${r.status}</td>
          <td>${r.substitute}</td>
        </tr>
      `).join('');

      const html = `
        <html>
        <head><style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { font-size: 18px; color: #1A237E; margin-bottom: 5px; }
          p { font-size: 12px; color: #555; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #999; padding: 6px 8px; font-size: 10px; text-align: left; }
          th { background-color: #1A237E; color: #ffffff; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style></head>
        <body>
          <h1>Teacher Attendance Report</h1>
          <p><b>Teacher:</b> ${teacherName}</p>
          <p><b>Department:</b> ${teacherDept}</p>
          <p><b>Shift:</b> ${selectedShift}</p>
          <p><b>Date Range:</b> ${startDate} to ${endDate}</p>
          <p><b>Total Days:</b> ${filteredDates.length}</p>
          <p><b>Total Records:</b> ${allRecords.length}</p>
          <table>
            <tr>
              <th>Date</th><th>Day</th><th>Period</th><th>Timing</th>
              <th>Room</th><th>Code</th><th>Class</th><th>Status</th><th>Substitute</th>
            </tr>
            ${rows}
          </table>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
      Alert.alert('Success', 'PDF report generated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const renderStatus = (record: any) => {
    if (!record) return <Text style={styles.freeStatus}>—</Text>;
    const status = record.status ? record.status.toLowerCase() : '';
    
    if (status === 'present') {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statusPillText, { color: '#4CAF50' }]}>Present</Text>
        </View>
      );
    }
    if (status === 'late') {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.statusPillText, { color: '#FF9800' }]}>Late</Text>
        </View>
      );
    }
    if (status === 'absent') {
      if (record.substitute || record.substitute_teacher_name) {
        return (
          <View style={[styles.statusPill, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.statusPillText, { color: '#2196F3' }]} numberOfLines={2}>
              Sub: {record.substitute || record.substitute_teacher_name}
            </Text>
          </View>
        );
      }
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.statusPillText, { color: '#F44336' }]}>Absent</Text>
        </View>
      );
    }
    return null;
  };

  const formatRoom = (room: string) => room ? `R#${room.replace('R', '')}` : 'N/A';

  // ✅ UPDATED: Real backend API call ke sath
  const handleSearch = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter both start and end dates (YYYY-MM-DD)');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      // ✅ Fetch real history from backend
      const history = await attendanceService.getMyHistory();
      
      // ✅ Filter by date range (and shift if backend returns it)
      const myAttendance = history.filter((a: any) => 
        a.date >= startDate && a.date <= endDate
        // Note: Agar backend shift return karta hai toh: && a.shift === selectedShift
      );

      if (myAttendance.length === 0) {
        Alert.alert('No Records', 'No attendance records found for this date range');
        setLoading(false);
        return;
      }

      const dateMap: any = {};
      myAttendance.forEach((record: any) => {
        if (!dateMap[record.date]) dateMap[record.date] = [];
        dateMap[record.date].push(record);
      });

      const sortedDates = Object.keys(dateMap)
        .sort((a, b) => b.localeCompare(a))
        .map(date => ({ 
          date, 
          day: dateMap[date][0].day || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }), 
          records: dateMap[date] 
        }));

      setFilteredDates(sortedDates);
      setStep('history');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'history') setStep('range');
    else if (step === 'range') setStep('shift');
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

  // STEP 2: Date Range
  if (step === 'range') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Attendance History</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.rangeContainer}>
          <View style={styles.filterCard}>
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

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.searchBtnText}>Search History</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // STEP 3: History Table
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{filteredDates.length} Days</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        <View style={styles.teacherTopCard}>
          <Text style={styles.teacherTopName}>{teacherName}</Text>
          <Text style={styles.teacherTopDept}>{teacherDept} • {selectedShift}</Text>
          <View style={styles.dateRangeLine}>
            <Text style={styles.dateRangeText}>{startDate} to {endDate}</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading history...</Text>
          </View>
        ) : (
          filteredDates.map((dateData) => (
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
                        <View style={styles.colTiming}>
                          <Text style={styles.sketchTimeText}>
                            {lecture ? (lecture.start_time ? `${lecture.start_time} - ${lecture.end_time}` : p.time) : p.time}
                          </Text>
                        </View>
                        <View style={styles.colLectures}>
                          {lecture ? (
                            <View style={styles.lectureCentered}>
                              <Text style={styles.sketchVal}>{formatRoom(lecture.room || lecture.room_no)}</Text>
                              <Text style={styles.sketchVal}>{lecture.code || lecture.subject_code}</Text>
                              <Text style={styles.sketchVal}>{lecture.dept || lecture.dept_name} {lecture.sem || lecture.semester} sem</Text>
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
          ))
        )}

        {filteredDates.length > 0 && (
          <TouchableOpacity style={styles.exportBtn} onPress={handleDownload}>
            <Text style={styles.exportBtnText}>Download PDF Report</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ STYLES: Bilkul same jaise aapke original code mein the
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 2, borderBottomColor: '#1A237E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  resultBadge: { backgroundColor: '#1A237E', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  resultBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

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

  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center',
    elevation: 3, borderWidth: 2, borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },

  rangeContainer: { flex: 1, justifyContent: 'center', padding: 15 },
  filterCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    elevation: 3, alignItems: 'center',
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