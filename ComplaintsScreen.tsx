import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COMPLAINTS = [
  { 
    id: 1, 
    teacher: 'Ali Khan', 
    subject: 'Math', 
    date: '2024-06-01', 
    description: 'Period 2 mein mujhe ghalat "Absent" mark kiya gaya hai, jabke main class le raha tha.', 
    status: 'pending' 
  },
  { 
    id: 2, 
    teacher: 'Hassan Raza', 
    subject: 'English', 
    date: '2024-05-30', 
    description: '30 May ko mujhe ghalat "Late" mark kiya gaya, main time par class mein mojood tha.', 
    status: 'pending' 
  },
  { 
    id: 3, 
    teacher: 'Fatima Malik', 
    subject: 'Science', 
    date: '2024-05-28', 
    description: '28 May ki meri Period 3 ki attendance system mein missing show ho rahi hai.', 
    status: 'pending' 
  },
];

export default function ComplaintsScreen({ onBack }: { onBack: () => void }) {
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  // Detail Screen Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const openDetailScreen = (complaint: any) => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };

  const handleResolve = () => {
    Alert.alert(
      '✅ Resolve Complaint',
      'Are you sure you want to resolve this complaint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setComplaints(prev => prev.map(c => 
              c.id === selectedComplaint.id ? { ...c, status: 'resolved' } : c
            ));
            setDetailModalVisible(false);
            setSelectedComplaint(null);
            Alert.alert('Success', '✅ Complaint resolved successfully!');
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      '❌ Reject Complaint',
      'Are you sure you want to reject this complaint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setComplaints(prev => prev.map(c => 
              c.id === selectedComplaint.id ? { ...c, status: 'rejected' } : c
            ));
            setDetailModalVisible(false);
            setSelectedComplaint(null);
            Alert.alert('Success', '❌ Complaint rejected!');
          }
        }
      ]
    );
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending');
  const completedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'rejected');

  const displayComplaints = activeTab === 'pending' ? pendingComplaints : completedComplaints;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resolve Complaints</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={20} 
            color={activeTab === 'pending' ? '#1A237E' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingComplaints.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <MaterialCommunityIcons 
            name="check-all" 
            size={20} 
            color={activeTab === 'completed' ? '#1A237E' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Resolved/Rejected ({completedComplaints.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.list}>
        {displayComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={activeTab === 'pending' ? 'check-circle-outline' : 'inbox-outline'} 
              size={60} 
              color={activeTab === 'pending' ? '#4CAF50' : '#999'} 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'pending' 
                ? '🎉 All complaints resolved!' 
                : 'No resolved or rejected complaints yet'}
            </Text>
          </View>
        ) : (
          displayComplaints.map(complaint => (
            <View key={complaint.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account-school" size={28} color="#1A237E" />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.teacher}>{complaint.teacher}</Text>
                  <Text style={styles.department}>{complaint.subject} Department</Text>
                </View>
                {/* Status Badge for Completed Tab */}
                {complaint.status !== 'pending' && (
                  <View style={[
                    styles.statusBadge,
                    complaint.status === 'resolved' ? styles.resolvedBadge : styles.rejectedBadge
                  ]}>
                    <MaterialCommunityIcons 
                      name={complaint.status === 'resolved' ? 'check-circle' : 'close-circle'} 
                      size={14} 
                      color="#FFF" 
                    />
                    <Text style={styles.statusText}>
                      {complaint.status === 'resolved' ? 'Resolved' : 'Rejected'}
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.viewBtn} 
                onPress={() => openDetailScreen(complaint)}
              >
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#FFF" />
                <Text style={styles.viewBtnText}>View Complaint</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Detail Screen Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <View style={styles.detailScreen}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Complaint Details</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.detailContent}>
            <View style={styles.teacherProfile}>
              <View style={styles.detailAvatar}>
                <MaterialCommunityIcons name="account-school" size={40} color="#1A237E" />
              </View>
              <Text style={styles.detailTeacherName}>{selectedComplaint?.teacher}</Text>
              <Text style={styles.detailDepartment}>{selectedComplaint?.subject} Department</Text>
            </View>
            
            <View style={styles.complaintBox}>
              <View style={styles.complaintLabelRow}>
                <MaterialCommunityIcons name="calendar" size={18} color="#1A237E" />
                <Text style={styles.complaintLabel}>Date</Text>
                <Text style={styles.complaintValue}>{selectedComplaint?.date}</Text>
              </View>
              
              <View style={styles.complaintLabelRow}>
                <MaterialCommunityIcons name="label" size={18} color="#1A237E" />
                <Text style={styles.complaintLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  selectedComplaint?.status === 'resolved' ? styles.resolvedBadge : 
                  selectedComplaint?.status === 'rejected' ? styles.rejectedBadge : styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>
                    {selectedComplaint?.status === 'pending' ? 'Pending' : 
                     selectedComplaint?.status === 'resolved' ? 'Resolved' : 'Rejected'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Complaint</Text>
                <Text style={styles.descriptionText}>{selectedComplaint?.description}</Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Only show Resolve/Reject buttons for pending complaints */}
          {selectedComplaint?.status === 'pending' && (
            <View style={styles.bottomActions}>
              <TouchableOpacity 
                style={[styles.bottomBtn, styles.bottomRejectBtn]} 
                onPress={handleReject}
              >
                <MaterialCommunityIcons name="close-circle" size={20} color="#FFF" />
                <Text style={styles.bottomBtnText}>Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.bottomBtn, styles.bottomResolveBtn]} 
                onPress={handleResolve}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                <Text style={styles.bottomBtnText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#FFF', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  
  // Tab Styles
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 10, 
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#F5F5F5',
    gap: 6
  },
  activeTab: { 
    backgroundColor: '#E8EAF6',
    borderWidth: 2,
    borderColor: '#1A237E'
  },
  tabText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#666' 
  },
  activeTabText: { 
    color: '#1A237E',
    fontWeight: '800'
  },
  
  list: { padding: 15 },
  
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '600', color: '#666' },
  
  // Card Styles
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  infoContainer: { flex: 1 },
  teacher: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  department: { fontSize: 14, color: '#666', fontWeight: '500' },
  
  // Status Badge
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 15,
    gap: 4
  },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  resolvedBadge: { backgroundColor: '#4CAF50' },
  rejectedBadge: { backgroundColor: '#F44336' },
  statusText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: '800' 
  },
  
  viewBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#1A237E', 
    paddingVertical: 12, 
    borderRadius: 8, 
    gap: 8 
  },
  viewBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  
  // Detail Screen
  detailScreen: { flex: 1, backgroundColor: '#F5F5F5' },
  detailHeader: { 
    backgroundColor: '#FFF', 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  detailHeaderTitle: { fontSize: 20, fontWeight: '700', color: '#1A237E' },
  detailContent: { padding: 15 },
  
  teacherProfile: { alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2 },
  detailAvatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  detailTeacherName: { fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 4 },
  detailDepartment: { fontSize: 14, color: '#666', fontWeight: '600' },
  
  complaintBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, elevation: 2 },
  complaintLabelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  complaintLabel: { fontSize: 14, color: '#666', fontWeight: '600', marginLeft: 8, flex: 1 },
  complaintValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  
  descriptionBox: { marginTop: 15 },
  descriptionLabel: { fontSize: 14, color: '#1A237E', fontWeight: '700', marginBottom: 8 },
  descriptionText: { 
    fontSize: 15, 
    color: '#333', 
    lineHeight: 22, 
    backgroundColor: '#F9F9F9', 
    padding: 12, 
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1A237E'
  },
  
  bottomActions: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: 30,
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0',
    gap: 12 
  },
  bottomBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    borderRadius: 10, 
    gap: 6 
  },
  bottomRejectBtn: { backgroundColor: '#F44336' },
  bottomResolveBtn: { backgroundColor: '#4CAF50' },
  bottomBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});