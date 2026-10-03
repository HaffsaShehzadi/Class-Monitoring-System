import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Platform, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { complaintService } from '../../services/complaintService';
import { tokenStorage } from '../../services/tokenStorage';

export default function SubmitComplaintScreen({ onBack }: any) {
  const [complaint, setComplaint] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState<any>(null);
  const [inputHeight, setInputHeight] = useState(60);

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState<{ name: string; department: string }>({
    name: 'Teacher',
    department: ''
  });

  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await tokenStorage.getUser();
        if (user) {
          setTeacherInfo({
            name: user.name || 'Teacher',
            department: user.department || ''
          });
        }
      } catch (error) {
        console.log('Error loading user info in complaints:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchComplaints();
    }
  }, [showHistory]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      Alert.alert('Error', 'Please write description first');
      return;
    }

    setLoading(true);
    try {
  
      await complaintService.createComplaint(complaint);
      
      setComplaint('');
      setInputHeight(60);
      Alert.alert('Success', 'Complaint submitted successfully');
      
      if (showHistory) {
        await fetchComplaints();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return '#FF9800';  
    if (status === 'resolved') return '#4CAF50'; 
    if (status === 'rejected') return '#F44336';
    return '#999';
  };

  const getInitials = (name: string) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (viewingComplaint) {
    const item = viewingComplaint;
    const teacherName = item.submittedBy || teacherInfo.name;
    const teacherDept = item.department || teacherInfo.department;

    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setViewingComplaint(null)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.detailCard}>
            <Text style={styles.detailName}>{teacherName}</Text>
            <Text style={styles.detailDept}>
              {teacherDept ? `${teacherDept} Department` : 'Teacher'}
            </Text>
            <View style={styles.detailDivider} />
            <Text style={styles.detailDate}>Submitted on {item.date}</Text>
          </View>

          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{item.text}</Text>

            {item.status === 'pending' ? (
              <View style={[styles.resolvedBox, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#FF9800" style={{ marginRight: 6 }} />
                <Text style={[styles.resolvedText, { color: '#FF9800' }]}>
                  Pending - Awaiting review by Admin
                </Text>
              </View>
            ) : (
              <View style={[styles.resolvedBox, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <MaterialCommunityIcons 
                  name={item.status === 'resolved' ? "check-circle-outline" : "close-circle-outline"} 
                  size={18} 
                  color={getStatusColor(item.status)} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.resolvedText, { color: getStatusColor(item.status) }]}>
                  {item.status === 'resolved' ? 'Resolved' : 'Rejected'} on {item.resolvedDate || item.date}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showHistory) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint History</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={styles.emptyText}>Loading complaints...</Text>
            </View>
          ) : complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="comment-off-outline" size={60} color="#999" />
              <Text style={styles.emptyText}>No complaints submitted yet</Text>
              <Text style={styles.emptySubtext}>Complaints you submit will appear here</Text>
            </View>
          ) : (
            complaints.map((item: any) => {
              const teacherName = item.submittedBy || teacherInfo.name;
              const teacherDept = item.department || teacherInfo.department;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardAvatar}>
                      <Text style={styles.cardAvatarText}>{getInitials(teacherName)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.teacherName}>{teacherName}</Text>
                      <Text style={styles.deptText}>
                        {teacherDept ? `${teacherDept} Department` : 'Teacher'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.dateText}>{item.date}</Text>

                  {/* View Complaint Button (Admin ki tarah) */}
                  <TouchableOpacity style={styles.viewBtn} onPress={() => setViewingComplaint(item)}>
                    <Text style={styles.viewBtnText}>View Complaint</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Complaint</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>
      )}
      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowHistory(true);
            }}
          >
            <MaterialCommunityIcons name="history" size={18} color="#1A237E" />
            <Text style={styles.menuItemText}>Complaint History</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.pageTitle}>Submit New Complaint</Text>
        <Text style={styles.pageSubtitle}>
          Please describe your issue in detail below
        </Text>
        
        <Text style={styles.label}>Description *</Text>
        
        <TextInput
          style={[styles.input, { height: Math.max(60, inputHeight) }]}
          placeholder="Write about any issue..."
          placeholderTextColor="#999"
          multiline
          value={complaint}
          onChangeText={setComplaint}
          onContentSizeChange={(e) => {
            setInputHeight(e.nativeEvent.contentSize.height);
          }}
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 2, 
    borderBottomColor: '#1A237E' 
  },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  menuBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },

  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  menuDropdown: { 
    position: 'absolute', 
    top: Platform.OS === 'web' ? 65 : 105, 
    right: 12, 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    elevation: 9, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    paddingVertical: 6, 
    minWidth: 190, 
    zIndex: 20 
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  menuItemText: { fontSize: 14, fontWeight: '700', color: '#1A237E' },

  content: { 
    padding: 20, 
    paddingBottom: 40,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardAvatarText: { fontSize: 16, fontWeight: '800', color: '#1A237E' },
  cardInfo: { flex: 1 },
  teacherName: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  deptText: { fontSize: 12, color: '#666' },
  dateText: { fontSize: 12, color: '#666', marginBottom: 12 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },

  viewBtn: { backgroundColor: '#1A237E', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  detailContent: { 
    padding: 20, 
    paddingBottom: 40,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  detailCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  detailName: { fontSize: 17, fontWeight: '800', color: '#1A237E' },
  detailDept: { fontSize: 13, color: '#666', marginTop: 3 },
  detailDivider: { height: 1, backgroundColor: '#E8EAF6', marginVertical: 10 },
  detailDate: { fontSize: 13, color: '#1A237E', fontWeight: '700' },

  descCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  descLabel: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 8 },
  descText: { fontSize: 14, color: '#333', lineHeight: 22 },

  resolvedBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 14 
  },
  resolvedText: { fontSize: 13, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },

  menuDots: { fontSize: 24, fontWeight: '700', color: '#1A237E', paddingHorizontal: 6 },

  mainContent: { 
    padding: 20, 
    paddingBottom: 40,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1A237E', 
    textAlign: 'center',
    marginBottom: 5 
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  label: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    minHeight: 60,
    maxHeight: 300,
    marginBottom: 20,
    textAlignVertical: 'top',
    elevation: 1,
    color: '#333',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A237E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 6,
    elevation: 3,
    alignSelf: 'center',
    minWidth: 150,
  },
  submitText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});