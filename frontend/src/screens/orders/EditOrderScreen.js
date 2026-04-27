import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api';

export default function EditOrderScreen({ route, navigation }) {
  const { order } = route.params;

  const [street, setStreet] = useState(order.shippingAddress.street);
  const [city, setCity] = useState(order.shippingAddress.city);
  const [postalCode, setPostalCode] = useState(order.shippingAddress.postalCode);
  const [country, setCountry] = useState(order.shippingAddress.country);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!street || !city || !postalCode || !country)
      return Toast.show({ type: 'error', text1: 'All address fields are required' });

    setLoading(true);
    try {
      await api.put(`/orders/${order._id}/address`, {
        shippingAddress: { street, city, postalCode, country }
      });
      Toast.show({ type: 'success', text1: 'Address updated successfully!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoTxt}>
          You can only edit the shipping address while your order is still <Text style={styles.infoBold}>Pending</Text>.
        </Text>
      </View>

      {/* Order Info */}
      <View style={styles.orderBox}>
        <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingTxt}>⏳ Pending</Text>
        </View>
      </View>

      {/* Address Form */}
      <Text style={styles.sectionTitle}>📍 Edit Shipping Address</Text>

      <Text style={styles.label}>Street Address *</Text>
      <TextInput
        style={styles.input}
        value={street}
        onChangeText={setStreet}
        placeholder="No. 12, Main Street"
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Colombo"
      />

      <Text style={styles.label}>Postal Code *</Text>
      <TextInput
        style={styles.input}
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="10100"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Country *</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Sri Lanka"
      />

      {/* Current Address Preview */}
      <View style={styles.currentBox}>
        <Text style={styles.currentTitle}>Current Address:</Text>
        <Text style={styles.currentTxt}>{order.shippingAddress.street}</Text>
        <Text style={styles.currentTxt}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text>
        <Text style={styles.currentTxt}>{order.shippingAddress.country}</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveTxt}>💾 Save Changes</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelTxt}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  infoIcon: { fontSize: 16 },
  infoTxt: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 20 },
  infoBold: { fontWeight: '700' },
  orderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, elevation: 2 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#222' },
  pendingBadge: { backgroundColor: '#FEF3C7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  pendingTxt: { color: '#92400E', fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  currentBox: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginTop: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  currentTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  currentTxt: { fontSize: 13, color: '#555', lineHeight: 22 },
  saveBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderWidth: 1.5, borderColor: '#ddd', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  cancelTxt: { color: '#888', fontWeight: '600', fontSize: 15 },
});