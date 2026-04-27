import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getAllOrders, updateOrderStatus } from '../../api';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Processing: '#3B82F6',
  Shipped: '#8B5CF6',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data.orders);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to load orders' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, status);
      Toast.show({ type: 'success', text1: `Order marked as ${status}` });
      setModalVisible(false);
      fetchOrders();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const getStatusCount = (status) => orders.filter(o => o.status === status).length;

  const renderOrder = ({ item }) => {
    const color = STATUS_COLORS[item.status] || '#888';
    return (
      <TouchableOpacity style={styles.card} onPress={() => openOrder(item)}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.customerName}>👤 {item.user?.name || 'Unknown'}</Text>
            <Text style={styles.customerEmail}>✉️ {item.user?.email || ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.badgeTxt, { color }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.itemCount}>🛍️ {item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
          <Text style={styles.total}>LKR {item.totalPrice.toFixed(2)}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>

      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        {ALL_STATUSES.map(s => (
          <View key={s} style={[styles.summaryCard, { borderTopColor: STATUS_COLORS[s], borderTopWidth: 3 }]}>
            <Text style={[styles.summaryNum, { color: STATUS_COLORS[s] }]}>{getStatusCount(s)}</Text>
            <Text style={styles.summaryLabel}>{s}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {['All', ...ALL_STATUSES].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
            onPress={() => setFilterStatus(s)}
          >
            <Text style={[styles.filterTxt, filterStatus === s && styles.filterTxtActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item._id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.empty}>No orders found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Order Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {selectedOrder && (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Order ID & Status */}
              <View style={styles.section}>
                <View style={styles.row}>
                  <Text style={styles.sectionTitle}>#{selectedOrder._id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[selectedOrder.status] || '#888') + '22' }]}>
                    <Text style={[styles.badgeTxt, { color: STATUS_COLORS[selectedOrder.status] || '#888' }]}>
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>

              {/* Customer Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Customer</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoVal}>{selectedOrder.user?.name || 'Unknown'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoVal}>{selectedOrder.user?.email || '—'}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛍️ Items</Text>
                {selectedOrder.items.map((item, i) => (
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
                  <Text style={styles.totalPrice}>LKR {selectedOrder.totalPrice.toFixed(2)}</Text>
                </View>
              </View>

              {/* Shipping Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
                <Text style={styles.addressTxt}>{selectedOrder.shippingAddress.street}</Text>
                <Text style={styles.addressTxt}>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</Text>
                <Text style={styles.addressTxt}>{selectedOrder.shippingAddress.country}</Text>
              </View>

              {/* Payment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 Payment</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Method</Text>
                  <Text style={styles.infoVal}>{selectedOrder.paymentMethod}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={[styles.infoVal, { color: selectedOrder.isPaid ? '#10B981' : '#F59E0B' }]}>
                    {selectedOrder.isPaid ? '✅ Paid' : '⏳ Pending'}
                  </Text>
                </View>
              </View>

              {/* Update Status */}
              {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔄 Update Status</Text>
                  <View style={styles.statusBtns}>
                    {ALL_STATUSES.filter(s => s !== selectedOrder.status && s !== 'Cancelled').map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusBtn, { borderColor: STATUS_COLORS[s] }]}
                        onPress={() => handleUpdateStatus(selectedOrder._id, s)}
                        disabled={updating}
                      >
                        <Text style={[styles.statusBtnTxt, { color: STATUS_COLORS[s] }]}>
                          {updating ? '...' : `Mark ${s}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Cancel Button */}
              {!['Cancelled', 'Delivered', 'Shipped'].includes(selectedOrder.status) && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleUpdateStatus(selectedOrder._id, 'Cancelled')}
                  disabled={updating}
                >
                  <Text style={styles.cancelTxt}>Cancel Order</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summaryRow: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginRight: 10, alignItems: 'center', minWidth: 75, elevation: 2 },
  summaryNum: { fontSize: 22, fontWeight: '700', color: '#6C63FF' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  filterRow: { paddingHorizontal: 12, marginBottom: 8 },
  filterChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  filterTxt: { fontSize: 13, color: '#555' },
  filterTxtActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 10, padding: 14, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#222' },
  customerName: { fontSize: 13, color: '#555', marginTop: 3 },
  customerEmail: { fontSize: 12, color: '#888', marginTop: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  itemCount: { fontSize: 13, color: '#666' },
  total: { fontSize: 15, fontWeight: '700', color: '#6C63FF' },
  date: { fontSize: 11, color: '#aaa' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60 },
  empty: { color: '#999', fontSize: 16, marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  closeBtn: { fontSize: 20, color: '#888', padding: 4 },
  section: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10 },
  dateText: { fontSize: 12, color: '#888' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#6C63FF' },
  addressTxt: { fontSize: 14, color: '#555', lineHeight: 22 },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  statusBtnTxt: { fontWeight: '600', fontSize: 13 },
  cancelBtn: { borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  cancelTxt: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});