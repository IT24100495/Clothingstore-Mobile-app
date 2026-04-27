import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { placeOrder } from '../../api';
import api from '../../api';

const PAYMENT_METHODS = [
  { id: 'cod',  label: 'Cash on Delivery', icon: '💵', desc: 'Pay when order arrives' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'bank', label: 'Bank Deposit', icon: '🏦', desc: 'Upload bank transfer slip' },
];

const BANK_DETAILS = {
  bankName: 'Commercial Bank of Ceylon',
  accountName: 'StyleStore (Pvt) Ltd',
  accountNo: '1234567890',
  branch: 'Colombo Main Branch',
};

const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
};

export default function CheckoutScreen({ route, navigation }) {
  const { totalPrice } = route.params;

  // Address
  const [street, setStreet]         = useState('');
  const [city, setCity]             = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry]       = useState('Sri Lanka');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Card
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');

  // Bank
  const [bankName, setBankName]       = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [slipImage, setSlipImage]     = useState(null);

  const [loading, setLoading] = useState(false);

  const pickSlip = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setSlipImage(result.assets[0].uri);
  };

  const validateCard = () => {
    if (!cardHolder.trim()) { Toast.show({ type: 'error', text1: 'Enter cardholder name' }); return false; }
    if (cardNumber.replace(/\s/g, '').length < 16) { Toast.show({ type: 'error', text1: 'Enter valid 16-digit card number' }); return false; }
    if (expiry.length < 5) { Toast.show({ type: 'error', text1: 'Enter valid expiry MM/YY' }); return false; }
    const [mm, yy] = expiry.split('/');
    if (new Date(`20${yy}`, mm - 1) < new Date()) { Toast.show({ type: 'error', text1: 'Card has expired' }); return false; }
    if (cvv.length < 3) { Toast.show({ type: 'error', text1: 'Enter valid CVV' }); return false; }
    return true;
  };

  const handleOrder = async () => {
    if (!street || !city || !postalCode || !country)
      return Toast.show({ type: 'error', text1: 'All address fields are required' });

    if (paymentMethod === 'card' && !validateCard()) return;
    if (paymentMethod === 'bank' && !slipImage)
      return Toast.show({ type: 'error', text1: 'Please upload your bank slip' });

    setLoading(true);
    try {
      // Determine payment label
      let paymentLabel = 'Cash on Delivery';
      if (paymentMethod === 'card')
        paymentLabel = `Card (**** **** **** ${cardNumber.replace(/\s/g, '').slice(-4)})`;
      if (paymentMethod === 'bank')
        paymentLabel = 'Bank Deposit';

      // Place the order
      const orderRes = await placeOrder({
        shippingAddress: { street, city, postalCode, country },
        paymentMethod: paymentLabel,
      });

      const orderId = orderRes.data.order._id;

      // If bank deposit — upload the slip
      if (paymentMethod === 'bank') {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('bankName', bankName);
        formData.append('referenceNo', referenceNo);
        formData.append('slip', {
          uri: slipImage,
          name: 'bank_slip.jpg',
          type: 'image/jpeg',
        });
        await api.post('/payments/upload-slip', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Toast.show({ type: 'success', text1: '🎉 Order placed!', text2: 'Slip uploaded — awaiting admin approval' });
      } else {
        Toast.show({ type: 'success', text1: '🎉 Order placed successfully!' });
      }

      navigation.reset({ index: 0, routes: [{ name: 'Cart' }] });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to place order' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Shipping Address */}
        <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
        <Text style={styles.label}>Street *</Text>
        <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="No. 12, Main Street" />
        <Text style={styles.label}>City *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Colombo" />
        <Text style={styles.label}>Postal Code *</Text>
        <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="10100" keyboardType="numeric" />
        <Text style={styles.label}>Country *</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Sri Lanka" />

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.paymentOption, paymentMethod === m.id && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod(m.id)}
          >
            <Text style={styles.paymentIcon}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentLabel, paymentMethod === m.id && styles.paymentLabelActive]}>{m.label}</Text>
              <Text style={styles.paymentDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.radio, paymentMethod === m.id && styles.radioActive]}>
              {paymentMethod === m.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Card Form */}
        {paymentMethod === 'card' && (
          <View style={styles.cardSection}>
            <View style={styles.cardPreview}>
              <View style={styles.cardTop}>
                <Text style={styles.cardChip}>▪▪▪</Text>
                <Text style={styles.cardTypeLabel}>CARD</Text>
              </View>
              <Text style={styles.cardNumberPreview}>{cardNumber || '**** **** **** ****'}</Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardSubLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolderPreview}>{cardHolder.toUpperCase() || 'YOUR NAME'}</Text>
                </View>
                <View>
                  <Text style={styles.cardSubLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiryPreview}>{expiry || 'MM/YY'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.label}>Cardholder Name *</Text>
            <TextInput style={styles.input} value={cardHolder} onChangeText={setCardHolder} placeholder="Name on card" autoCapitalize="words" />
            <Text style={styles.label}>Card Number *</Text>
            <TextInput style={styles.input} value={cardNumber} onChangeText={v => setCardNumber(formatCardNumber(v))} placeholder="1234 5678 9012 3456" keyboardType="numeric" maxLength={19} />
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Expiry *</Text>
                <TextInput style={styles.input} value={expiry} onChangeText={v => setExpiry(formatExpiry(v))} placeholder="MM/YY" keyboardType="numeric" maxLength={5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV *</Text>
                <TextInput style={styles.input} value={cvv} onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))} placeholder="•••" keyboardType="numeric" maxLength={4} secureTextEntry />
              </View>
            </View>
            <View style={styles.secureNote}>
              <Text>🔒</Text>
              <Text style={styles.secureTxt}>Your payment info is secure and encrypted</Text>
            </View>
          </View>
        )}

        {/* Bank Deposit Form */}
        {paymentMethod === 'bank' && (
          <View style={styles.bankSection}>

            {/* Our Bank Details */}
            <View style={styles.bankDetailsBox}>
              <Text style={styles.bankDetailsTitle}>🏦 Transfer to this account:</Text>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Bank</Text>
                <Text style={styles.bankDetailVal}>{BANK_DETAILS.bankName}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account Name</Text>
                <Text style={styles.bankDetailVal}>{BANK_DETAILS.accountName}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account No</Text>
                <Text style={[styles.bankDetailVal, styles.accountNo]}>{BANK_DETAILS.accountNo}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Branch</Text>
                <Text style={styles.bankDetailVal}>{BANK_DETAILS.branch}</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Amount</Text>
                <Text style={[styles.bankDetailVal, { color: '#6C63FF', fontWeight: '700' }]}>LKR {Number(totalPrice).toFixed(2)}</Text>
              </View>
            </View>

            {/* Customer fills in */}
            <Text style={styles.label}>Your Bank Name</Text>
            <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder="e.g. Sampath Bank" />

            <Text style={styles.label}>Reference / Transaction No</Text>
            <TextInput style={styles.input} value={referenceNo} onChangeText={setReferenceNo} placeholder="e.g. TXN123456789" autoCapitalize="characters" />

            <Text style={styles.label}>Upload Bank Slip *</Text>
            <TouchableOpacity style={styles.slipPicker} onPress={pickSlip}>
              <Text style={styles.slipPickerIcon}>📎</Text>
              <Text style={styles.slipPickerTxt}>
                {slipImage ? 'Slip selected ✅ (tap to change)' : 'Tap to upload bank slip'}
              </Text>
            </TouchableOpacity>

            {slipImage && (
              <Image source={{ uri: slipImage }} style={styles.slipPreview} resizeMode="cover" />
            )}

            <View style={styles.bankNotice}>
              <Text style={styles.bankNoticeTxt}>
                ⚠️ Your order will be confirmed after admin reviews and approves your payment slip. This usually takes 1-2 business hours.
              </Text>
            </View>
          </View>
        )}

        {/* COD */}
        {paymentMethod === 'cod' && (
          <View style={styles.codBox}>
            <Text style={styles.codIcon}>💵</Text>
            <Text style={styles.codTitle}>Cash on Delivery</Text>
            <Text style={styles.codDesc}>Pay when your order arrives at your doorstep.</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>🧾 Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>LKR {Number(totalPrice).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryVal, { color: '#10B981' }]}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryLabel, { fontWeight: '700', fontSize: 15, color: '#222' }]}>Total</Text>
            <Text style={[styles.summaryVal, { fontWeight: '700', fontSize: 16, color: '#6C63FF' }]}>LKR {Number(totalPrice).toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity style={styles.placeBtn} onPress={handleOrder} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeTxt}>
                {paymentMethod === 'card' ? '💳 Pay & Place Order'
                  : paymentMethod === 'bank' ? '🏦 Submit Order & Slip'
                  : '🛍️ Place Order'}
              </Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 12, marginTop: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  rowInputs: { flexDirection: 'row', gap: 12 },

  // Payment options
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#eee', gap: 12, marginBottom: 10 },
  paymentOptionActive: { borderColor: '#6C63FF', backgroundColor: '#f3f0ff' },
  paymentIcon: { fontSize: 24 },
  paymentLabel: { fontSize: 15, color: '#444', fontWeight: '600' },
  paymentLabelActive: { color: '#6C63FF' },
  paymentDesc: { fontSize: 11, color: '#aaa', marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#6C63FF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6C63FF' },

  // Card
  cardSection: { marginTop: 4 },
  cardPreview: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardChip: { color: '#FFD700', fontSize: 18, letterSpacing: 2 },
  cardTypeLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardNumberPreview: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 3, marginBottom: 20, fontFamily: 'monospace' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSubLabel: { color: '#c4c0ff', fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  cardHolderPreview: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  cardExpiryPreview: { color: '#fff', fontSize: 13, fontWeight: '600' },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', borderRadius: 8, padding: 10, marginTop: 10 },
  secureTxt: { fontSize: 12, color: '#065f46', flex: 1 },

  // Bank
  bankSection: { marginTop: 4 },
  bankDetailsBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  bankDetailsTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 10 },
  bankDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
  bankDetailLabel: { fontSize: 12, color: '#3B82F6' },
  bankDetailVal: { fontSize: 12, color: '#1E40AF', fontWeight: '600', flex: 1, textAlign: 'right' },
  accountNo: { fontSize: 15, letterSpacing: 1 },
  slipPicker: { borderWidth: 1.5, borderColor: '#6C63FF', borderStyle: 'dashed', borderRadius: 10, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: '#fafafa' },
  slipPickerIcon: { fontSize: 20 },
  slipPickerTxt: { color: '#6C63FF', fontWeight: '600', fontSize: 14 },
  slipPreview: { width: '100%', height: 200, borderRadius: 10, marginTop: 10 },
  bankNotice: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  bankNoticeTxt: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  // COD
  codBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 4 },
  codIcon: { fontSize: 40, marginBottom: 8 },
  codTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  codDesc: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },

  // Summary
  summaryBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryVal: { fontSize: 14, color: '#222', fontWeight: '500' },

  // Place order
  placeBtn: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  placeTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
});