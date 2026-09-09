import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView } from 'react-native';
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

const SEMESTERS = ['All', '2nd', '4th', '6th', '8th'];

const SHIFT_DEPARTMENTS = [
  { name: 'IT', shift: '1st Shift' },
  { name: 'BSCS', shift: '1st Shift' },
  { name: 'Math', shift: '2nd Shift' },
  { name: 'Physics', shift: '2nd Shift' },
];

const SHIFT_TEACHERS = [
  { name: 'Hafiz Abdul Rehman', shift: '1st Shift' },
  { name: 'Mohsin Raza', shift: '1st Shift' },
  { name: 'Hasan Raza', shift: '1st Shift' },
  { name: 'Asif Iqbal', shift: '1st Shift' },
  { name: 'Ahmad Ali', shift: '2nd Shift' },
  { name: 'Hira Afzal', shift: '2nd Shift' },
  { name: 'M. Kamran', shift: '2nd Shift' },
];

const MOCK_ATTENDANCE = [
  { id: 1, date: '2026-08-01', dept: 'IT', sem: '2nd', day: 'Saturday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', room: 'R39', status: 'Present', substitute: '', markedBy: 'Ali Hassan' },
  { id: 2, date: '2026-08-01', dept: 'IT', sem: '2nd', day: 'Saturday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', room: 'R38', status: 'Absent', substitute: 'Ali Khan', markedBy: 'Ali Hassan' },
  { id: 3, date: '2026-08-01', dept: 'IT', sem: '4th', day: 'Saturday', period: 1, teacher: 'Hasan Raza', code: 'CC-213L', room: 'R39', status: 'Present', substitute: '', markedBy: 'Ali Hassan' },
  { id: 4, date: '2026-08-01', dept: 'IT', sem: '4th', day: 'Saturday', period: 2, teacher: 'Asif Iqbal', code: 'CC-311L', room: 'R60', status: 'Absent', substitute: '', markedBy: 'Ali Hassan' },
  { id: 5, date: '2026-08-03', dept: 'IT', sem: '2nd', day: 'Monday', period: 1, teacher: 'Hafiz Abdul Rehman', code: 'UE-272', room: 'R39', status: 'Present', substitute: '', markedBy: 'Ahmad Ali' },
  { id: 6, date: '2026-08-03', dept: 'IT', sem: '2nd', day: 'Monday', period: 2, teacher: 'Mohsin Raza', code: 'GENG-201', room: 'R38', status: 'Absent', substitute: '', markedBy: 'Ahmad Ali' },
  { id: 7, date: '2026-08-04', dept: 'Math', sem: '2nd', day: 'Tuesday', period: 1, teacher: 'Ahmad Ali', code: 'MATH-201', room: 'R21', status: 'Present', substitute: '', markedBy: 'Sara Ahmed' },
  { id: 8, date: '2026-08-04', dept: 'Physics', sem: '2nd', day: 'Tuesday', period: 2, teacher: 'Hira Afzal', code: 'PHY-101', room: 'R22', status: 'Absent', substitute: 'Dr. Imran', markedBy: 'Sara Ahmed' },
];

