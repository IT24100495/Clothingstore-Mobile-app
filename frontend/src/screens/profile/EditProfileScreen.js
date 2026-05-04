import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { updateProfile } from '../../api';

export default function EditProfileScreen({ route, navigation }) {
  const { profile } = route.params;
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [street, setStreet] = useState(profile?.address?.street || '');
  const [city, setCity] = useState(profile?.address?.city || '');
  const [postalCode, setPostalCode] = useState(profile?.address?.postalCode || '');
  const [country, setCountry] = useState(profile?.address?.country || '');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) return Toast.show({ type: 'error', text1: 'Name is required' });
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('address[street]', street);
      formData.append('address[city]', city);
      formData.append('address[postalCode]', postalCode);
      formData.append('address[country]', country);
      if (avatar) formData.append('avatar', { uri: avatar, name: 'avatar.jpg', type: 'image/jpeg' });

      await updateProfile(formData);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
        <Image source={{ uri: avatar || profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6C63FF&color=fff&size=120` }} style={styles.avatar} />
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" keyboardType="phone-pad" />

      <Text style={styles.sectionTitle}>📍 Address</Text>
      <Text style={styles.label}>Street</Text>
      <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="No. 12, Main Street" />
      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Colombo" />
      <Text style={styles.label}>Postal Code</Text>
      <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="10100" keyboardType="numeric" />
      <Text style={styles.label}>Country</Text>
      <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Sri Lanka" />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveTxt}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  avatarContainer: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#6C63FF' },
  changePhoto: { color: '#6C63FF', fontWeight: '600', marginTop: 8, fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  saveBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
