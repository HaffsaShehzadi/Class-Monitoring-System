import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SubmitComplaintScreen({ onBack }: any) {
  const [complaint, setComplaint] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputHeight, setInputHeight] = useState(60);

  const [complaints, setComplaints] = useState<any[]>([
    {
      id: 1,
      text: 'Attendance marked wrong for Monday Period 1. I was present but marked absent.',
      date: '2024-06-01',
      status: 'resolved',
      resolvedDate: '2024-06-02',
    },
    {
      id: 2,
      text: 'Room number is incorrect in timetable for BSCS 2nd semester.',
      date: '2024-06-03',
      status: 'pending',
      resolvedDate: null,
    },
  ]);

  const handleSubmit = () => {
    if (!complaint.trim()) {
      Alert.alert('Error', 'Please write description first');
      return;
    }

    const newComplaint = {
      id: Date.now(),
      text: complaint,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'pending',
      resolvedDate: null,
    };

    setComplaints([newComplaint, ...complaints]);
    setComplaint('');
    setInputHeight(60);
    Alert.alert('✅ Success', 'Complaint submitted successfully');
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return '#FF9800';
    if (status === 'resolved') return '#4CAF50';
    if (status === 'rejected') return '#F44336';
    return '#999';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pending') return 'clock-outline';
    if (status === 'resolved') return 'check-circle';
    if (status === 'rejected') return 'close-circle';
    return 'help-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Complaint</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#1A237E" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowHistory(true);
            }}
          >
            <MaterialCommunityIcons name="history" size={20} color="#1A237E" />
            <Text style={styles.menuText}>Complaint History</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ FULL SCREEN - No Card Wrapper */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#1A237E" />
        </View>
        
        <Text style={styles.pageTitle}>Submit New Complaint</Text>
        <Text style={styles.pageSubtitle}>
          Please describe your issue in detail below
        </Text>
        
        <Text style={styles.label}>Description *</Text>
        
        <TextInput
          style={[styles.input, { height: Math.max(60, inputHeight) }]}
          placeholder="Write about wrong attendance or any issue..."
          multiline
          value={complaint}
          onChangeText={setComplaint}
          onContentSizeChange={(e) => {
            setInputHeight(e.nativeEvent.contentSize.height);
          }}
          textAlignVertical="top"
        />
        
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <MaterialCommunityIcons name="send" size={16} color="#FFF" />
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ CENTERED BIG CARD MODAL - neeche se nahi aata */}
      <Modal visible={showHistory} transparent animationType="fade">
        <View style={styles.historyOverlay}>
          <View style={styles.historyCard}>
            {/* Card Header */}
            <View style={styles.historyCardHeader}>
              <Text style={styles.historyCardTitle}>Complaint History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <MaterialCommunityIcons name="close" size={26} color="#1A237E" />
              </TouchableOpacity>
            </View>

            {/* Card Body - Scrollable */}
            <ScrollView contentContainerStyle={styles.historyContent} showsVerticalScrollIndicator={true}>
              {complaints.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-text-off" size={60} color="#999" />
                  <Text style={styles.emptyText}>No complaints submitted yet</Text>
                </View>
              ) : (
                complaints.map(item => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <MaterialCommunityIcons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyText}>
                      {item.text}
                    </Text>
                    {item.status === 'resolved' && item.resolvedDate && (
                      <View style={styles.resolvedBox}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.resolvedText}>
                          Resolved on {item.resolvedDate}
                        </Text>
                      </View>
                    )}
                    {item.status === 'rejected' && item.resolvedDate && (
                      <View style={styles.rejectedBox}>
                        <MaterialCommunityIcons name="close-circle" size={16} color="#F44336" />
                        <Text style={styles.rejectedText}>
                          Rejected on {item.resolvedDate}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
    elevation: 2 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  
  menu: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  menuText: { fontSize: 14, color: '#1A237E', fontWeight: '600' },
  
  mainContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
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
  
  // ✅ CENTERED BIG CARD - overlay
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  
  // ✅ BARA CARD - 95% width, 90% height
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '95%',
    maxWidth: 550,
    maxHeight: '90%',
    elevation: 10,
    overflow: 'hidden',
  },
  
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
    backgroundColor: '#FFF',
  },
  historyCardTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  
  historyContent: { padding: 15, paddingBottom: 25 },
  
  historyItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EAF6',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#666' },
  historyText: { fontSize: 14, color: '#333', lineHeight: 20 },
  
  resolvedText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  rejectedText: { fontSize: 12, color: '#F44336', fontWeight: '600' },
  
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: '#666', marginTop: 15 },
});