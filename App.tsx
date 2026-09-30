import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  // ✅ GLOBAL CSS: Remove browser outline, blue box, autofill color, and duplicate eye icon
  if (typeof document !== 'undefined') {
    const styleId = 'custom-global-web-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* Remove browser outline and blue focus box */
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        /* Remove duplicate eye icon added by Edge/Chrome */
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
        /* Fix autofill blue/purple background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
          -webkit-text-fill-color: #333333 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        /* Full viewport height and width on web */
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }
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

// ✅ FIXED: "Dashboard" keyword removed from sidebar as requested
const WEB_MENU = [
  { id: 'pending', title: 'Pending Approvals', icon: 'account-clock-outline' },
  { id: 'users', title: 'User Profiles', icon: 'account-group-outline' },
  { id: 'assignDuty', title: 'Assign Duty', icon: 'clipboard-check-outline' },
  { id: 'timetableManagement', title: 'Manage Timetable', icon: 'calendar-clock-outline' },
  { id: 'complaints', title: 'Resolve Complaints', icon: 'alert-circle-outline' },
  { id: 'adminAttendanceHistory', title: 'Attendance History', icon: 'history' },
];

const TEACHER_WEB_MENU = [
  { id: 'myTimetable', title: 'My Timetable', icon: 'calendar-clock-outline' },
  { id: 'teacherAttendanceHistory', title: 'My Attendance History', icon: 'history' },
  { id: 'submitComplaint', title: 'Submit Complaint', icon: 'alert-circle-outline' },
];

const MO_WEB_MENU = [
  { id: 'viewAssignDuty', title: 'View Assigned Duty', icon: 'clipboard-check-outline' },
  { id: 'markAttendance', title: 'Mark Attendance', icon: 'check-circle-outline' },
  { id: 'monitoringAttendanceHistory', title: 'Attendance History', icon: 'history' },
];

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [params, setParams] = useState<any>({});
  const [role, setRole] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
          //setAuthToken(savedToken);
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
    if (!isWeb) {
      setSidebarOpen(false);
    }
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
    setSidebarOpen(false);
    
    if (screen === 'requestStatus') { setScreen('signin'); return; }
    if (screen === 'myTimetable') { setScreen('teacher'); return; }
    if (screen === 'addClassInTimetable') { setScreen('timetableManagement'); return; }
    
    if (role === 'admin') setScreen('admin');
    else if (role === 'teacher') setScreen('teacher');
    else if (role === 'monitoring') setScreen('monitoring');
    else setScreen('signin');
  };

  const logout = async () => {
    setSidebarOpen(false);
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
            initialStatus={currentUser?.status}
            checkStatus={checkRequestStatus}
            userPassword={currentUser?.password}
          />
        );
      
      case 'forgot': 
        return <ForgotPasswordScreen onBack={() => go('signin')} onSent={() => go('signin')} />;

      // ✅ ADMIN SCREENS
      case 'admin': 
        return <AdminDashboard onNavigate={go} onLogout={logout} adminStats={adminStats} onToggleSidebar={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />;
      
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
        return <TeacherDashboard onNavigate={go} onLogout={logout} onToggleSidebar={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />;
      
      case 'submitComplaint': 
        return <SubmitComplaintScreen onBack={goBack} onSubmit={submitComplaint} />;

      case 'teacherAttendanceHistory': 
        return <TeacherAttendanceHistory onBack={goBack} />;

      case 'myTimetable':
        return <MyTimetableScreen onBack={goBack} />;

      // ✅ MO SCREENS
      case 'monitoring': 
        return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} onToggleSidebar={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />;
      
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
        if (role === 'admin') return <AdminDashboard onNavigate={go} onLogout={logout} adminStats={adminStats} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />;
        if (role === 'teacher') return <TeacherDashboard onNavigate={go} onLogout={logout} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />;
        if (role === 'monitoring') return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />;
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

  const getRoleMenu = () => {
    if (role === 'admin') return WEB_MENU;
    if (role === 'teacher') return TEACHER_WEB_MENU;
    if (role === 'monitoring') return MO_WEB_MENU;
    return [];
  };

  const currentMenu = getRoleMenu();
  const isAuthScreen = ['splash', 'signin', 'signup', 'forgot', 'requestStatus'].includes(screen);

  if (isAuthScreen) {
    return (
      <SafeAreaProvider>
        <View style={[styles.webWrapper, styles.webWrapperAuth]}>
          <View style={[styles.container, styles.containerAuth]}>
            {renderScreen()}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  // ✅ MOBILE: Pure full-screen layout without any sidebar
  if (!isWeb) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          {renderScreen()}
        </View>
      </SafeAreaProvider>
    );
  }

  // ✅ WEB: Side-by-side in-flow sidebar on left and adjusting content on right
  return (
    <SafeAreaProvider>
      <View style={styles.appShell}>
        {/* ✅ IN-FLOW NAVIGATION BAR: Adjusts side-by-side on the left; screen content on right adjusts smoothly */}
        {sidebarOpen && currentMenu.length > 0 && (
          <View style={styles.inFlowSidebar}>
            <View style={styles.sidebarHeader}>
              <TouchableOpacity 
                onPress={() => go(role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'monitoring')}
                activeOpacity={0.8}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ position: 'relative', marginRight: 10 }}>
                  <MaterialCommunityIcons name="school" size={24} color="#FFF" />
                  <View style={{ position: 'absolute', bottom: -2, right: -4, backgroundColor: '#FFF', borderRadius: 8, padding: 1 }}>
                    <MaterialCommunityIcons name="clipboard-check" size={10} color="#4CAF50" />
                  </View>
                </View>
                <Text style={styles.sidebarLogo}>Class Monitoring</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSidebarOpen(false)} 
                style={styles.sidebarCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
              {currentMenu.map(item => {
                const isActive = screen === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    onPress={() => go(item.id)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? '#FFF' : '#C5CAE9'}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ✅ RIGHT MAIN CONTENT AREA: Never hidden; fills remaining space seamlessly */}
        <View style={styles.mainContentArea}>
          {renderScreen()}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  webWrapperAuth: {
    backgroundColor: '#FFF',
    alignItems: 'stretch',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
    width: '100%',
    maxWidth: isWeb ? '100%' : 1100,
  },
  containerAuth: {
    backgroundColor: '#FFF',
    maxWidth: '100%',
    width: '100%',
    height: '100%',
  },

  // ✅ Modern Web App Layout with Side-by-Side In-Flow Sidebar
  appShell: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  inFlowSidebar: {
    width: 260,
    backgroundColor: '#1A237E',
    height: '100%',
    zIndex: 100,
    paddingTop: Platform.OS === 'web' ? 20 : 44,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  sidebarLogo: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '800', 
  },
  sidebarCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sidebarItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    borderRadius: 8, 
    marginBottom: 6,
  },
  sidebarItemActive: { 
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD54F',
  },
  sidebarItemText: { color: '#C5CAE9', fontSize: 14, fontWeight: '600' },
  sidebarItemTextActive: { color: '#FFF', fontWeight: '700' },
  mainContentArea: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
});