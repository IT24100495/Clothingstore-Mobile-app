import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { getOrderById, cancelOrder } from '../../api';

const STATUS_COLOR = {
  Pending:    '#F59E0B',
  Processing: '#3B82F6',
  Shipped:    '#8B5CF6',
  Delivered:  '#10B981',
  Cancelled:  '#EF4444',
};

const STATUS_ICON = {
  Pending:    '🕐',
  Processing: '⚙️',
  Shipped:    '🚚',
  Delivered:  '✅',
  Cancelled:  '❌',
};

export default function OrderDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(res => setOrder(res.data.order))
      .catch(() => Toast.show({ type: 'error', text1: 'Failed to load order' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    try {
      await cancelOrder(id);
      Toast.show({ type: 'success', text1: 'Order cancelled' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Cannot cancel order' });
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;
  if (!order) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Order not found</Text>;

  const color = STATUS_COLOR[order.status] || '#888';
  const isPending = order.status === 'Pending';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: color + '15' }]}>
        <Text style={styles.statusIcon}>{STATUS_ICON[order.status]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTxt, { color }]}>{order.status}</Text>
          <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.badgeTxt, { color }]}>{order.status}</Text>
        </View>
      </View>

      {/* Pending Edit Notice */}
      {isPending && (
        <View style={styles.editNotice}>
          <Text style={styles.editNoticeTxt}>
            ✏️ Your order is pending — you can still edit the shipping address.
          </Text>
          <TouchableOpacity
            style={styles.editAddressBtn}
            onPress={() => navigation.navigate('EditOrder', { order })}
          >
            <Text style={styles.editAddressBtnTxt}>Edit Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛍️ Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>Size: {item.size} · Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>LKR {order.totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
          {isPending && (
            <TouchableOpacity onPress={() => navigation.navigate('EditOrder', { order })}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.addressBox}>
          <Text style={styles.addressTxt}>{order.shippingAddress.street}</Text>
          <Text style={styles.addressTxt}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text>
          <Text style={styles.addressTxt}>{order.shippingAddress.country}</Text>
        </View>
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Method</Text>
          <Text style={styles.infoVal}>{order.paymentMethod}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoVal, { color: order.isPaid ? '#10B981' : '#F59E0B' }]}>
            {order.isPaid ? '✅ Paid' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      {/* Cancel Button - only for Pending or Processing */}
      {['Pending', 'Processing'].includes(order.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelTxt}>❌ Cancel Order</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginBottom: 2 },
  statusIcon: { fontSize: 36 },
  statusTxt: { fontSize: 18, fontWeight: '700' },
  orderId: { fontSize: 13, color: '#555', marginTop: 2 },
  orderDate: { fontSize: 12, color: '#888' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  editNotice: { backgroundColor: '#FFF7ED', borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginHorizontal: 12, marginBottom: 2, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  editNoticeTxt: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  editAddressBtn: { backgroundColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editAddressBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 10, padding: 14, elevation: 2, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  editLink: { color: '#6C63FF', fontWeight: '600', fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#6C63FF' },
  addressBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10 },
  addressTxt: { fontSize: 14, color: '#555', lineHeight: 22 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500' },
  cancelBtn: { marginHorizontal: 12, marginTop: 8, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelTxt: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});