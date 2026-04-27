import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal, ScrollView,
  Image, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api';

const STATUS_COLOR = { Pending: '#F59E0B', Approved: '#10B981', Rejected: '#EF4444' };
const STATUS_ICON  = { Pending: '⏳', Approved: '✅', Rejected: '❌' };

export default function AdminPaymentsScreen() {
  const [payments, setPayments]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [selected, setSelected]         = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNote, setAdminNote]       = useState('');
  const [reviewing, setReviewing]       = useState(false);
  const [filter, setFilter]             = useState('Pending');

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get(`/payments?status=${filter}`);
      setPayments(res.data.payments);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load payments' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchPayments(); }, [fetchPayments]));

  const openPayment = (payment) => {
    setSelected(payment);
    setAdminNote(payment.adminNote || '');
    setModalVisible(true);
  };

  const handleReview = async (status) => {
    setReviewing(true);
    try {
      await api.put(`/payments/${selected._id}/review`, { status, adminNote });
      Toast.show({ type: 'success', text1: `Payment ${status}!` });
      setModalVisible(false);
      fetchPayments();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Review failed' });
    } finally {
      setReviewing(false);
    }
  };

  const pendingCount  = payments.filter(p => p.status === 'Pending').length;
  const approvedCount = payments.filter(p => p.status === 'Approved').length;
  const rejectedCount = payments.filter(p => p.status === 'Rejected').length;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPayment(item)}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.customerName}>👤 {item.user?.name}</Text>
          <Text style={styles.customerEmail}>{item.user?.email}</Text>
          <Text style={styles.amount}>LKR {item.amount?.toFixed(2)}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
            <Text style={[styles.badgeTxt, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_ICON[item.status]} {item.status}
            </Text>
          </View>
          {item.slipImage && (
            <Image source={{ uri: item.slipImage }} style={styles.slipThumb} />
          )}
        </View>
      </View>
      {item.referenceNo ? (
        <Text style={styles.refNo}>Ref: {item.referenceNo}</Text>
      ) : null}
      {item.status === 'Pending' && (
        <Text style={styles.tapHint}>Tap to review →</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: '#F59E0B', borderTopWidth: 3 }]}>
          <Text style={[styles.summaryNum, { color: '#F59E0B' }]}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#10B981', borderTopWidth: 3 }]}>
          <Text style={[styles.summaryNum, { color: '#10B981' }]}>{approvedCount}</Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#EF4444', borderTopWidth: 3 }]}>
          <Text style={[styles.summaryNum, { color: '#EF4444' }]}>{rejectedCount}</Text>
          <Text style={styles.summaryLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {['Pending', 'Approved', 'Rejected'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && { backgroundColor: STATUS_COLOR[f], borderColor: STATUS_COLOR[f] }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTxt, filter === f && { color: '#fff' }]}>{STATUS_ICON[f]} {f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTxt}>No {filter.toLowerCase()} payments</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Review Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {selected && (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💳 Payment Review</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Status badge */}
              <View style={[styles.statusBox, { backgroundColor: STATUS_COLOR[selected.status] + '15' }]}>
                <Text style={[styles.statusTxt, { color: STATUS_COLOR[selected.status] }]}>
                  {STATUS_ICON[selected.status]} {selected.status}
                </Text>
              </View>

              {/* Customer & Order info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Customer</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoVal}>{selected.user?.name}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoVal}>{selected.user?.email}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Amount</Text><Text style={[styles.infoVal, { color: '#6C63FF', fontWeight: '700' }]}>LKR {selected.amount?.toFixed(2)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Submitted</Text><Text style={styles.infoVal}>{new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
              </View>

              {/* Bank details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏦 Bank Details</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Bank</Text><Text style={styles.infoVal}>{selected.bankName || '—'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Reference No</Text><Text style={styles.infoVal}>{selected.referenceNo || '—'}</Text></View>
              </View>

              {/* Slip image */}
              {selected.slipImage && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📎 Bank Slip</Text>
                  <Image source={{ uri: selected.slipImage }} style={styles.slipFull} resizeMode="contain" />
                </View>
              )}

              {/* Admin note */}
              {selected.status === 'Pending' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 Admin Note (optional)</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={adminNote}
                    onChangeText={setAdminNote}
                    placeholder="Add a note for the customer..."
                    multiline
                  />
                </View>
              )}

              {/* Already reviewed note */}
              {selected.status !== 'Pending' && selected.adminNote && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 Admin Note</Text>
                  <Text style={styles.noteText}>{selected.adminNote}</Text>
                  <Text style={styles.reviewedAt}>Reviewed: {new Date(selected.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
              )}

              {/* Action buttons */}
              {selected.status === 'Pending' && (
                <View style={styles.actionBtns}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleReview('Approved')}
                    disabled={reviewing}
                  >
                    {reviewing
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.approveBtnTxt}>✅ Approve Payment</Text>
                    }
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReview('Rejected')}
                    disabled={reviewing}
                  >
                    <Text style={styles.rejectBtnTxt}>❌ Reject Payment</Text>
                  </TouchableOpacity>
                </View>
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
  summaryRow: { flexDirection: 'row', padding: 12, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', elevation: 2 },
  summaryNum: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  filterChip: { flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20, paddingVertical: 7, alignItems: 'center', backgroundColor: '#fff' },
  filterTxt: { fontSize: 12, fontWeight: '600', color: '#555' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, marginBottom: 10, padding: 14, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#222' },
  customerEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: '#6C63FF', marginTop: 4 },
  date: { fontSize: 11, color: '#aaa', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  slipThumb: { width: 60, height: 60, borderRadius: 8 },
  refNo: { fontSize: 12, color: '#888', marginTop: 8 },
  tapHint: { fontSize: 11, color: '#6C63FF', fontWeight: '600', marginTop: 6 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60 },
  emptyTxt: { color: '#999', fontSize: 15, marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  closeBtn: { fontSize: 20, color: '#888', padding: 4 },
  statusBox: { borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  statusTxt: { fontSize: 18, fontWeight: '700' },
  section: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500', flex: 1, textAlign: 'right' },
  slipFull: { width: '100%', height: 300, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fff' },
  noteText: { fontSize: 14, color: '#555', lineHeight: 20 },
  reviewedAt: { fontSize: 11, color: '#aaa', marginTop: 6 },
  actionBtns: { gap: 10, marginTop: 8 },
  approveBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center' },
  approveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rejectBtn: { borderWidth: 1.5, borderColor: '#EF4444', padding: 15, borderRadius: 12, alignItems: 'center' },
  rejectBtnTxt: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});