import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../services/tokenStorage';
import { moService } from '../../services/moService';

export default function ViewAssignDutyScreen({ onBack }: any) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', role: 'Monitoring Official' });
  const [duties, setDuties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const user = await tokenStorage.getUser();
        if (user) {
          setUserInfo({ name: user.name, role: user.role || 'Monitoring Official' });
        }
        
        const fetchedDuties = await moService.getMyDuties();
        console.log(" Fetched duties:", fetchedDuties);
        setDuties(fetchedDuties);
      } catch (error: any) {
        console.error('Failed to load duties:', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ Aaj ki date nikalein (Local timezone)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  console.log("📅 TODAY:", todayStr);

  // ✅ Sirf aaj ki duties filter karein
  const todaysDuties = duties.filter((d: any) => {
    const dDate = d.duty_date ? String(d.duty_date).split('T')[0] : '';
    return dDate === todayStr;
  });

  console.log("📋 Today's duties:", todaysDuties.length);

  // ✅ UNIQUE departments nikalne ka function
  const getUniqueDepartments = (shiftDuties: any[]) => {
    const uniqueDeptNames = [...new Set(shiftDuties.map((d: any) => d.dept_name))];
    return uniqueDeptNames;
  };

  // ✅ Sirf aaj ki duties se count nikalein
  const firstShiftDepts = getUniqueDepartments(todaysDuties.filter((d: any) => d.shift === '1st Shift'));
  const secondShiftDepts = getUniqueDepartments(todaysDuties.filter((d: any) => d.shift === '2nd Shift'));
  
  console.log("1st Shift unique depts:", firstShiftDepts);
  console.log("2nd Shift unique depts:", secondShiftDepts);

  // Selected shift ke mutabiq duties filter karein (sirf aaj ki)
  const filteredDuties = selectedShift 
    ? todaysDuties.filter((d: any) => d.shift === selectedShift)
    : [];

  // Step 1: Select Shift
  if (!selectedShift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Shift</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : (
          <View style={styles.shiftContainer}>
            <TouchableOpacity 
              style={styles.shiftCard}
              onPress={() => setSelectedShift('1st Shift')}
            >
              <Text style={styles.shiftTitle}>1st Shift</Text>
              <Text style={styles.shiftSubtext}>Morning Classes</Text>
              <Text style={styles.shiftCount}>
                {firstShiftDepts.length} Departments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.shiftCard}
              onPress={() => setSelectedShift('2nd Shift')}
            >
              <Text style={styles.shiftTitle}>2nd Shift</Text>
              <Text style={styles.shiftSubtext}>Evening Classes</Text>
              <Text style={styles.shiftCount}>
                {secondShiftDepts.length} Departments
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Step 2: Show Assigned Departments
  const uniqueDeptNames = getUniqueDepartments(filteredDuties);
  const uniqueFilteredDuties = uniqueDeptNames.map(deptName => 
    filteredDuties.find((d: any) => d.dept_name === deptName)
  ).filter(Boolean);

  console.log(`${selectedShift} - Unique departments:`, uniqueDeptNames);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedShift(null)}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedShift}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.teacherTopCard}>
          <Text style={styles.teacherTopName}>{userInfo.name}</Text>
          <Text style={styles.teacherTopDept}>{userInfo.role} • {selectedShift}</Text>
          <View style={styles.dateRangeLine}>
            <Text style={styles.dateRangeText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Departments</Text>
          <Text style={styles.sectionCount}>{uniqueFilteredDuties.length} Departments</Text>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : uniqueFilteredDuties.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No duties assigned for this shift</Text>
          </View>
        ) : (
          uniqueFilteredDuties.map((duty: any, index: number) => (
            <View key={index} style={styles.deptCard}>
              <View style={styles.deptInfo}>
                <Text style={styles.deptName}>{duty.dept_name} Department</Text>
                <Text style={styles.deptMeta}>Assigned by: {duty.assigned_by_name || 'Admin'}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  
  shiftContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    gap: 20 
  },
  shiftCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E8EAF6',
  },
  shiftTitle: { fontSize: 22, fontWeight: '800', color: '#1A237E', marginBottom: 5 },
  shiftSubtext: { fontSize: 14, color: '#666', marginBottom: 10 },
  shiftCount: { fontSize: 13, color: '#1A237E', fontWeight: '700', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  
  content: { padding: 15, paddingBottom: 30 },

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
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  sectionCount: { fontSize: 13, color: '#666', fontWeight: '600' },
  
  deptCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  deptInfo: { flex: 1 },
  deptName: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  deptMeta: { fontSize: 12, color: '#666' },
  chevron: { fontSize: 28, color: '#1A237E', fontWeight: '300' },
  
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
});