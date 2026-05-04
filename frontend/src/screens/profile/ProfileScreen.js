import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { getProfile } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data.user))
      .catch(() => Toast.show({ type: 'error', text1: 'Failed to load profile' }))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    Toast.show({ type: 'success', text1: 'Logged out' });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Image
          source={{ uri: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=6C63FF&color=fff&size=120` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.role === 'admin' && <View style={styles.adminBadge}><Text style={styles.adminTxt}>Admin</Text></View>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Account Info</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoVal}>{profile?.phone || '—'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>City</Text><Text style={styles.infoVal}>{profile?.address?.city || '—'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Country</Text><Text style={styles.infoVal}>{profile?.address?.country || '—'}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Settings</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile', { profile })}>
          <Text style={styles.menuTxt}>✏️  Edit Profile</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.menuTxt}>🔒  Change Password</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutTxt}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#6C63FF', alignItems: 'center', paddingTop: 40, paddingBottom: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 13, color: '#e0dfff', marginTop: 4 },
  adminBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginTop: 8 },
  adminTxt: { color: '#6C63FF', fontWeight: '700', fontSize: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, margin: 12, padding: 16, elevation: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 14, color: '#888' },
  infoVal: { fontSize: 14, color: '#222', fontWeight: '500' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuTxt: { fontSize: 15, color: '#333' },
  arrow: { fontSize: 20, color: '#aaa' },
  logoutBtn: { margin: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, padding: 14, alignItems: 'center' },
  logoutTxt: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});
