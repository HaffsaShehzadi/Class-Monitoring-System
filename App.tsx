import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import RequestStatusScreen from './RequestStatusScreen';

// Auth screens
import SplashScreen from './SplashScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

// Dashboards
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import MonitoringOfficialDashboard from './MonitoringOfficialDashboard';

// Admin screens
import PendingApprovalsScreen from './PendingApprovalsScreen';
import UserProfilesScreen from './UserProfilesScreen';
import AssignDutyScreen from './AssignDutyScreen';
import AssignDutyDetailScreen from './AssignDutyDetailScreen';
import ComplaintsScreen from './ComplaintsScreen';
import TimetableManagementScreen from './TimetableManagementScreen';
import AddEditClassScreen from './AddEditClassScreen';

// Shared screens
import AttendanceHistoryReport from './AttendanceHistoryReport';

// Teacher screens
import SubmitComplaintScreen from './SubmitComplaintScreen';

// Monitoring screens
import ViewAssignDutyScreen from './ViewAssignDutyScreen';
import MarkAttendanceScreen from './MarkAttendanceScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [params, setParams] = useState<any>({});
  const [role, setRole] = useState('');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('signin');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const go = (name: string, p?: any) => {
    setScreen(name);
    setParams(p || {});
  };

  const goBack = () => {
    if (screen === 'requestStatus') { setScreen('signin'); return; }
    if (screen === 'addEditClass') { setScreen('timetableManagement'); return; }
    if (screen === 'assignDutyDetail') { setScreen('assignDuty'); return; }
    
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

  const adminLogin = () => { setRole('admin'); setScreen('admin'); };
  const teacherLogin = () => { setRole('teacher'); setScreen('teacher'); };
  const monitoringLogin = () => { setRole('monitoring'); setScreen('monitoring'); };

  const handleSignUp = (userRole: string, name: string, email: string, password: string, department: string) => {
    const newUser = {
      id: Date.now(),
      name, email, password,
      role: userRole,
      department: userRole === 'Teacher' ? department : '-',
      status: 'pending'
    };
    setPendingUsers([...pendingUsers, newUser]);
    setCurrentUser(newUser);
    setScreen('requestStatus');
  };

  const checkRequestStatus = () => {
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
      Alert.alert('Approved', `${user.name} has been approved!`);
    }
  };

  const rejectUser = (userId: number) => {
    const user = pendingUsers.find(u => u.id === userId);
    if (user) {
      setPendingUsers(pendingUsers.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
      Alert.alert('Rejected', `${user.name}'s request has been rejected`);
    }
  };

  const handleApproved = () => {
    if (currentUser) {
      if (currentUser.role === 'Teacher') {
        setRole('teacher');
        setScreen('teacher');
      } else {
        setRole('monitoring');
        setScreen('monitoring');
      }
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <SplashScreen />;
      case 'signin':
        return (
          <SignInScreen onBack={splashDone} onAdminLogin={adminLogin} onTeacherLogin={teacherLogin} onMonitoringLogin={monitoringLogin} onSignUp={() => go('signup')} onForgotPassword={() => go('forgot')} approvedUsers={approvedUsers} />
        );
      case 'signup': return <SignUpScreen onBack={() => go('signin')} onSignUp={handleSignUp} />;
      case 'requestStatus':
        return (
          <RequestStatusScreen onBack={goBack} onApproved={handleApproved} userEmail={currentUser?.email || ''} userRole={currentUser?.role || ''} checkStatus={checkRequestStatus} />
        );
      case 'forgot': return <ForgotPasswordScreen onBack={() => go('signin')} onSent={() => go('signin')} />;

      // ADMIN SCREENS
      case 'admin': return <AdminDashboard onNavigate={go} onLogout={logout} />;
      case 'pending': return <PendingApprovalsScreen onBack={goBack} pendingUsers={pendingUsers} onApprove={approveUser} onReject={rejectUser} />;
      case 'users': return <UserProfilesScreen onBack={goBack} />;
      case 'assignDuty': return <AssignDutyScreen onBack={goBack} onNavigate={go} />;
      case 'assignDutyDetail': return <AssignDutyDetailScreen onBack={goBack} official={params.official} />;
      case 'timetableManagement': return <TimetableManagementScreen onBack={goBack} onNavigate={go} />;
      case 'addEditClass':
        return (
          <AddEditClassScreen onBack={goBack} onSave={(classData) => { Alert.alert('Success', 'Class saved successfully'); go('timetableManagement'); }} editData={params.editData} defaultDept={params.defaultDept} defaultSem={params.defaultSem} defaultDay={params.defaultDay} defaultPeriod={params.defaultPeriod} />
        );
      case 'complaints': return <ComplaintsScreen onBack={goBack} />;

      // TEACHER SCREENS
      case 'teacher': return <TeacherDashboard onNavigate={go} onLogout={logout} />;
      case 'submitComplaint': return <SubmitComplaintScreen onBack={goBack} />;

      // MONITORING SCREENS
      case 'monitoring': return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} />;
      case 'viewAssignDuty': return <ViewAssignDutyScreen onBack={goBack} />;
      case 'markAttendance': return <MarkAttendanceScreen onBack={goBack} />;

      // SHARED SCREENS
      case 'history':
      case 'reports':
      case 'attendanceHistory': 
        return (
          <AttendanceHistoryReport 
            onBack={goBack} 
            userRole={role} 
            currentUser={currentUser} 
          />
        );

      default:
        if (role === 'admin') return <AdminDashboard onNavigate={go} onLogout={logout} />;
        if (role === 'teacher') return <TeacherDashboard onNavigate={go} onLogout={logout} />;
        if (role === 'monitoring') return <MonitoringOfficialDashboard onNavigate={go} onLogout={logout} />;
        return (
          <SignInScreen onBack={splashDone} onAdminLogin={adminLogin} onTeacherLogin={teacherLogin} onMonitoringLogin={monitoringLogin} onSignUp={() => go('signup')} onForgotPassword={() => go('forgot')} approvedUsers={approvedUsers} />
        );
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});