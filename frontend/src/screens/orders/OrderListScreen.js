import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Clipboard
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getMyOrders } from '../../api/index.js';

const STATUS_COLOR = {
  Pending:    '#F59E0B',
  Processing: '#3B82F6',
  Shipped:    '#8B5CF6',
  Delivered:  '#10B981',
  Cancelled:  '#EF4444',
};

export default function OrderListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data.orders);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load orders' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const copyOrderId = (id) => {
    Clipboard.setString(id);
    Toast.show({ type: 'success', text1: '📋 Order ID copied!', text2: 'Paste it in the Track tab' });
  };

  const renderItem = ({ item }) => {
    const color = STATUS_COLOR[item.status] || '#888';
    return (
      <View style={styles.card}>
        {/* Order ID Row with Copy Button */}
        <View style={styles.idRow}>
          <View>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.fullId} numberOfLines={1}>ID: {item._id}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={() => copyOrderId(item._id)}>
            <Text style={styles.copyBtnTxt}>📋 Copy ID</Text>
          </TouchableOpacity>
        </View>

        {/* Status & Details */}
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.badgeTxt, { color }]}>{item.status}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.items}>🛍️ {item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
          <Text style={styles.total}>LKR {item.totalPrice.toFixed(2)}</Text>
        </View>

        {/* View Detail Button */}
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
        >
          <Text style={styles.detailBtnTxt}>View Details →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <View style={styles.tipBox}>
        <Text style={styles.tipTxt}>💡 Tap "Copy ID" on any order to track it in the Track tab</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.empty}>No orders yet</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tipBox: { backgroundColor: '#f0f0ff', padding: 10, margin: 12, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#6C63FF' },
  tipTxt: { fontSize: 12, color: '#6C63FF', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 10, padding: 14, elevation: 2 },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  orderId: { fontSize: 15, fontWeight: '700', color: '#222' },
  fullId: { fontSize: 10, color: '#aaa', marginTop: 2, maxWidth: 180 },
  copyBtn: { backgroundColor: '#f3f0ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#6C63FF' },
  copyBtnTxt: { fontSize: 12, color: '#6C63FF', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: '#aaa' },
  items: { color: '#666', fontSize: 13 },
  total: { fontSize: 15, fontWeight: '700', color: '#6C63FF' },
  detailBtn: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', alignItems: 'flex-end' },
  detailBtnTxt: { color: '#6C63FF', fontWeight: '600', fontSize: 13 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60 },
  empty: { color: '#999', fontSize: 16, marginTop: 12 },
});