import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { changePassword } from '../../api';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return Toast.show({ type: 'error', text1: 'All fields are required' });
    if (newPassword !== confirmPassword)
      return Toast.show({ type: 'error', text1: 'New passwords do not match' });
    if (newPassword.length < 6)
      return Toast.show({ type: 'error', text1: 'New password must be at least 6 characters' });

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Toast.show({ type: 'success', text1: 'Password changed successfully!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Enter current password" />

      <Text style={styles.label}>New Password</Text>
      <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Min 6 characters" />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repeat new password" />

      <TouchableOpacity style={styles.btn} onPress={handleChange} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>Update Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  btn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
