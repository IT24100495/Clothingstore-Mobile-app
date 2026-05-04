import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal, ScrollView,
  TextInput, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsers(); }, [fetchUsers]));

  const openView = (user) => { setSelectedUser(user); setViewModalVisible(true); };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setViewModalVisible(false);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editName || !editEmail) return Toast.show({ type: 'error', text1: 'Name and email are required' });
    setUpdating(true);
    try {
      await api.put(`/users/${selectedUser._id}`, { name: editName, email: editEmail, phone: editPhone, role: editRole });
      Toast.show({ type: 'success', text1: 'User updated!' });
      setEditModalVisible(false);
      fetchUsers();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (user) => {
    Alert.alert('Delete User', `Are you sure you want to delete "${user.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/users/${user._id}`);
          Toast.show({ type: 'success', text1: 'User deleted' });
          setViewModalVisible(false);
          fetchUsers();
        } catch (err) {
          Toast.show({ type: 'error', text1: err.response?.data?.message || 'Delete failed' });
        }
      }}
    ]);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openView(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{item.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#6C63FF22' : '#10B98122' }]}>
          <Text style={[styles.roleTxt, { color: item.role === 'admin' ? '#6C63FF' : '#10B981' }]}>{item.role}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{users.length}</Text>
          <Text style={styles.summaryLabel}>Total Users</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#6C63FF', borderTopWidth: 3 }]}>
          <Text style={[styles.summaryNum, { color: '#6C63FF' }]}>{adminCount}</Text>
          <Text style={styles.summaryLabel}>Admins</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#10B981', borderTopWidth: 3 }]}>
          <Text style={[styles.summaryNum, { color: '#10B981' }]}>{userCount}</Text>
          <Text style={styles.summaryLabel}>Customers</Text>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="🔍 Search by name or email..." value={search} onChangeText={setSearch} />

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item._id}
        renderItem={renderUser}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyIcon}>👥</Text><Text style={styles.empty}>No users found</Text></View>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* View Modal */}
      <Modal visible={viewModalVisible} animationType="slide" onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalContainer}>
          {selectedUser && (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.modalAvatarBox}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarTxt}>{selectedUser.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.modalName}>{selectedUser.name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: selectedUser.role === 'admin' ? '#6C63FF22' : '#10B98122', marginTop: 6 }]}>
                  <Text style={[styles.roleTxt, { color: selectedUser.role === 'admin' ? '#6C63FF' : '#10B981' }]}>{selectedUser.role}</Text>
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Account Info</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoVal}>{selectedUser.email}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoVal}>{selectedUser.phone || '—'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Joined</Text><Text style={styles.infoVal}>{new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
              </View>
              {selectedUser.address?.city && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📍 Address</Text>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Street</Text><Text style={styles.infoVal}>{selectedUser.address.street || '—'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>City</Text><Text style={styles.infoVal}>{selectedUser.address.city || '—'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Country</Text><Text style={styles.infoVal}>{selectedUser.address.country || '—'}</Text></View>
                </View>
              )}
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(selectedUser)}>
                <Text style={styles.editBtnTxt}>✏️  Edit User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedUser)}>
                <Text style={styles.deleteBtnTxt}>🗑️  Delete User</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Full name" />
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="Phone number" keyboardType="phone-pad" />
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity style={[styles.roleBtn, editRole === 'user' && styles.roleBtnActive]} onPress={() => setEditRole('user')}>
                <Text style={[styles.roleBtnTxt, editRole === 'user' && styles.roleBtnTxtActive]}>👤 Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, editRole === 'admin' && styles.roleBtnActiveAdmin]} onPress={() => setEditRole('admin')}>
                <Text style={[styles.roleBtnTxt, editRole === 'admin' && styles.roleBtnTxtActive]}>⚙️ Admin</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={updating}>
              <Text style={styles.saveBtnTxt}>{updating ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summaryRow: { flexDirection: 'row', padding: 12, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', elevation: 2 },
  summaryNum: { fontSize: 22, fontWeight: '700', color: '#6C63FF' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  search: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 12, marginBottom: 10, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 10, padding: 12, alignItems: 'center', elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  email: { fontSize: 12, color: '#888', marginTop: 2 },
  phone: { fontSize: 12, color: '#aaa', marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
  roleBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  roleTxt: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 10, color: '#aaa' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60 },
  empty: { color: '#999', fontSize: 16, marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  closeBtn: { fontSize: 20, color: '#888', padding: 4 },
  modalAvatarBox: { alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  modalAvatarTxt: { color: '#fff', fontSize: 36, fontWeight: '700' },
  modalName: { fontSize: 20, fontWeight: '700', color: '#222', marginTop: 10 },
  section: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500', flex: 1, textAlign: 'right' },
  editBtn: { backgroundColor: '#6C63FF', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  editBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
  deleteBtn: { borderWidth: 1.5, borderColor: '#EF4444', padding: 14, borderRadius: 10, alignItems: 'center' },
  deleteBtnTxt: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  roleRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  roleBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 12, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#10B98122', borderColor: '#10B981' },
  roleBtnActiveAdmin: { backgroundColor: '#6C63FF22', borderColor: '#6C63FF' },
  roleBtnTxt: { fontWeight: '600', color: '#555' },
  roleBtnTxtActive: { color: '#222' },
  saveBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});