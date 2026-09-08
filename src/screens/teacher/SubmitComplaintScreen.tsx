import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { complaintService } from '../../services/complaintService';

export default function SubmitComplaintScreen({ onBack }: any) {
  const [complaint, setComplaint] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputHeight, setInputHeight] = useState(60);
  
  // ✅ Real data state (Mock data hata diya)
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Screen load hone par ya history open hone par data fetch karein
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
      // ✅ Backend API Call
      await complaintService.createComplaint(complaint);
      
      setComplaint('');
      setInputHeight(60);
      Alert.alert('Success', 'Complaint submitted successfully');
      
      // Agar history screen open hai toh list refresh karein
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
    if (status === 'pending') return '#F44336';    // RED
    if (status === 'resolved') return '#4CAF50';   // GREEN
    if (status === 'rejected') return '#C62828';   // Dark Red
    return '#999';
  };

  // Agar history screen open hai to wo dikhao
  if (showHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint History</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.historyContent}>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#1A237E" />
              <Text style={styles.emptyText}>Loading complaints...</Text>
            </View>
          ) : complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No complaints submitted yet</Text>
            </View>
          ) : (
            complaints.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
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
                    <Text style={styles.resolvedText}>
                      Resolved on {item.resolvedDate}
                    </Text>
                  </View>
                )}
                {item.status === 'rejected' && item.resolvedDate && (
                  <View style={styles.rejectedBox}>
                    <Text style={styles.rejectedText}>
                      Rejected on {item.resolvedDate}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Submit Screen
  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowHistory(true);
            }}
          >
            <Text style={styles.menuText}>Complaint History</Text>
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
          placeholder="Write about wrong attendance or any issue..."
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

// ✅ STYLES: Bilkul same jaise aapke original code mein the
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
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  menuDots: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  
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