export default function AdminAttendanceHistory({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'department' | 'teacher'>('department');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-01');
  
  const [showHistory, setShowHistory] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState(MOCK_ATTENDANCE);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editSubstitute, setEditSubstitute] = useState('');
  
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [semModalVisible, setSemModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);

  const getShiftDepartments = () => {
    if (!selectedShift) return [];
    return SHIFT_DEPARTMENTS.filter(d => d.shift === selectedShift).map(d => d.name);
  };

  const getShiftTeachers = () => {
    if (!selectedShift) return [];
    return SHIFT_TEACHERS.filter(t => t.shift === selectedShift).map(t => t.name);
  };

  const getFilteredTeachers = () => {
    const teachers = getShiftTeachers();
    if (!teacherSearch.trim()) return teachers;
    return teachers.filter(t => t.toLowerCase().includes(teacherSearch.toLowerCase()));
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRoom = (room: string) => `R#${room.replace('R', '')}`;

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

  const handleCellPress = (record: any) => {
    if (!record) return;
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditSubstitute(record.substitute || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    const updatedData = attendanceData.map(item => {
      if (item.id === editingRecord.id) {
        return {
          ...item,
          status: editStatus,
          substitute: editStatus === 'Absent' ? editSubstitute : '',
        };
      }
      return item;
    });

    setAttendanceData(updatedData);
    
    const updatedFiltered = filteredData.map((r: any) => {
      if (r.id === editingRecord.id) {
        return {
          ...r,
          status: editStatus,
          substitute: editStatus === 'Absent' ? editSubstitute : '',
        };
      }
      return r;
    });
    
    setFilteredData(updatedFiltered);
    setEditModalVisible(false);
    Alert.alert('Updated', `${editingRecord.teacher}'s attendance updated to ${editStatus}`);
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter both start and end dates');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date cannot be after end date');
      return;
    }

    let filteredRecords;
    if (viewMode === 'department') {
      if (!selectedDept) {
        Alert.alert('Error', 'Please select a department');
        return;
      }
      filteredRecords = attendanceData.filter(a => {
        const matchDept = a.dept === selectedDept;
        const matchSem = selectedSem === 'All' || a.sem === selectedSem;
        const matchDate = a.date >= startDate && a.date <= endDate;
        return matchDept && matchSem && matchDate;
      });
    } else {
      if (!selectedTeacher) {
        Alert.alert('Error', 'Please select a teacher');
        return;
      }
      filteredRecords = attendanceData.filter(a =>
        a.teacher === selectedTeacher && a.date >= startDate && a.date <= endDate
      );
    }

    if (filteredRecords.length === 0) {
      Alert.alert('No Records', 'No attendance records found');
      return;
    }

    const sortedRecords = filteredRecords.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.period - b.period;
    });

    setFilteredData(sortedRecords);
    setShowHistory(true);
  };

  // ==========================================
  // STEP 1: SHIFT SELECTION
  // ==========================================
  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👑 Admin</Text>
          </View>
        </View>

        <View style={styles.permissionBox}>
          <MaterialCommunityIcons name="shield-check" size={18} color="#1A237E" />
          <Text style={styles.permissionText}>Select shift to view attendance records</Text>
        </View>

        <View style={styles.shiftContainer}>
          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('1st Shift')}>
            <Text style={styles.shiftTitle}>1st Shift</Text>
            <Text style={styles.shiftSubtext}>Morning Classes</Text>
            <View style={styles.shiftCountBadge}>
              <Text style={styles.shiftCountText}>{SHIFT_DEPARTMENTS.filter(d => d.shift === '1st Shift').length} Departments</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shiftCard} onPress={() => setSelectedShift('2nd Shift')}>
            <Text style={styles.shiftTitle}>2nd Shift</Text>
            <Text style={styles.shiftSubtext}>Evening Classes</Text>
            <View style={styles.shiftCountBadge}>
              <Text style={styles.shiftCountText}>{SHIFT_DEPARTMENTS.filter(d => d.shift === '2nd Shift').length} Departments</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // STEP 2: FILTER
  // ==========================================
  if (!showHistory) {
    const availableDepts = getShiftDepartments();

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedShift(null); setSelectedDept(''); setSelectedTeacher(''); setSelectedSem('All'); }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedShift} - History</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👑 Admin</Text>
          </View>
        </View>

        <View style={styles.shiftInfoBar}>
          <MaterialCommunityIcons name="calendar-clock" size={18} color="#1A237E" />
          <Text style={styles.shiftInfoText}>
            Searching in {selectedShift} • {availableDepts.length} departments
          </Text>
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeBtn, viewMode === 'department' && styles.modeBtnActive]} 
            onPress={() => { setViewMode('department'); setSelectedTeacher(''); setTeacherSearch(''); }}
          >
            <Text style={[styles.modeText, viewMode === 'department' && styles.modeTextActive]}>Department Wise</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, viewMode === 'teacher' && styles.modeBtnActive]} 
            onPress={() => { setViewMode('teacher'); setSelectedDept(''); setSelectedSem('All'); }}
          >
            <Text style={[styles.modeText, viewMode === 'teacher' && styles.modeTextActive]}>Teacher Wise</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
          <View style={styles.filterCard}>
            <View style={styles.filterIcon}>
              <MaterialCommunityIcons name={viewMode === 'department' ? 'school' : 'account-tie'} size={40} color="#1A237E" />
            </View>
            <Text style={styles.filterTitle}>
              Search by {viewMode === 'department' ? 'Department' : 'Teacher'}
            </Text>

            {viewMode === 'department' ? (
              <>
                <TouchableOpacity style={styles.selectBtn} onPress={() => setDeptModalVisible(true)}>
                  <MaterialCommunityIcons name="school-outline" size={20} color="#1A237E" />
                  <Text style={styles.selectBtnText}>{selectedDept || 'Select Department'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                {selectedDept && (
                  <TouchableOpacity style={styles.selectBtn} onPress={() => setSemModalVisible(true)}>
                    <MaterialCommunityIcons name="layers" size={20} color="#1A237E" />
                    <Text style={styles.selectBtnText}>
                      Semester: {selectedSem === 'All' ? 'All Semesters' : `${selectedSem} Semester`}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity style={styles.selectBtn} onPress={() => { setTeacherModalVisible(true); setTeacherSearch(''); }}>
                <MaterialCommunityIcons name="account-tie" size={20} color="#1A237E" />
                <Text style={styles.selectBtnText}>{selectedTeacher || 'Select Teacher (Searchable)'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}

            <Text style={styles.dateLabel}>Date Range (Same date for single day)</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInputWrapper}>
                <MaterialCommunityIcons name="calendar-start" size={18} color="#1A237E" />
                <TextInput style={styles.dateInput} placeholder="Start Date" value={startDate} onChangeText={setStartDate} placeholderTextColor="#999" />
              </View>
              <View style={styles.dateInputWrapper}>
                <MaterialCommunityIcons name="calendar-end" size={18} color="#1A237E" />
                <TextInput style={styles.dateInput} placeholder="End Date" value={endDate} onChangeText={setEndDate} placeholderTextColor="#999" />
              </View>
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <MaterialCommunityIcons name="magnify" size={20} color="#FFF" />
              <Text style={styles.searchBtnText}>Search History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Department Modal */}
        <Modal visible={deptModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Department ({selectedShift})</Text>
                <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {availableDepts.map((dept: string) => (
                  <TouchableOpacity 
                    key={dept} 
                    style={[styles.modalItem, selectedDept === dept && styles.modalItemActive]} 
                    onPress={() => { setSelectedDept(dept); setSelectedSem('All'); setDeptModalVisible(false); }}
                  >
                    <Text style={[styles.modalItemText, selectedDept === dept && styles.modalItemTextActive]}>{dept}</Text>
                    {selectedDept === dept && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Semester Modal */}
        <Modal visible={semModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Semester</Text>
                <TouchableOpacity onPress={() => setSemModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {SEMESTERS.map((sem: string) => (
                  <TouchableOpacity 
                    key={sem} 
                    style={[styles.modalItem, selectedSem === sem && styles.modalItemActive]} 
                    onPress={() => { setSelectedSem(sem); setSemModalVisible(false); }}
                  >
                    <Text style={[styles.modalItemText, selectedSem === sem && styles.modalItemTextActive]}>
                      {sem === 'All' ? 'All Semesters' : `${sem} Semester`}
                    </Text>
                    {selectedSem === sem && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Teacher Modal WITH SEARCH */}
        <Modal visible={teacherModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Teacher ({selectedShift})</Text>
                <TouchableOpacity onPress={() => setTeacherModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchInputWrapper}>
                <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search teacher by name..."
                  value={teacherSearch}
                  onChangeText={setTeacherSearch}
                  placeholderTextColor="#999"
                />
                {teacherSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setTeacherSearch('')}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.modalList}>
                {getFilteredTeachers().length === 0 ? (
                  <Text style={styles.emptyModalText}>No teachers found</Text>
                ) : (
                  getFilteredTeachers().map((teacher: string) => (
                    <TouchableOpacity 
                      key={teacher} 
                      style={[styles.modalItem, selectedTeacher === teacher && styles.modalItemActive]} 
                      onPress={() => { setSelectedTeacher(teacher); setTeacherModalVisible(false); }}
                    >
                      <Text style={[styles.modalItemText, selectedTeacher === teacher && styles.modalItemTextActive]}>{teacher}</Text>
                      {selectedTeacher === teacher && <MaterialCommunityIcons name="check" size={20} color="#FFF" />}
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

  // ==========================================
  // STEP 3: HISTORY - SWITCHABLE VIEWS
  // ==========================================
  const renderDepartmentHistory = () => {
    const filteredAttendance = filteredData;
    
    const getAttendance = (sem: string, periodId: number) => {
      return filteredAttendance.find(a => a.sem === sem && a.period === periodId);
    };

    const getStatusColor = (status: string) => {
      if (status === 'Present') return '#4CAF50';
      if (status === 'Absent') return '#F44336';
      return '#E0E0E0';
    };

    const displaySemesters = selectedSem === 'All' ? SEMESTERS.filter(s => s !== 'All') : [selectedSem];

    return (
      <View style={styles.historyContainer}>
        <View style={styles.dateInfoBar}>
          <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
          <Text style={styles.dateInfoText}>{formatDisplayDate(startDate)}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScrollView}>
          <ScrollView showsVerticalScrollIndicator={true} style={styles.verticalScroll}>
            <View style={styles.grid}>
              <View style={styles.row}>
                <View style={styles.cornerCell}>
                  <Text style={styles.cornerText}>Sem / Period</Text>
                </View>
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
                    const record = getAttendance(sem, p.id);
                    return (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[styles.dataCell, record ? { backgroundColor: '#FFF' } : styles.emptyCell]}
                        onPress={() => handleCellPress(record)}
                        activeOpacity={0.7}
                        disabled={!record}
                      >
                        {record ? (
                          <View style={styles.cellContent}>
                            <Text style={styles.cellTeacher} numberOfLines={1}>{record.teacher}</Text>
                            <Text style={styles.cellCode} numberOfLines={1}>{record.code}</Text>
                            <View style={[styles.statusButton, { backgroundColor: getStatusColor(record.status) }]}>
                              <Text style={styles.statusText}>{record.status}</Text>
                            </View>
                            {record.status === 'Absent' && record.substitute ? (
                              <Text style={styles.substituteText}>→ {record.substitute}</Text>
                            ) : null}
                            <View style={styles.cellEditIcon}>
                              <MaterialCommunityIcons name="pencil" size={10} color="#1A237E" />
                            </View>
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
        </ScrollView>
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
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="calendar-range" size={20} color="#1A237E" />
          <Text style={styles.summaryText}>{startDate} to {endDate}</Text>
        </View>

        {sortedDates.map((dateData) => (
          <View key={dateData.date} style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <View style={styles.dateHeaderLeft}>
                <MaterialCommunityIcons name="calendar" size={18} color="#FFF" />
                <Text style={styles.dateHeaderText}>{formatDisplayDate(dateData.date)}</Text>
              </View>
              <View style={styles.markedByBadge}>
                <Text style={styles.markedByText}>Marked by {dateData.records[0].markedBy}</Text>
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
                    <TouchableOpacity 
                      key={p.id} 
                      style={styles.sketchRow}
                      onPress={() => handleCellPress(lecture)}
                      disabled={!lecture}
                    >
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
                        {lecture && (
                          <View style={styles.editIconTable}>
                            <MaterialCommunityIcons name="pencil" size={12} color="#1A237E" />
                          </View>
                        )}
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
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedShift} - History</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{filteredData.length} Records</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
        <View style={styles.adminInfoCard}>
          <View style={styles.adminAvatar}>
            <MaterialCommunityIcons name="account-tie" size={30} color="#1A237E" />
          </View>
          <View style={styles.adminTextWrap}>
            <Text style={styles.adminName}>{viewMode === 'department' ? selectedDept : selectedTeacher}</Text>
            <Text style={styles.adminSub}>{viewMode === 'department' ? 'Department View' : 'Teacher View'} • {selectedShift}</Text>
          </View>
        </View>

        {viewMode === 'department' ? renderDepartmentHistory() : renderTeacherHistory()}

        {/* ✅ Download button - Backend ready hone pe integrate hoga */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleDownload}>
          <MaterialCommunityIcons name="download" size={24} color="#FFF" />
          <Text style={styles.exportBtnText}>Download PDF Report</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A237E" />
              </TouchableOpacity>
            </View>
            
            {editingRecord && (
              <ScrollView style={styles.editModalBody}>
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
                </View>

                <Text style={styles.editSectionTitle}>Update Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity 
                    style={[styles.statusOption, editStatus === 'Present' && styles.statusOptionPresent]} 
                    onPress={() => setEditStatus('Present')}
                  >
                    <MaterialCommunityIcons name="check-circle" size={24} color={editStatus === 'Present' ? '#FFF' : '#4CAF50'} />
                    <Text style={[styles.statusOptionText, editStatus === 'Present' && { color: '#FFF' }]}>Present</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.statusOption, editStatus === 'Absent' && styles.statusOptionAbsent]} 
                    onPress={() => setEditStatus('Absent')}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color={editStatus === 'Absent' ? '#FFF' : '#F44336'} />
                    <Text style={[styles.statusOptionText, editStatus === 'Absent' && { color: '#FFF' }]}>Absent</Text>
                  </TouchableOpacity>
                </View>

                {editStatus === 'Absent' && (
                  <View style={styles.substituteSection}>
                    <Text style={styles.editLabel}>Substitute Teacher Name (Optional)</Text>
                    <TextInput 
                      style={styles.substituteInput} 
                      placeholder="Enter substitute teacher name" 
                      value={editSubstitute} 
                      onChangeText={setEditSubstitute}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveEdit}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#1A237E', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', flex: 1, textAlign: 'center' },
  roleBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  roleBadgeText: { color: '#1A237E', fontSize: 12, fontWeight: '700' },
  resultBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  resultBadgeText: { color: '#1A237E', fontSize: 12, fontWeight: '700' },

  permissionBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 10, marginHorizontal: 15, marginBottom: 10, marginTop: 10, borderRadius: 8, gap: 8,
  },
  permissionText: { fontSize: 12, color: '#1A237E', fontWeight: '600', flex: 1 },

  shiftInfoBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 10, marginHorizontal: 15, marginBottom: 10, borderRadius: 8, gap: 8,
  },
  shiftInfoText: { fontSize: 12, color: '#1A237E', fontWeight: '600', flex: 1 },

  shiftContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 20 },
  shiftCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 30, alignItems: 'center',
    elevation: 3, borderWidth: 2, borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666', marginBottom: 12 },
  shiftCountBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 15 },
  shiftCountText: { fontSize: 12, color: '#1A237E', fontWeight: '700' },

  modeSelector: { flexDirection: 'row', margin: 15, marginBottom: 10, backgroundColor: '#FFF', borderRadius: 10, padding: 4, elevation: 2 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1A237E' },
  modeText: { fontSize: 14, fontWeight: '600', color: '#666' },
  modeTextActive: { color: '#FFF', fontWeight: '700' },

  filterCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 3, alignItems: 'center',
  },
  filterIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 15,
  },
  filterTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', marginBottom: 20 },

  selectBtn: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8, marginBottom: 15,
  },
  selectBtnText: { flex: 1, fontSize: 14, color: '#1A237E', fontWeight: '700' },

  dateLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 10, alignSelf: 'flex-start' },
  dateRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  dateInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD',
    borderRadius: 10, paddingHorizontal: 10, gap: 6,
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#333' },

  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, gap: 8,
    elevation: 3, width: '100%',
  },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  adminInfoCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#1A237E',
  },
  adminAvatar: {
    width: 55, height: 55, borderRadius: 28, backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  adminTextWrap: { flex: 1 },
  adminName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  adminSub: { fontSize: 13, color: '#666', marginTop: 3 },

  historyContainer: { flex: 1 },
  dateInfoBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 12, marginBottom: 10, borderRadius: 10, gap: 8,
  },
  dateInfoText: { fontSize: 14, color: '#1A237E', fontWeight: '700', flex: 1 },

  summaryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6',
    padding: 12, borderRadius: 10, marginBottom: 15, gap: 8,
  },
  summaryText: { fontSize: 12, color: '#1A237E', fontWeight: '700', flex: 1 },

  gridScrollView: { flex: 1 },
  verticalScroll: { flex: 1 },
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
  dateHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1A237E', paddingVertical: 12, paddingHorizontal: 15,
    borderRadius: 10, marginBottom: 10, elevation: 3,
  },
  dateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dateHeaderText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  markedByBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  markedByText: { fontSize: 10, fontWeight: '700', color: '#FFF' },

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
  editIconTable: { position: 'absolute', top: 5, right: 5 },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12,
  },
  statusPillText: { fontSize: 10, fontWeight: '800', flexShrink: 1 },
  freeStatus: { fontSize: 12, color: '#B0BEC5' },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, gap: 8,
    elevation: 3, marginTop: 10,
  },
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

  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    margin: 20,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },

  editModalBody: { padding: 20 },
  editInfo: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginBottom: 20 },
  editLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 8 },
  editValue: { fontSize: 15, fontWeight: '700', color: '#1A237E' },
  editSectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  
  statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statusOption: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', backgroundColor: '#FFF'
  },
  statusOptionPresent: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  statusOptionAbsent: { backgroundColor: '#F44336', borderColor: '#F44336' },
  statusOptionText: { fontSize: 14, fontWeight: '700', color: '#333' },
  
  substituteSection: { marginBottom: 20 },
  substituteInput: { 
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#DDD', 
    borderRadius: 10, padding: 12, fontSize: 14, marginTop: 8 
  },
  
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4CAF50' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});