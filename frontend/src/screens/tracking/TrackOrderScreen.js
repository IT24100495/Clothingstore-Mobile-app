import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_COLOR = {
  Pending:            '#F59E0B',
  Processing:         '#3B82F6',
  Shipped:            '#8B5CF6',
  'Out for Delivery': '#F97316',
  Delivered:          '#10B981',
  Cancelled:          '#EF4444',
};

const STATUS_ICON = {
  Pending:            '🕐',
  Processing:         '⚙️',
  Shipped:            '📦',
  'Out for Delivery': '🚚',
  Delivered:          '✅',
  Cancelled:          '❌',
};

const STATUS_DESC = {
  Pending:            'Your order has been received and is awaiting confirmation.',
  Processing:         'Your order is being prepared and packed.',
  Shipped:            'Your order has been dispatched from our warehouse.',
  'Out for Delivery': 'Your order is out for delivery and will arrive soon!',
  Delivered:          'Your order has been delivered successfully. Enjoy! 🎉',
  Cancelled:          'This order has been cancelled.',
};

export default function TrackOrderScreen() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) return Toast.show({ type: 'error', text1: 'Please enter an Order ID' });
    setLoading(true);
    setOrder(null);
    try {
      const res = await api.get(`/orders/${trimmed}`);
      setOrder(res.data.order);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Order not found' });
    } finally {
      setLoading(false);
    }
  };

  const isCancelled  = order?.status === 'Cancelled';
  const currentStep  = order ? STEPS.indexOf(order.status) : -1;
  const hasAgent     = !!order?.deliveryAgent;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* ── Search header ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchTitle}>🔍 Track Your Order</Text>
        <Text style={styles.searchSub}>Enter your Order ID to check the status</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 64f3a2b1c9e4..."
            value={orderId}
            onChangeText={setOrderId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.searchBtnTxt}>Track</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {order && (
        <View style={styles.resultBox}>

          {/* ── Order header ── */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderIdTxt}>Order #{order._id.slice(-8).toUpperCase()}</Text>
              <Text style={styles.orderDate}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[order.status] || '#888') + '22' }]}>
              <Text style={[styles.badgeTxt, { color: STATUS_COLOR[order.status] || '#888' }]}>
                {STATUS_ICON[order.status]} {order.status}
              </Text>
            </View>
          </View>

          {/* ── Progress tracker ── */}
          {!isCancelled ? (
            <View style={styles.trackerBox}>
              <Text style={styles.sectionTitle}>📍 Order Progress</Text>

              {STEPS.map((step, index) => {
                const done   = index <= currentStep;
                const active = index === currentStep;
                const color  = done ? STATUS_COLOR[step] : '#ddd';

                return (
                  <View key={step} style={styles.stepRow}>
                    {/* Connector line above (skip first) */}
                    {index > 0 && (
                      <View style={[
                        styles.connectorLine,
                        { backgroundColor: index <= currentStep ? STATUS_COLOR[STEPS[index - 1]] : '#eee' },
                      ]} />
                    )}

                    {/* Circle */}
                    <View style={[styles.stepCircle, { backgroundColor: color, borderColor: color }]}>
                      <Text style={styles.stepIcon}>
                        {done ? STATUS_ICON[step] : '○'}
                      </Text>
                    </View>

                    {/* Content */}
                    <View style={[styles.stepContent, active && { borderBottomColor: 'transparent' }]}>
                      <Text style={[
                        styles.stepName,
                        { color: done ? '#222' : '#bbb', fontWeight: active ? '700' : '500' },
                      ]}>
                        {step}
                      </Text>

                      {active && (
                        <Text style={[styles.stepDesc, { color: STATUS_COLOR[step] }]}>
                          {STATUS_DESC[step]}
                        </Text>
                      )}

                      {!active && done && (
                        <Text style={styles.stepDone}>Completed ✓</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.cancelledBox}>
              <Text style={styles.cancelledIcon}>❌</Text>
              <Text style={styles.cancelledTxt}>Order Cancelled</Text>
              <Text style={styles.cancelledDesc}>{STATUS_DESC.Cancelled}</Text>
            </View>
          )}

          {/* ── Delivery Agent (shown when Out for Delivery or Delivered) ── */}
          {hasAgent && ['Out for Delivery', 'Delivered'].includes(order.status) && (
            <View style={styles.agentBox}>
              <Text style={styles.sectionTitle}>🚚 Your Delivery Agent</Text>
              <View style={styles.agentCard}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarTxt}>
                    {order.deliveryAgent?.name?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{order.deliveryAgent?.name || '—'}</Text>
                  <Text style={styles.agentMeta}>Agent ID: {order.deliveryAgent?.agentId || '—'}</Text>
                  <Text style={styles.agentMeta}>📞 {order.deliveryAgent?.contactNo || '—'}</Text>
                </View>
                <View style={styles.agentStatusBadge}>
                  <Text style={styles.agentStatusTxt}>
                    {order.status === 'Delivered' ? '✅ Delivered' : '🚚 On the way'}
                  </Text>
                </View>
              </View>
              {order.status === 'Out for Delivery' && (
                <View style={styles.agentNotice}>
                  <Text style={styles.agentNoticeTxt}>
                    Your delivery agent is on the way. Please be available to receive your order.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Items ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Items Ordered</Text>
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

          {/* ── Delivery address ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.street}</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.country}</Text>
          </View>

          {/* ── Payment ── */}
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

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Search
  searchBox: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 30 },
  searchTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  searchSub: { fontSize: 13, color: '#e0dfff', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14 },
  searchBtn: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Result
  resultBox: { padding: 12 },

  // Order header card
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  orderIdTxt: { fontSize: 17, fontWeight: '700', color: '#222' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 3 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },

  // Progress tracker
  trackerBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, position: 'relative' },
  connectorLine: { position: 'absolute', left: 17, top: -12, width: 3, height: 14, borderRadius: 2 },
  stepCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepIcon: { fontSize: 16 },
  stepContent: { flex: 1, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  stepName: { fontSize: 15 },
  stepDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  stepDone: { fontSize: 11, color: '#aaa', marginTop: 2 },

  // Cancelled
  cancelledBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 12, elevation: 2 },
  cancelledIcon: { fontSize: 48 },
  cancelledTxt: { fontSize: 17, fontWeight: '700', color: '#EF4444', marginTop: 10 },
  cancelledDesc: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },

  // Delivery agent
  agentBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#F97316' },
  agentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12 },
  agentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  agentAvatarTxt: { color: '#fff', fontSize: 20, fontWeight: '700' },
  agentName: { fontSize: 15, fontWeight: '700', color: '#222' },
  agentMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  agentStatusBadge: { backgroundColor: '#F97316', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  agentStatusTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  agentNotice: { marginTop: 10, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
  agentNoticeTxt: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  // Items / address / payment
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#6C63FF' },
  addressTxt: { fontSize: 14, color: '#555', lineHeight: 22 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500' },
});