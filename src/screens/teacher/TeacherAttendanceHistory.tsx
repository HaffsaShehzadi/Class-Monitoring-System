import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { tokenStorage } from '../../services/tokenStorage';
import { attendanceService } from '../../services/attendanceService';

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
  const [selectedShift, setSelectedShift] = useState('');
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const [filteredDates, setFilteredDates] = useState<any[]>([]);
  const [teacherInfo, setTeacherInfo] = useState({ name: 'Teacher', department: 'N/A' });
  const [loading, setLoading] = useState(false);

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
    if (!dateStr) return '';
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

  const handleSearch = async () => {
    if (!selectedShift) {
      Alert.alert('Error', 'Please select a shift');
      return;
    }
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('Error', 'Please enter both start and end dates (YYYY-MM-DD)');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      const history = await attendanceService.getMyHistory();
      
      const myAttendance = history.filter((a: any) => 
        a.date >= startDate && a.date <= endDate
      );

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
      setShowHistory(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (showHistory) {
      setShowHistory(false);
      setFilteredDates([]);
    } else {
      onBack();
    }
  };

  // ✅ SEARCH SCREEN WITH CENTERED CARD
  if (!showHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ✅ CENTERED WHITE CARD */}
            <View style={styles.searchCard}>
              
              {/* 1. Shift Dropdown */}
              <Text style={styles.label}>Shift</Text>
              <TouchableOpacity style={styles.dropdownWrapper} onPress={() => setShiftModalVisible(true)}>
                <Text style={[styles.dropdownText, !selectedShift && styles.placeholderText]}>
                  {selectedShift || 'Select Shift'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>

              {/* 2. Date Range */}
              <Text style={styles.label}>Date Range</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>Start Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="YYYY-MM-DD" 
                      value={startDate} 
                      onChangeText={setStartDate} 
                      placeholderTextColor="#999" 
                    />
                  </View>
                </View>
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>End Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="YYYY-MM-DD" 
                      value={endDate} 
                      onChangeText={setEndDate} 
                      placeholderTextColor="#999" 
                    />
                  </View>
                </View>
              </View>

              {/* 3. Search Button */}
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
                    <Text style={styles.searchBtnText}>Search History</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Shift Selection Modal */}
        <Modal visible={shiftModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Shift</Text>
                <TouchableOpacity onPress={() => setShiftModalVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {['1st Shift', '2nd Shift'].map(shift => (
                  <TouchableOpacity 
                    key={shift} 
                    style={[styles.modalItem, selectedShift === shift && styles.modalItemActive]} 
                    onPress={() => { setSelectedShift(shift); setShiftModalVisible(false); }}
                  >
                    <Text style={[styles.modalItemText, selectedShift === shift && styles.modalItemTextActive]}>
                      {shift}
                    </Text>
                    {selectedShift === shift && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ✅ HISTORY TABLE SCREEN (Same as before)
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
        ) : filteredDates.length === 0 ? (
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateHeaderText}>No Attendance Records Found</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.sketchTable}>
                <View style={styles.sketchHeader}>
                  <View style={styles.colPeriod}><Text style={styles.sketchTh}>Period</Text></View>
                  <View style={styles.colTiming}><Text style={styles.sketchTh}>Timing</Text></View>
                  <View style={styles.colLectures}><Text style={styles.sketchTh}>Lectures</Text></View>
                  <View style={styles.colStatus}><Text style={styles.sketchTh}>Status</Text></View>
                </View>

                {PERIODS.map(p => (
                  <View key={p.id} style={styles.sketchRow}>
                    <View style={styles.colPeriod}><Text style={styles.sketchPeriodNum}>{p.id}</Text></View>
                    <View style={styles.colTiming}>
                      <Text style={styles.sketchTimeText}>{p.time}</Text>
                    </View>
                    <View style={styles.colLectures}>
                      <Text style={styles.sketchFree}>— No Record —</Text>
                    </View>
                    <View style={styles.colStatus}>
                      <Text style={styles.freeStatus}>—</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
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

// ✅ STYLES WITH CENTERED CARD DESIGN
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

  // ✅ CENTERED CARD LAYOUT
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40, 
    flexGrow: 1, 
    justifyContent: 'center',
  },
  searchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  label: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  
  dropdownWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 20,
  },
  dropdownText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  placeholderText: { color: '#999', fontWeight: '400' },

  dateLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  dateRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 },
  dateCol: { flex: 1 },
  dateColLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginBottom: 6 },
  dateInputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', 
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    minHeight: 44,
  },
  dateInput: { flex: 1, fontSize: 13, color: '#333', paddingVertical: 0 },

  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10, gap: 8,
    elevation: 3, width: '100%', marginTop: 8,
  },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // History Screen Styles (Same as before)
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

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '70%', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1A237E', flex: 1 },
  closeIcon: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
  modalList: { maxHeight: 300, padding: 20 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8 },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },
});