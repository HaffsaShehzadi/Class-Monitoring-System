import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { detectBackend } from '../../services/ipConfig';
import { tokenStorage } from '../../services/tokenStorage';
import { attendanceService } from '../../services/attendanceService';

const PERIODS_1ST = [
  { id: 1, time: '08:00 AM - 08:45 AM' },
  { id: 2, time: '08:45 AM - 09:30 AM' },
  { id: 3, time: '09:30 AM - 10:15 AM' },
  { id: 4, time: '10:15 AM - 11:00 AM' },
  { id: 5, time: '11:00 AM - 11:45 AM' },
  { id: 6, time: '11:45 AM - 12:30 PM' },
  { id: 7, time: '12:30 PM - 01:15 PM' },
];

const PERIODS_2ND = [
  { id: 1, time: '01:00 PM - 01:45 PM' },
  { id: 2, time: '01:45 PM - 02:30 PM' },
  { id: 3, time: '02:30 PM - 03:15 PM' },
  { id: 4, time: '03:15 PM - 04:00 PM' },
  { id: 5, time: '04:00 PM - 04:45 PM' },
  { id: 6, time: '04:45 PM - 05:30 PM' },
  { id: 7, time: '05:30 PM - 06:15 PM' },
];

const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  if (time24.toUpperCase().includes('AM') || time24.toUpperCase().includes('PM')) {
    return time24;
  }
  const timeWithoutSeconds = time24.split(':')[0] + ':' + (time24.split(':')[1] || '00');
  const [hours, minutes] = timeWithoutSeconds.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function TeacherAttendanceHistory({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState('');
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const [filteredDates, setFilteredDates] = useState<any[]>([]);
  const [teacherInfo, setTeacherInfo] = useState({ name: 'Teacher', department: 'N/A' });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false); 

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
    const cleanDate = String(dateStr).split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return cleanDate;
  };

  const handleDownload = async () => {
    try {
      if (filteredDates.length === 0) {
        Alert.alert('No Data', 'No attendance records to download');
        return;
      }

      setDownloading(true);
      
      const BACKEND_URL = await detectBackend();
      const token = await tokenStorage.getToken();
      const url = `${BACKEND_URL}/api/reports/teacher/my-history/pdf?startDate=${startDate}&endDate=${endDate}`;
      
      if (Platform.OS === 'web') {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to download PDF from server');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Teacher_Report_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        Alert.alert('Success', 'PDF downloaded successfully!');
        return;
      }

      const fileUri = (FileSystem as any).documentDirectory + `Teacher_Report_${Date.now()}.pdf`;

      const result = await FileSystem.downloadAsync(url, fileUri, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (result.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri);
        } else {
          Alert.alert('Success', `PDF saved at: ${result.uri}`);
        }
      } else {
        throw new Error('Failed to download PDF from server');
      }

    } catch (e: any) {
      console.error('❌ PDF Download Error:', e);
      Alert.alert('Error', `Failed to download PDF: ${e.message}`);
    } finally {
      setDownloading(false);
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
      const subName = record.substitute || record.substitute_teacher_name;
      return (
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.statusPill, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.statusPillText, { color: '#F44336' }]}>Absent</Text>
          </View>
          {subName ? (
            <Text style={{ fontSize: 10, color: '#1976D2', marginTop: 3, fontWeight: '700', textAlign: 'center' }}>
              → {subName}
            </Text>
          ) : null}
        </View>
      );
    }
    return null;
  };

  const formatRoom = (room: any) => room ? (String(room).startsWith('R#') ? String(room) : `R#${String(room).replace(/^R#?/i, '')}`) : 'N/A';

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
      const history = await attendanceService.getMyHistory(startDate, endDate);
      
      const myAttendance = (history || []).filter((a: any) => {
        const recDate = String(a.date || '').split('T')[0];
        const inDateRange = recDate >= startDate && recDate <= endDate;
        const matchesShift = !selectedShift || !a.shift || a.shift.trim().toLowerCase() === selectedShift.trim().toLowerCase();
        return inDateRange && matchesShift;
      });

      const dateMap: any = {};
      myAttendance.forEach((record: any) => {
        const cleanDate = String(record.date || '').split('T')[0];
        if (!dateMap[cleanDate]) dateMap[cleanDate] = [];
        dateMap[cleanDate].push({ ...record, date: cleanDate });
      });

      const sortedDates = Object.keys(dateMap)
        .sort((a, b) => b.localeCompare(a))
        .map(date => {
          const parts = date.split('-');
          let dayName = dateMap[date][0]?.day;
          if (!dayName && parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          }
          return { 
            date, 
            day: dayName || 'Day', 
            records: dateMap[date] 
          };
        });

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
            <View style={styles.searchCard}>
              <Text style={styles.label}>Shift</Text>
              <TouchableOpacity style={styles.dropdownWrapper} onPress={() => setShiftModalVisible(true)}>
                <Text style={[styles.dropdownText, !selectedShift && styles.placeholderText]}>
                  {selectedShift || 'Select Shift'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>

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

  const currentPeriods = selectedShift === '2nd Shift' ? PERIODS_2ND : PERIODS_1ST;

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

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
        <View style={styles.centeredWrapper}>
          <View style={styles.teacherTopCard}>
            <Text style={styles.teacherTopName}>{teacherName}</Text>
            <Text style={styles.teacherTopDept}>{teacherDept} • {selectedShift}</Text>
            <View style={styles.dateRangeLine}>
              <Text style={styles.dateRangeText}>{startDate} to {endDate}</Text>
            </View>
          </View>

          {loading && filteredDates.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={{ marginTop: 10, color: '#666' }}>Loading history...</Text>
            </View>
          ) : filteredDates.length === 0 ? (
            <View style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>No Attendance Records Found</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={Platform.OS !== 'web'}
                contentContainerStyle={{ width: '100%', minWidth: 650 }}
              >
                <View style={styles.sketchTable}>
                  <View style={styles.sketchHeader}>
                    <View style={styles.colPeriod}><Text style={styles.sketchTh}>Period</Text></View>
                    <View style={styles.colTiming}><Text style={styles.sketchTh}>Timing</Text></View>
                    <View style={styles.colLectures}><Text style={styles.sketchTh}>Lectures</Text></View>
                    <View style={styles.colStatus}><Text style={styles.sketchTh}>Status</Text></View>
                  </View>
                  {currentPeriods.map(p => (
                    <View key={p.id} style={styles.sketchRow}>
                      <View style={styles.colPeriod}><Text style={styles.sketchPeriodNum}>{p.id}</Text></View>
                      <View style={styles.colTiming}><Text style={styles.sketchTimeText}>{p.time}</Text></View>
                      <View style={styles.colLectures}><Text style={styles.sketchFree}>— No Record —</Text></View>
                      <View style={styles.colStatus}><Text style={styles.freeStatus}>—</Text></View>
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

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={Platform.OS !== 'web'}
                  contentContainerStyle={{ width: '100%', minWidth: 650 }}
                >
                  <View style={styles.sketchTable}>
                    <View style={styles.sketchHeader}>
                      <View style={styles.colPeriod}><Text style={styles.sketchTh}>Period</Text></View>
                      <View style={styles.colTiming}><Text style={styles.sketchTh}>Timing</Text></View>
                      <View style={styles.colLectures}><Text style={styles.sketchTh}>Lectures</Text></View>
                      <View style={styles.colStatus}><Text style={styles.sketchTh}>Status</Text></View>
                    </View>

                    {currentPeriods.map(p => {
                      const lecture = dateData.records.find((r: any) => Number(r.period) === Number(p.id));
                      return (
                        <View key={p.id} style={styles.sketchRow}>
                          <View style={styles.colPeriod}><Text style={styles.sketchPeriodNum}>{p.id}</Text></View>
                          <View style={styles.colTiming}>
                            <Text style={styles.sketchTimeText}>
                              {lecture && lecture.start_time && lecture.end_time 
                                ? `${formatTime12Hour(lecture.start_time)} - ${formatTime12Hour(lecture.end_time)}` 
                                : p.time}
                            </Text>
                          </View>
                          <View style={styles.colLectures}>
                            {lecture ? (
                              <View style={styles.lectureCentered}>
                                <Text style={styles.sketchRoom}>{formatRoom(lecture.room || lecture.room_no)}</Text>
                                <Text style={styles.sketchCode}>{lecture.code || lecture.subject_code}</Text>
                                <Text style={styles.sketchDept}>{lecture.dept || lecture.dept_name} {lecture.sem || lecture.semester} sem</Text>
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
            <TouchableOpacity 
              style={styles.exportBtn} 
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.exportBtnText}>Download PDF Report</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF', 
    paddingTop: Platform.OS === 'web' ? 16 : 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 2, 
    borderBottomColor: '#1A237E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  resultBadge: { backgroundColor: '#1A237E', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  resultBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  scrollContent: { 
    padding: 20, 
    paddingBottom: 40, 
    flexGrow: 1, 
    justifyContent: 'center',
  },
  centeredWrapper: {
    width: '100%',
    maxWidth: 950,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
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

  dateSection: { marginBottom: 20, width: '100%' },
  dateHeader: {
    backgroundColor: '#1A237E', paddingVertical: 12, paddingHorizontal: 15,
    borderRadius: 10, marginBottom: 10, elevation: 3, width: '100%',
  },
  dateHeaderText: { fontSize: 14, fontWeight: '800', color: '#FFF' },

  sketchTable: {
    borderWidth: 2, borderColor: '#1A237E', borderRadius: 8,
    overflow: 'hidden', backgroundColor: '#FFF', width: '100%',
  },
  sketchHeader: { flexDirection: 'row', backgroundColor: '#1A237E', paddingVertical: 14 },
  sketchTh: { color: '#FFF', fontWeight: '800', fontSize: 14, textAlign: 'center', flex: 1 },
  colPeriod: { width: 70, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#C5CAE9' },
  colTiming: { width: 130, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#C5CAE9' },
  colLectures: { flex: 1, minWidth: 180, borderRightWidth: 1, borderRightColor: '#C5CAE9', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  colStatus: { width: 130, paddingHorizontal: 6, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  sketchRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C5CAE9', minHeight: 85 },
  sketchPeriodNum: { fontSize: 16, fontWeight: '800', color: '#1A237E' },
  sketchTimeText: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  lectureCentered: { alignItems: 'center', justifyContent: 'center' },
  sketchRoom: { fontSize: 12.5, color: '#D32F2F', fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  sketchCode: { fontSize: 13, color: '#1A237E', fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  sketchDept: { fontSize: 11.5, color: '#546E7A', fontWeight: '600', textAlign: 'center' },
  sketchFree: { fontSize: 12, color: '#90A4AE', fontStyle: 'italic', textAlign: 'center' },
  freeStatus: { fontSize: 12, color: '#B0BEC5', textAlign: 'center' },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12,
  },
  statusPillText: { fontSize: 11, fontWeight: '800', flexShrink: 1 },

  exportBtn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#4CAF50', 
    paddingVertical: 14, 
    borderRadius: 12, 
    gap: 8,
    elevation: 3, 
    marginTop: 15,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

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