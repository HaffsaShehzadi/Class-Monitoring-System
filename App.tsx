import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/services/database';
import { startAutoSync, setAuthToken } from './src/services/syncService';
import { tokenStorage } from './src/services/tokenStorage';
import RequestStatusScreen from './src/screens/auth/RequestStatusScreen';

if (Platform.OS === 'web') {
  (Alert as any).alert = (title: any, message?: any, buttons?: any) => {
    const msg = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length === 0) { window.alert(msg); return; }
    if (buttons.length === 1) { window.alert(msg); buttons[0].onPress && buttons[0].onPress(); return; }
    const ok = window.confirm(msg);
    if (ok) {
      const confirmBtn = [...buttons].reverse().find((b: any) => b.style !== 'cancel') || buttons[buttons.length - 1];
      confirmBtn.onPress && confirmBtn.onPress();
    } else {
      const cancelBtn = buttons.find((b: any) => b.style === 'cancel');
      cancelBtn && cancelBtn.onPress && cancelBtn.onPress();
    }
  };
}

import SplashScreen from './src/screens/auth/SplashScreen';
import SignInScreen from './src/screens/auth/loginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

import AdminDashboard from './src/screens/admin/AdminDashboard';
import TeacherDashboard from './src/screens/teacher/TeacherDashboard';
import MonitoringOfficialDashboard from './src/screens/monitoring/MonitoringOfficialDashboard';

import PendingApprovalsScreen from './src/screens/admin/PendingApprovalsScreen';
import UserProfilesScreen from './src/screens/admin/UserProfilesScreen';
import AssignDutyScreen from './src/screens/admin/AssignDutyScreen';
import ComplaintsScreen from './src/screens/admin/ComplaintsScreen';
import TimetableManagementScreen from './src/screens/admin/TimetableManagementScreen';
import AddClassInTimetable from './src/screens/admin/AddClassInTimetable';
import AdminAttendanceHistory from './src/screens/admin/AdminAttendanceHistory';

import SubmitComplaintScreen from './src/screens/teacher/SubmitComplaintScreen';
import TeacherAttendanceHistory from './src/screens/teacher/TeacherAttendanceHistory';
import MyTimetableScreen from './src/screens/teacher/MyTimetableScreen';

import ViewAssignDutyScreen from './src/screens/monitoring/ViewAssignDutyScreen';
import MarkAttendanceScreen from './src/screens/monitoring/MarkAttendanceScreen';
import MonitoringAttendanceHistory from './src/screens/monitoring/MonitoringAttendanceHistory';

const isWeb = Platform.OS === 'web';
const ADMIN_WEB_SCREENS = ['admin', 'pending', 'users', 'assignDuty', 'timetableManagement', 'addClassInTimetable', 'complaints', 'adminAttendanceHistory'];

