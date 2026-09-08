import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../services/userService'; // ✅ NEW IMPORT

export default function UserProfilesScreen({ onBack }: any) {
  const [users, setUsers] = useState<any[]>([]); // ✅ Real data state
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<any>(null);

  // ✅ Screen load hone par real data fetch karein
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 1500);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ✅ UPDATED: Backend API call ke sath
  const handleDeleteUser = (id: number, name: string) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await userService.deleteUser(id);
              setUsers(prev => prev.filter(u => u.id !== id)); // Local state update for smooth UI
              showToast(`${name} removed successfully`, 'error');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove user');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profiles</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {['All', 'Teacher', 'Monitoring Official'].map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.filterTab, filterRole === role && styles.filterTabActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[styles.filterText, filterRole === role && styles.filterTextActive]}>
                {role === 'All' ? 'All Users' : role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultText}>
          Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Text>

        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={styles.emptyText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          filteredUsers.map(user => (
            <View key={user.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.roleDept}>
                    {user.role} {user.department !== '-' ? `• ${user.department}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtnView} onPress={() => handleViewProfile(user)}>
                  <Text style={styles.actionTextView}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnDelete} onPress={() => handleDeleteUser(user.id, user.name)}>
                  <Text style={styles.actionTextDelete}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* View Profile Modal */}
      <Modal visible={viewModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Profile</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView>
                <View style={styles.profileAvatar}>
                  <Text style={styles.avatarInitialsLarge}>{getInitials(selectedUser.name)}</Text>
                </View>
                <Text style={styles.profileName}>{selectedUser.name}</Text>
                <Text style={styles.profileRole}>{selectedUser.role}</Text>

                <View style={styles.profileSection}>
                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>Role:</Text>
                    <Text style={styles.profileValue}>{selectedUser.role}</Text>
                  </View>

                  {selectedUser.role === 'Teacher' && selectedUser.department !== '-' && (
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Department:</Text>
                      <Text style={styles.profileValue}>{selectedUser.department}</Text>
                    </View>
                  )}

                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>Join Date:</Text>
                    <Text style={styles.profileValue}>
                      {selectedUser.joinDate 
                      ? new Date(selectedUser.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                      }
                      </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeModalBtn} 
                  onPress={() => setViewModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {toast && (
        <View style={styles.toastOverlay} pointerEvents="none">
          <Animated.View 
            style={[
              styles.toast,
              {
                opacity: toastAnim,
                transform: [{
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.toastText}>{toast.msg}</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ✅ STYLES: Bilkul same jaise aapke original code mein the (Zero UI changes)
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
    borderBottomColor: '#1A237E' 
  },
  backArrow: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A237E', flex: 1, textAlign: 'center' },
  content: { padding: 15 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 4 },
  clearIcon: { fontSize: 18, color: '#999', fontWeight: '700', padding: 4 },
  
  filterRow: { flexDirection: 'row', marginBottom: 15, gap: 8 },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterTabActive: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  filterText: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#666',
    textAlign: 'center', 
  },
  filterTextActive: { color: '#FFF' },
  resultText: { fontSize: 13, color: '#666', marginBottom: 10, fontWeight: '600' },
  
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  avatarInitials: { fontSize: 18, fontWeight: '800', color: '#1A237E' },
  userInfo: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 2 },
  roleDept: { fontSize: 13, color: '#666', flex: 1 },
  
  cardActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  actionBtnView: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#E8EAF6', 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  actionTextView: { color: '#1A237E', fontSize: 14, fontWeight: '600' },
  actionBtnDelete: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFEBEE', 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  actionTextDelete: { color: '#F44336', fontSize: 14, fontWeight: '600' },
  
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    maxHeight: '85%',
    width: '100%',
    padding: 25,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A237E' },
  modalCloseIcon: { fontSize: 22, color: '#1A237E', fontWeight: '700' },
  
  profileAvatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#E8EAF6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    alignSelf: 'center',
    marginBottom: 15 
  },
  avatarInitialsLarge: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1A237E' 
  },
  profileName: { fontSize: 24, fontWeight: '800', color: '#1A237E', textAlign: 'center', marginBottom: 5 },
  profileRole: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, fontWeight: '600' },
  
  profileSection: { marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  profileLabel: { fontSize: 14, color: '#666', fontWeight: '600', width: 100 },
  profileValue: { fontSize: 14, color: '#333', flex: 1, fontWeight: '500' },
  
  closeModalBtn: { backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  closeModalText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  toastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxWidth: '80%',
    backgroundColor: '#FFF',
  },
  toastText: { color: '#333', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});