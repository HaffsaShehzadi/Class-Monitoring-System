import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import RequestStatusScreen from './src/screens/auth/RequestStatusScreen';

// Auth screens
import SplashScreen from './src/screens/auth/SplashScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// Dashboards
import AdminDashboard from './src/screens/admin/AdminDashboard';
import TeacherDashboard from './src/screens/teacher/TeacherDashboard';
import MonitoringOfficialDashboard from './src/screens/monitoring/MonitoringOfficialDashboard';

// Admin screens
import PendingApprovalsScreen from './src/screens/admin/PendingApprovalsScreen';
import UserProfilesScreen from './src/screens/admin/UserProfilesScreen';
import AssignDutyScreen from './src/screens/admin/AssignDutyScreen';
import ComplaintsScreen from './src/screens/admin/ComplaintsScreen';
import TimetableManagementScreen from './src/screens/admin/TimetableManagementScreen';
import AddClassInTimetable from './src/screens/admin/AddClassInTimetable';
import AdminAttendanceHistory from './src/screens/admin/AdminAttendanceHistory';

// Teacher screens
import SubmitComplaintScreen from './src/screens/teacher/SubmitComplaintScreen';
import TeacherAttendanceHistory from './src/screens/teacher/TeacherAttendanceHistory';
import MyTimetableScreen from './src/screens/teacher/MyTimetableScreen';

// Monitoring screens
import ViewAssignDutyScreen from './src/screens/monitoring/ViewAssignDutyScreen';
import MarkAttendanceScreen from './src/screens/monitoring/MarkAttendanceScreen';
import MonitoringAttendanceHistory from './src/screens/monitoring/MonitoringAttendanceHistory';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [params, setParams] = useState<any>({});
  const [role, setRole] = useState('');
  
  // User Management State
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Complaints State
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

  // Splash timer
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('signin'), 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // ✅ Hardware Back Button Handler
  useEffect(() => {
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

  const go = (name: string, p?: any) => {
    setScreen(name);
    setParams(p || {});
  };

  const goBack = () => {
    if (screen === 'requestStatus') { setScreen('signin'); return; }
    if (screen === 'myTimetable') { setScreen('teacher'); return; }
    if (screen === 'addClassInTimetable') { setScreen('timetableManagement'); return; }
    
    if (role === 'admin') setScreen('admin');
    else if (role === 'teacher') setScreen('teacher');
    else if (role === 'monitoring') setScreen('monitoring');
    else setScreen('signin');
  };

  const logout = () => {
    setRole('');
    setParams({});
    setCurrentUser(null);
    setScreen('signin');
  };

  const splashDone = () => setScreen('signin');

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setRole(userData.role);
    
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
          />
        );
      
      case 'forgot': 
        return <ForgotPasswordScreen onBack={() => go('signin')} onSent={() => go('signin')} />;

      // ADMIN SCREENS
      case 'admin': 
        return <AdminDashboard onNavigate={go} onLogout={logout} />;
      
      case 'pending': 
        return <PendingApprovalsScreen onBack={goBack} />;

      case 'users': 
        return <UserProfilesScreen onBack={goBack} />;
      
      case 'assignDuty': 
        return <AssignDutyScreen onBack={goBack} />;
      
      case 'timetableManagement': 
        return <TimetableManagementScreen onBack={goBack} onNavigate={go} />;
      
      case 'addClassInTimetable': 
        return <AddClassInTimetable onBack={goBack} onNavigate={go} params={params} />;
      
      case 'complaints': 
        return <ComplaintsScreen onBack={goBack} />;

      case 'adminAttendanceHistory': 
        return <AdminAttendanceHistory onBack={goBack} />;

      // TEACHER SCREENS
      case 'teacher': 
        return <TeacherDashboard onNavigate={go} onLogout={logout} />;
      
      case 'submitComplaint': 
        return <SubmitComplaintScreen onBack={goBack} />;

      case 'teacherAttendanceHistory': 
        return <TeacherAttendanceHistory onBack={goBack} />;

      case 'myTimetable':
        return <MyTimetableScreen onBack={goBack} />;

      // MONITORING SCREENS
      case 'monitoring': 
        return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} />;
      
      case 'viewAssignDuty': 
        return <ViewAssignDutyScreen onBack={goBack} />;
      
      case 'markAttendance': 
        return <MarkAttendanceScreen onBack={goBack} />;
      
      case 'monitoringAttendanceHistory': 
        return <MonitoringAttendanceHistory onBack={goBack} />;

      default:
        if (role === 'admin') return <AdminDashboard onNavigate={go} onLogout={logout} />;
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

  // ✅ Simple return - no bottom bar
  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
});