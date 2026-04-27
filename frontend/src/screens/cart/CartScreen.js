import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../api';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data.cart);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh cart every time user visits this tab
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    try {
      if (newQty <= 0) {
        await removeFromCart(item.product._id, item.size);
      } else {
        await updateCartItem({ productId: item.product._id, size: item.size, quantity: newQty });
      }
      fetchCart();
    } catch {
      Toast.show({ type: 'error', text1: 'Update failed' });
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      fetchCart();
      Toast.show({ type: 'success', text1: 'Cart cleared' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to clear cart' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.product?.images?.[0] || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.product?.name}</Text>
        <Text style={styles.size}>Size: {item.size}</Text>
        <Text style={styles.price}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity(item, -1)}>
            <Text style={styles.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity(item, 1)}>
            <Text style={styles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  const items = cart?.items || [];

  return (
    <View style={styles.container}>
      {items.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnTxt}>🗑️ Clear Cart</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.product?._id}-${item.size}-${i}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.empty}>Your cart is empty</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: LKR {cart.totalPrice.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout', { totalPrice: cart.totalPrice })}
          >
            <Text style={styles.checkoutTxt}>Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  clearBtn: { margin: 12, alignSelf: 'flex-end' },
  clearBtnTxt: { color: '#e53e3e', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  image: { width: 90, height: 100 },
  info: { flex: 1, padding: 10 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  size: { fontSize: 12, color: '#888', marginTop: 2 },
  price: { fontSize: 15, color: '#6C63FF', fontWeight: '700', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  qtyBtn: { backgroundColor: '#f3f4f6', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt: { fontSize: 18, fontWeight: '600', color: '#333' },
  qty: { fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60 },
  empty: { color: '#999', fontSize: 16, marginTop: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, elevation: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontSize: 16, fontWeight: '700', color: '#222' },
  checkoutBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  checkoutTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
});