const WEB_MENU = [
  { id: 'admin', title: 'Dashboard' },
  { id: 'pending', title: 'Pending Approvals' },
  { id: 'users', title: 'User Profiles' },
  { id: 'assignDuty', title: 'Assign Duty' },
  { id: 'timetableManagement', title: 'Manage Timetable' },
  { id: 'complaints', title: 'Resolve Complaints' },
  { id: 'adminAttendanceHistory', title: 'Attendance History' },
];

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [params, setParams] = useState<any>({});
  const [role, setRole] = useState('');
  
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [complaints, setComplaints] = useState<any[]>([
    {
      id: 1,
      text: 'Attendance marked wrong for Monday Period 1. I was present but marked absent.',
      date: '2024-06-01',
      status: 'resolved',
      resolvedDate: '2024-06-02',
      submittedBy: 'Hassan Raza',
    },
    {
      id: 2,
      text: 'Room number is incorrect in timetable for BSCS 2nd semester.',
      date: '2024-06-03',
      status: 'pending',
      resolvedDate: null,
      submittedBy: 'Hassan Raza',
    },
  ]);

  // ✅ ADMIN STATES
  const [adminStats, setAdminStats] = useState<any>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // ✅ MO STATES
  const [moDuties, setMoDuties] = useState<any[]>([]);
  const [moAttendanceRecords, setMoAttendanceRecords] = useState<any[]>([]);
  const [moSelectedShift, setMoSelectedShift] = useState<string | null>(null);
  const [moSelectedDept, setMoSelectedDept] = useState<string | null>(null);
  const [moSelectedDate, setMoSelectedDate] = useState('');

  // Splash timer + auto-login check
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(async () => {
        const savedToken = await tokenStorage.getToken();
        const savedUser = await tokenStorage.getUser();
        
        if (savedToken && savedUser) {
          setAuthToken(savedToken);
          setCurrentUser(savedUser);
          setRole(savedUser.role);
          
          if (savedUser.role === 'admin') setScreen('admin');
          else if (savedUser.role === 'teacher') setScreen('teacher');
          else if (savedUser.role === 'monitoring') setScreen('monitoring');
          else setScreen('signin');
        } else {
          setScreen('signin');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  useEffect(() => {
    initDatabase().then(async (db) => {
      try {
        await db.execAsync(`
          ALTER TABLE offline_attendance ADD COLUMN timetable_id INTEGER DEFAULT 0;
        `);
        console.log('✅ Added timetable_id column');
      } catch (e) {
        console.log('✅ Database schema ready');
      }
      console.log('✅ SQLite Database initialized');
    });
    startAutoSync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const backAction = () => {
      if (screen === 'splash' || screen === 'signin') {
        BackHandler.exitApp();
        return true;
      }
      
      if (screen === 'signup' || screen === 'forgot' || screen === 'requestStatus') {
        setScreen('signin');
        return true;
      }
      
      if (screen === 'admin' || screen === 'teacher' || screen === 'monitoring') {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout }
          ]
        );
        return true;
      }
      
      goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screen, role]);

  // ✅ NEW: Secure navigation function
  const go = (name: string, p?: any) => {
    // ✅ Purana params clear karein
    setParams(p || {});
    setScreen(name);
  };

  // ✅ Screen change hone par states ko reset karein (agar zaroori ho)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(` Screen changed to: ${screen}`);
      
      // ✅ Jab screen change ho, MO states clear karein
      if (screen !== 'markAttendance' && screen !== 'viewAssignDuty' && screen !== 'monitoringAttendanceHistory') {
        setMoSelectedShift(null);
        setMoSelectedDept(null);
        setMoSelectedDate('');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [screen]);

  const goBack = () => {
    // ✅ Jab back jayen, params clear kar dein
    setParams({});
    
    if (screen === 'requestStatus') { setScreen('signin'); return; }
    if (screen === 'myTimetable') { setScreen('teacher'); return; }
    if (screen === 'addClassInTimetable') { setScreen('timetableManagement'); return; }
    
    if (role === 'admin') setScreen('admin');
    else if (role === 'teacher') setScreen('teacher');
    else if (role === 'monitoring') setScreen('monitoring');
    else setScreen('signin');
  };

  const logout = async () => {
    await tokenStorage.clearAll();
    setAuthToken(null);
    setRole('');
    setParams({});
    setCurrentUser(null);
    setPendingUsers([]);
    setApprovedUsers([]);
    setComplaints([]);
    setAdminStats({});
    setUsersList([]);
    setMoDuties([]);
    setMoAttendanceRecords([]);
    setMoSelectedShift(null);
    setMoSelectedDept(null);
    setMoSelectedDate('');
    setScreen('signin');
  };

  const splashDone = () => setScreen('signin');

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setRole(userData.role);
    setParams({});
    
    if (userData.role === 'admin') setScreen('admin');
    else if (userData.role === 'teacher') setScreen('teacher');
    else if (userData.role === 'monitoring') setScreen('monitoring');
  };

  const handlePendingStatus = (userData: any) => {
    setCurrentUser(userData);
    setScreen('requestStatus');
  };

  const handleSignUp = (userData: any) => {
    const newUser = {
      id: userData.id || Date.now(),
      name: userData.fullName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      department: userData.department || null,
      status: 'pending'
    };
    setPendingUsers([...pendingUsers, newUser]);
    setCurrentUser(newUser);
    setScreen('requestStatus');
  };

  const checkRequestStatus = (): { status: 'pending' | 'approved' | 'rejected' } => {
    if (!currentUser) return { status: 'pending' };
    const approved = approvedUsers.find(u => u.id === currentUser.id);
    if (approved) return { status: 'approved' };
    const rejected = pendingUsers.find(u => u.id === currentUser.id && u.status === 'rejected');
    if (rejected) return { status: 'rejected' };
    return { status: 'pending' };
  };

  const approveUser = (userId: number) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      setApprovedUsers([...approvedUsers, { ...user, status: 'approved' }]);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      Alert.alert('✅ Approved', `${user.name} has been approved!`);
    }
  };

  const rejectUser = (userId: number) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      setPendingUsers(pendingUsers.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
      Alert.alert('🗑️ Removed', `${user.name}'s request has been rejected.`);
    }
  };

  const handleApproved = () => {
    if (currentUser) {
      if (currentUser.role === 'teacher') {
        setRole('teacher');
        setScreen('teacher');
      } else if (currentUser.role === 'monitoring') {
        setRole('monitoring');
        setScreen('monitoring');
      }
    }
  };

  const submitComplaint = (text: string) => {
    const newComplaint = {
      id: Date.now(),
      text,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'pending',
      resolvedDate: null,
      submittedBy: currentUser?.name || 'Teacher',
    };
    setComplaints([newComplaint, ...complaints]);
  };

  const updateComplaintStatus = (id: number, status: 'resolved' | 'rejected') => {
    setComplaints(complaints.map(c =>
      c.id === id
        ? { ...c, status, resolvedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
        : c
    ));
    Alert.alert('✅ Done', `Complaint marked as ${status}`);
  };

  // ✅ ADMIN DATA FETCHING FUNCTIONS
  const fetchAdminStats = async () => {
    try {
      const { dashboardService } = await import('./src/services/dashboardService');
      const stats = await dashboardService.getAdminStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { userService } = await import('./src/services/userService');
      const users = await userService.getAllUsers();
      setUsersList(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { dashboardService } = await import('./src/services/dashboardService');
      const users = await dashboardService.getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { complaintAdminService } = await import('./src/services/complaintAdminService');
      const data = await complaintAdminService.getAllComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  // ✅ MO DATA FETCHING FUNCTIONS
  const fetchMoDuties = async () => {
    try {
      const { moService } = await import('./src/services/moService');
      const duties = await moService.getMyDuties();
      setMoDuties(duties);
    } catch (error) {
      console.error('Failed to fetch MO duties:', error);
    }
  };

  const fetchMoAttendance = async (date: string, deptId: number) => {
    try {
      const { detectBackend } = await import('./src/services/ipConfig');
      const token = await tokenStorage.getToken();
      const BACKEND_URL = await detectBackend();
      
      const url = `${BACKEND_URL}/api/attendance/mo-history?date=${date}&department_id=${deptId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance');
      
      setMoAttendanceRecords(data);
    } catch (error) {
      console.error('Failed to fetch MO attendance:', error);
      setMoAttendanceRecords([]);
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash': 
        return <SplashScreen />;
      
      case 'signin':
        return (
          <SignInScreen 
            onBack={splashDone} 
            onLogin={handleLogin}
            onPendingStatus={handlePendingStatus}
            onSignUp={() => go('signup')} 
            onForgotPassword={() => go('forgot')} 
          />
        );
      
      case 'signup': 
        return <SignUpScreen onBack={() => go('signin')} onSignUp={handleSignUp} />;
      
      case 'requestStatus':
        return (
          <RequestStatusScreen 
            onBack={goBack} 
            onApproved={handleApproved} 
            userEmail={currentUser?.email || ''} 
            userRole={currentUser?.role || ''} 
            checkStatus={checkRequestStatus}
            userPassword={currentUser?.password}
          />
        );
      
      case 'forgot': 
        return <ForgotPasswordScreen onBack={() => go('signin')} onSent={() => go('signin')} />;

      // ✅ ADMIN SCREENS
      case 'admin': 
        return <AdminDashboard onNavigate={go} onLogout={logout} adminStats={adminStats} />;
      
      // ✅ ERROR FIXED HERE: Removed extra props that were causing the TypeScript error
      case 'pending': 
        return <PendingApprovalsScreen onBack={goBack} />;

      case 'users': 
        return <UserProfilesScreen onBack={goBack} users={usersList} />;
      
      case 'assignDuty': 
        return <AssignDutyScreen onBack={goBack} />;
      
      case 'timetableManagement': 
        return <TimetableManagementScreen onBack={goBack} onNavigate={go} params={params} />;
      
      case 'addClassInTimetable': 
        return <AddClassInTimetable onBack={goBack} onNavigate={go} params={params} />;
      
      case 'complaints': 
        return <ComplaintsScreen onBack={goBack} complaints={complaints} onUpdateStatus={updateComplaintStatus} />;

      case 'adminAttendanceHistory': 
        return <AdminAttendanceHistory onBack={goBack} />;

      // ✅ TEACHER SCREENS
      case 'teacher': 
        return <TeacherDashboard onNavigate={go} onLogout={logout} />;
      
      case 'submitComplaint': 
        return <SubmitComplaintScreen onBack={goBack} onSubmit={submitComplaint} />;

      case 'teacherAttendanceHistory': 
        return <TeacherAttendanceHistory onBack={goBack} />;

      case 'myTimetable':
        return <MyTimetableScreen onBack={goBack} />;

      // ✅ MO SCREENS
      case 'monitoring': 
        return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} />;
      
      case 'viewAssignDuty': 
        return <ViewAssignDutyScreen onBack={goBack} duties={moDuties} />;
      
      case 'markAttendance': 
        return <MarkAttendanceScreen 
          onBack={goBack} 
          duties={moDuties}
          selectedShift={moSelectedShift}
          selectedDept={moSelectedDept}
          setSelectedShift={setMoSelectedShift}
          setSelectedDept={setMoSelectedDept}
        />;
      
      case 'monitoringAttendanceHistory': 
        return <MonitoringAttendanceHistory 
          onBack={goBack} 
          duties={moDuties}
          attendanceRecords={moAttendanceRecords}
          selectedShift={moSelectedShift}
          selectedDate={moSelectedDate}
          setSelectedShift={setMoSelectedShift}
          setSelectedDate={setMoSelectedDate}
        />;

      default:
        if (role === 'admin') return <AdminDashboard onNavigate={go} onLogout={logout} adminStats={adminStats} />;
        if (role === 'teacher') return <TeacherDashboard onNavigate={go} onLogout={logout} />;
        if (role === 'monitoring') return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} />;
        return (
          <SignInScreen 
            onBack={splashDone} 
            onLogin={handleLogin}
            onPendingStatus={handlePendingStatus}
            onSignUp={() => go('signup')} 
            onForgotPassword={() => go('forgot')} 
          />
        );
    }
  };

  const showWebSidebar = isWeb && role === 'admin' && ADMIN_WEB_SCREENS.includes(screen);

  return (
    <SafeAreaProvider>
      {showWebSidebar ? (
        <View style={styles.webLayout}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarLogo}>🎓 Class Monitoring</Text>
            <ScrollView style={{ flex: 1 }}>
              {WEB_MENU.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarItem, screen === item.id && styles.sidebarItemActive]}
                  onPress={() => go(item.id)}
                >
                  <Text style={[styles.sidebarItemText, screen === item.id && styles.sidebarItemTextActive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.sidebarLogout} onPress={logout}>
              <Text style={styles.sidebarLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.webContent}>{renderScreen()}</View>
        </View>
      ) : (
        <View style={styles.webWrapper}>
          <View style={styles.container}>
            {renderScreen()}
          </View>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webLayout: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5' },
  sidebar: { width: 240, backgroundColor: '#1A237E', paddingTop: 20, paddingHorizontal: 12 },
  sidebarLogo: { color: '#FFF', fontSize: 18, fontWeight: '800', paddingHorizontal: 8, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  sidebarItem: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, marginBottom: 4 },
  sidebarItemActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  sidebarItemText: { color: '#C5CAE9', fontSize: 14, fontWeight: '600' },
  sidebarItemTextActive: { color: '#FFF', fontWeight: '700' },
  sidebarLogout: { paddingVertical: 14, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  sidebarLogoutText: { color: '#FFCDD2', fontSize: 14, fontWeight: '700' },
  webContent: { flex: 1 },

  webWrapper: {
    flex: 1,
    backgroundColor: '#E9EDF2',
    alignItems: 'center',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
    width: '100%',
    maxWidth: 1100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});