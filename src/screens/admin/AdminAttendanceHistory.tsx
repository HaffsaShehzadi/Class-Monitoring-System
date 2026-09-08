import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { adminReportService } from '../../services/adminReportService';
import { attendanceService } from '../../services/attendanceService'; // Edit ke liye

const PERIODS = [
  { id: 1, time: '08:30 - 09:15' }, { id: 2, time: '09:15 - 10:00' }, { id: 3, time: '10:00 - 10:45' },
  { id: 4, time: '11:00 - 11:45' }, { id: 5, time: '11:45 - 12:30' }, { id: 6, time: '01:30 - 02:15' }, { id: 7, time: '02:15 - 03:00' },
];

export default function AdminAttendanceHistory({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'department' | 'teacher'>('department');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacherDept, setSelectedTeacherDept] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-05');
  
  const [showHistory, setShowHistory] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSubstitute, setEditSubstitute] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Real data states
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (selectedShift) {
      fetchInitialData();
    }
  }, [selectedShift]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [deptsData, teachersData] = await Promise.all([
        adminReportService.getDepartments(),
        adminReportService.getTeachers()
      ]);
      setDepartments(deptsData);
      setTeachers(teachersData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const getShiftDepartments = () => {
    // Filhal sab departments dikhayenge, shift ka filter backend timetable se aata hai
    return departments.map((d: any) => d.dept_name || d.name);
  };

  const getShiftTeachers = () => {
    // Shift ke mutabiq teachers filter karna (agar duty_assignments se link karna ho toh baad mein enhance ho sakta hai)
    // Filhal sab approved teachers dikhayenge
    return teachers.map((t: any) => ({ name: t.name, dept: t.department, id: t.id }));
  };

  const getFilteredTeachers = () => {
    const teachersList = getShiftTeachers();
    if (!teacherSearch.trim()) return teachersList;
    return teachersList.filter((t: any) => t.name.toLowerCase().includes(teacherSearch.toLowerCase()));
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRoom = (room: string) => `R#${room.replace('R', '')}`;
  const uniqueDaysCount = new Set(filteredData.map((r: any) => r.date)).size;

  const handleDownload = async () => {
    try {
      if (filteredData.length === 0) {
        Alert.alert('No Data', 'No attendance records to download');
        return;
      }

      const title = viewMode === 'department'
        ? `${selectedDept} Department - ${selectedShift}`
        : `${selectedTeacher} - ${selectedShift}`;

      const rows = filteredData.map((r: any) => `
        <tr>
          <td>${r.date}</td><td>${r.dept} (${r.sem})</td><td>P${r.period}</td>
          <td>${r.teacher}</td><td>${r.code}</td><td>${r.status}</td><td>${r.substitute || '-'}</td>
        </tr>
      `).join('');

      const html = `
        <html><head><style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { font-size: 18px; color: #1A237E; } p { font-size: 12px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #999; padding: 6px 8px; font-size: 10px; text-align: left; }
          th { background-color: #1A237E; color: #ffffff; }
        </style></head><body>
          <h1>Attendance Report - Class Monitoring System</h1>
          <p><b>${title}</b></p><p>Date Range: ${startDate} to ${endDate}</p>
          <p>Total Records: ${filteredData.length}</p>
          <table><tr><th>Date</th><th>Class</th><th>Period</th><th>Teacher</th><th>Code</th><th>Status</th><th>Substitute</th></tr>
          ${rows}</table>
        </body></html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      }
      Alert.alert('Success', 'PDF report generated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const renderStatus = (record: any) => {
    if (!record) return <Text style={styles.freeStatus}>—</Text>;
    if (record.status === 'Present' || record.status === 'present') {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#E8F5E9' }]}>
          <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
          <Text style={[styles.statusPillText, { color: '#4CAF50' }]}>Present</Text>
        </View>
      );
    }
    if (record.status === 'Absent' || record.status === 'absent') {
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

  const handleCellPress = (record: any) => {
    if (!record) return;
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditSubstitute(record.substitute || '');
    setEditModalVisible(true);
  };

  // ✅ UPDATED: Real backend update ke sath
  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSavingEdit(true);
    try {
      // Backend update call
      await attendanceService.updateAttendance(editingRecord.id, editStatus.toLowerCase(), editSubstitute);
      
      // Local state update for smooth UI
      const updatedData = attendanceData.map(item =>
        item.id === editingRecord.id ? { ...item, status: editStatus, substitute: editStatus === 'Absent' ? editSubstitute : '' } : item
      );
      setAttendanceData(updatedData);
      const updatedFiltered = filteredData.map((r: any) =>
        r.id === editingRecord.id ? { ...r, status: editStatus, substitute: editStatus === 'Absent' ? editSubstitute : '' } : r
      );
      setFilteredData(updatedFiltered);
      setEditModalVisible(false);
      Alert.alert('Updated', `${editingRecord.teacher}'s attendance updated successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update attendance');
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ UPDATED: Real backend search ke sath
  const handleSearch = async () => {
    if (!startDate || !endDate) { Alert.alert('Error', 'Please enter both start and end dates'); return; }
    if (startDate > endDate) { Alert.alert('Error', 'Start date cannot be after end date'); return; }

    setLoading(true);
    try {
      let records = [];
      if (viewMode === 'department') {
        if (!selectedDeptId) { Alert.alert('Error', 'Please select a department'); setLoading(false); return; }
        records = await adminReportService.getDepartmentAttendance(selectedDeptId, startDate, endDate);
      } else {
        if (!selectedTeacherId) { Alert.alert('Error', 'Please select a teacher'); setLoading(false); return; }
        records = await adminReportService.getTeacherAttendance(selectedTeacherId, startDate, endDate);
      }

      if (records.length === 0) { 
        Alert.alert('No Records', 'No attendance records found for this range'); 
        setFilteredData([]);
        setShowHistory(true);
        setLoading(false);
        return; 
      }

      setAttendanceData(records);
      setFilteredData(records);
      setShowHistory(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.shiftContainer}>
          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('1st Shift')}>
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('2nd Shift')}>
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!showHistory) {
    const availableDepts = getShiftDepartments();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedShift(null); setSelectedDept(''); setSelectedTeacher(''); }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - History</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity style={[styles.modeBtn, viewMode === 'department' && styles.modeBtnActive]} onPress={() => { setViewMode('department'); setSelectedTeacher(''); setTeacherSearch(''); }}>
            <Text style={[styles.modeText, viewMode === 'department' && styles.modeTextActive]}>Department Wise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, viewMode === 'teacher' && styles.modeBtnActive]} onPress={() => { setViewMode('teacher'); setSelectedDept(''); }}>
            <Text style={[styles.modeText, viewMode === 'teacher' && styles.modeTextActive]}>Teacher Wise</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.filterCard}>
              <View style={styles.filterIcon}>
                <MaterialCommunityIcons name={viewMode === 'department' ? 'school' : 'account-tie'} size={40} color="#1A237E" />
              </View>
              <Text style={styles.filterTitle}>Search by {viewMode === 'department' ? 'Department' : 'Teacher'}</Text>

              {viewMode === 'department' ? (
                <TouchableOpacity style={styles.selectBtn} onPress={() => setDeptModalVisible(true)}>
                  <Text style={styles.selectBtnText}>{selectedDept || 'Select Department'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.selectBtn} onPress={() => { setTeacherModalVisible(true); setTeacherSearch(''); }}>
                  <Text style={styles.selectBtnText}>{selectedTeacher || 'Select Teacher (Searchable)'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              )}

              <Text style={styles.dateLabel}>Date Range</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>Start Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <TextInput style={styles.dateInput} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} placeholderTextColor="#999" />
                  </View>
                </View>
                <View style={styles.dateCol}>
                  <Text style={styles.dateColLabel}>End Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <TextInput style={styles.dateInput} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} placeholderTextColor="#999" />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
                    <Text style={styles.searchBtnText}>Search History</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={deptModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Department</Text>
                <TouchableOpacity onPress={() => setDeptModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#1A237E" /></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {availableDepts.map((dept: string) => {
                  const deptObj = departments.find((d: any) => (d.dept_name || d.name) === dept);
                  return (
                    <TouchableOpacity key={dept} style={[styles.modalItem, selectedDept === dept && styles.modalItemActive]} onPress={() => { setSelectedDept(dept); setSelectedDeptId(deptObj?.id || null); setDeptModalVisible(false); }}>
                      <Text style={[styles.modalItemText, selectedDept === dept && styles.modalItemTextActive]}>{dept} Department</Text>
                      {selectedDept === dept && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={teacherModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Teacher</Text>
                <TouchableOpacity onPress={() => setTeacherModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#1A237E" /></TouchableOpacity>
              </View>
              <View style={styles.searchInputWrapper}>
                <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                <TextInput style={styles.searchInput} placeholder="Search teacher by name..." value={teacherSearch} onChangeText={setTeacherSearch} placeholderTextColor="#999" />
                {teacherSearch.length > 0 && <TouchableOpacity onPress={() => setTeacherSearch('')}><MaterialCommunityIcons name="close-circle" size={20} color="#999" /></TouchableOpacity>}
              </View>
              <ScrollView style={styles.modalList}>
                {getFilteredTeachers().length === 0 ? (
                  <Text style={styles.emptyModalText}>No teachers found</Text>
                ) : (
                  getFilteredTeachers().map((teacher: any) => (
                    <TouchableOpacity key={teacher.name} style={[styles.modalItem, selectedTeacher === teacher.name && styles.modalItemActive]} onPress={() => { setSelectedTeacher(teacher.name); setSelectedTeacherId(teacher.id); setSelectedTeacherDept(teacher.dept); setTeacherModalVisible(false); }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalItemText, selectedTeacher === teacher.name && styles.modalItemTextActive]}>{teacher.name}</Text>
                        <Text style={{ fontSize: 11, color: selectedTeacher === teacher.name ? '#FFF' : '#999', marginTop: 2 }}>{teacher.dept} Department</Text>
                      </View>
                      {selectedTeacher === teacher.name && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const renderDepartmentHistory = () => {
    const getStatusColor = (status: string) => {
      if (status.toLowerCase() === 'present') return '#4CAF50';
      if (status.toLowerCase() === 'absent') return '#F44336';
      return '#E0E0E0';
    };

    const dateMap: any = {};
    filteredData.forEach(record => {
      if (!dateMap[record.date]) dateMap[record.date] = [];
      dateMap[record.date].push(record);
    });

    const sortedDates = Object.keys(dateMap)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({ date, records: dateMap[date], markedBy: dateMap[date][0].markedBy }));

    const displaySemesters = ['2nd', '4th', '6th', '8th'];

    return (
      <View style={styles.historyContainer}>
        {sortedDates.map((dateData) => (
          <View key={dateData.date} style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <View style={styles.dateHeaderLeft}>
                <Text style={styles.dateHeaderText}>{formatDisplayDate(dateData.date)}</Text>
              </View>
              <View style={styles.markedByBadge}>
                <Text style={styles.markedByText}>Marked by {dateData.markedBy}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.grid}>
                <View style={styles.row}>
                  <View style={styles.cornerCell}><Text style={styles.cornerText}>Sem / Period</Text></View>
                  {PERIODS.map(p => (
                    <View key={p.id} style={styles.periodHeaderCell}>
                      <Text style={styles.periodNum}>P{p.id}</Text>
                      <Text style={styles.periodTime}>{p.time}</Text>
                    </View>
                  ))}
                </View>

                {displaySemesters.map(sem => (
                  <View key={sem} style={styles.row}>
                    <View style={styles.deptSemCell}>
                      <Text style={styles.deptText}>{selectedDept}</Text>
                      <Text style={styles.semText}>{sem} sem</Text>
                    </View>
                    {PERIODS.map(p => {
                      const record = dateData.records.find((r: any) => r.sem === sem && r.period === p.id);
                      return (
                        <TouchableOpacity key={p.id} style={[styles.dataCell, record ? { backgroundColor: '#FFF' } : styles.emptyCell]} onPress={() => handleCellPress(record)} activeOpacity={0.7} disabled={!record}>
                          {record ? (
                            <View style={styles.cellContent}>
                              <Text style={styles.cellTeacher} numberOfLines={1}>{record.teacher}</Text>
                              <Text style={styles.cellCode} numberOfLines={1}>{record.code}</Text>
                              <View style={[styles.statusButton, { backgroundColor: getStatusColor(record.status) }]}>
                                <Text style={styles.statusText}>{record.status}</Text>
                              </View>
                              {record.status.toLowerCase() === 'absent' && record.substitute ? (
                                <Text style={styles.substituteText}>→ {record.substitute}</Text>
                              ) : null}
                              <View style={styles.cellEditIcon}><MaterialCommunityIcons name="pencil" size={10} color="#1A237E" /></View>
                            </View>
                          ) : (
                            <Text style={styles.emptyText}>No Class</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  const renderTeacherHistory = () => {
    const dateMap: any = {};
    filteredData.forEach(record => {
      if (!dateMap[record.date]) dateMap[record.date] = [];
      dateMap[record.date].push(record);
    });

    const sortedDates = Object.keys(dateMap)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({ date, records: dateMap[date] }));

    return (
      <View style={styles.historyContainer}>
        {sortedDates.map((dateData) => (
          <View key={dateData.date} style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <View style={styles.dateHeaderLeft}>
                <Text style={styles.dateHeaderText}>{formatDisplayDate(dateData.date)}</Text>
              </View>
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
                    <TouchableOpacity key={p.id} style={styles.sketchRow} onPress={() => handleCellPress(lecture)} disabled={!lecture}>
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
                      <View style={styles.colStatus}>
                        {renderStatus(lecture)}
                        {lecture && (<View style={styles.editIconTable}><MaterialCommunityIcons name="pencil" size={12} color="#1A237E" /></View>)}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHistory(false)}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedShift} - History</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{uniqueDaysCount} Days</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        <View style={styles.adminInfoCard}>
          <Text style={styles.adminName}>{viewMode === 'department' ? `${selectedDept} Department` : selectedTeacher}</Text>
          <Text style={styles.adminSub}>
            {viewMode === 'department' ? `${selectedShift}` : `${selectedTeacherDept} Department • ${selectedShift}`}
          </Text>
          <View style={styles.dateRangeLine}>
            <Text style={styles.dateRangeText}>
              {startDate === endDate ? formatDisplayDate(startDate) : `${startDate} to ${endDate}`}
            </Text>
          </View>
        </View>

        {loading && filteredData.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading records...</Text>
          </View>
        ) : (
          viewMode === 'department' ? renderDepartmentHistory() : renderTeacherHistory()
        )}

        {filteredData.length > 0 && (
          <TouchableOpacity style={styles.exportBtn} onPress={handleDownload}>
            <MaterialCommunityIcons name="download" size={24} color="#FFF" />
            <Text style={styles.exportBtnText}>Download PDF Report</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.editModalFullOverlay}>
            <View style={styles.editModalFullContent}>
              <View style={styles.editModalFullHeader}>
                <Text style={styles.editModalFullTitle}>Edit Attendance</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}><Text style={styles.editModalCloseIcon}>✕</Text></TouchableOpacity>
              </View>
              {editingRecord && (
                <ScrollView style={styles.editModalFullBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
                  <View style={styles.editInfo}>
                    <Text style={styles.editLabel}>Teacher:</Text>
                    <Text style={styles.editValue}>{editingRecord.teacher}</Text>
                    <Text style={styles.editLabel}>Subject:</Text>
                    <Text style={styles.editValue}>{editingRecord.code}</Text>
                    <Text style={styles.editLabel}>Date:</Text>
                    <Text style={styles.editValue}>{formatDisplayDate(editingRecord.date)}</Text>
                    <Text style={styles.editLabel}>Period:</Text>
                    <Text style={styles.editValue}>Period {editingRecord.period}</Text>
                    <Text style={styles.editLabel}>Department:</Text>
                    <Text style={styles.editValue}>{editingRecord.dept} - {editingRecord.sem} sem</Text>
                    <Text style={styles.editLabel}>Marked By:</Text>
                    <Text style={styles.editValue}>{editingRecord.markedBy}</Text>
                  </View>
                  <Text style={styles.editSectionTitle}>Update Status</Text>
                  <View style={styles.statusOptions}>
                    <TouchableOpacity style={[styles.statusOption, editStatus.toLowerCase() === 'present' && styles.statusOptionPresent]} onPress={() => setEditStatus('Present')}>
                      <MaterialCommunityIcons name="check-circle" size={24} color={editStatus.toLowerCase() === 'present' ? '#FFF' : '#4CAF50'} />
                      <Text style={[styles.statusOptionText, editStatus.toLowerCase() === 'present' && { color: '#FFF' }]}>Present</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statusOption, editStatus.toLowerCase() === 'absent' && styles.statusOptionAbsent]} onPress={() => setEditStatus('Absent')}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={editStatus.toLowerCase() === 'absent' ? '#FFF' : '#F44336'} />
                      <Text style={[styles.statusOptionText, editStatus.toLowerCase() === 'absent' && { color: '#FFF' }]}>Absent</Text>
    </TouchableOpacity>
                  </View>
                  {editStatus.toLowerCase() === 'absent' && (
                    <View style={styles.substituteSection}>
                      <Text style={styles.editLabel}>Substitute Teacher Name (Optional)</Text>
                      <TextInput style={styles.substituteInput} placeholder="Enter substitute teacher name" value={editSubstitute} onChangeText={setEditSubstitute} placeholderTextColor="#999" />
                    </View>
                  )}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveEdit} disabled={savingEdit}>
                      {savingEdit ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                    </TouchableOpacity>
                  </View>
                  <View style={{ height: 100 }} />
                </ScrollView>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ STYLES: Bilkul same jaise aapke original code mein the (Zero UI changes)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1A237E' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  resultBadge: { backgroundColor: '#1A237E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  resultBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center', elevation: 3, borderWidth: 2, borderColor: '#E8EAF6' },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666' },
  modeSelector: { flexDirection: 'row', margin: 15, marginBottom: 10, backgroundColor: '#FFF', borderRadius: 10, padding: 4, elevation: 2 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1A237E' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#FFF', fontWeight: '700' },
  filterCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 3, alignItems: 'center' },
  filterIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  filterTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', marginBottom: 20 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 15 },
  selectBtnText: { flex: 1, fontSize: 14, color: '#1A237E', fontWeight: '700' },
  dateLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 10, alignSelf: 'flex-start' },
  dateRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  dateCol: { flex: 1 },
  dateColLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginBottom: 4 },
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 10 },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#333' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, gap: 8, elevation: 3, width: '100%' },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  adminInfoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  adminName: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  adminSub: { fontSize: 13, color: '#666', marginTop: 3 },
  dateRangeLine: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E8EAF6' },
  dateRangeText: { fontSize: 13, color: '#1A237E', fontWeight: '700' },
  historyContainer: { flex: 1 },
  grid: { borderWidth: 1, borderColor: '#90A4AE', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF' },
  row: { flexDirection: 'row' },
  cornerCell: { width: 90, height: 55, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  cornerText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  periodHeaderCell: { width: 115, height: 55, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  periodNum: { fontSize: 13, fontWeight: '800', color: '#1A237E' },
  periodTime: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginTop: 2 },
  deptSemCell: { width: 90, minHeight: 100, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE' },
  deptText: { fontSize: 13, fontWeight: '800', color: '#1A237E', textAlign: 'center' },
  semText: { fontSize: 11, color: '#546E7A', fontWeight: '600' },
  dataCell: { width: 115, minHeight: 100, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#90A4AE', padding: 6 },
  emptyCell: { backgroundColor: '#FAFAFA' },
  emptyText: { fontSize: 10, color: '#B0BEC5', fontWeight: '600' },
  cellContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  cellTeacher: { fontSize: 10, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 2 },
  cellCode: { fontSize: 9, color: '#546E7A', textAlign: 'center', marginBottom: 4 },
  statusButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  substituteText: { fontSize: 8, color: '#2196F3', marginTop: 2, fontWeight: '600' },
  cellEditIcon: { position: 'absolute', top: 0, right: 0 },
  dateSection: { marginBottom: 20 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A237E', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  dateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dateHeaderText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  markedByBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  markedByText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  sketchTable: { borderWidth: 2, borderColor: '#1A237E', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFF' },
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
  editIconTable: { position: 'absolute', top: 5, right: 5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  statusPillText: { fontSize: 10, fontWeight: '800', flexShrink: 1 },
  freeStatus: { fontSize: 12, color: '#B0BEC5' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, gap: 8, elevation: 3, marginTop: 10 },
  exportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '85%', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1A237E', flex: 1 },
  modalList: { maxHeight: 300, padding: 20 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8 },
  modalItemActive: { backgroundColor: '#1A237E' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemTextActive: { color: '#FFF' },
  emptyModalText: { textAlign: 'center', color: '#999', padding: 20, fontSize: 14 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, margin: 20, marginBottom: 10, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },
  editModalFullOverlay: { flex: 1, backgroundColor: '#F5F5F5' },
  editModalFullContent: { flex: 1 },
  editModalFullHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, backgroundColor: '#1A237E' },
  editModalFullTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  editModalCloseIcon: { fontSize: 24, color: '#FFF', fontWeight: '700' },
  editModalFullBody: { flex: 1, padding: 20 },
  editInfo: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 2 },
  editLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 8 },
  editValue: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  editSectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', backgroundColor: '#FFF' },
  statusOptionPresent: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  statusOptionAbsent: { backgroundColor: '#F44336', borderColor: '#F44336' },
  statusOptionText: { fontSize: 14, fontWeight: '700', color: '#333' },
  substituteSection: { marginBottom: 20 },
  substituteInput: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14, marginTop: 8 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4CAF50' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});