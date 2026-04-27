import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { getProducts, deleteProduct } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProductListScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts(search ? { search } : {});
      setProducts(res.data.products);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load products' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      Toast.show({ type: 'success', text1: 'Product deleted' });
      fetchProducts();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { id: item._id })}>
      <Image source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{item.category?.name}</Text>
        <Text style={styles.price}>LKR {item.price.toFixed(2)}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.averageRating.toFixed(1)} ({item.numReviews})</Text>
        </View>
      </View>
      {user?.role === 'admin' && (
        <View style={styles.adminBtns}>
          <TouchableOpacity onPress={() => navigation.navigate('ProductForm', { product: item })}>
            <Text style={styles.editBtn}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="🔍 Search products..." value={search}
        onChangeText={setSearch} onSubmitEditing={fetchProducts} />
      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProductForm', {})}>
          <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  search: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  addBtn: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  image: { width: 100, height: 110 },
  info: { flex: 1, padding: 10 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  category: { fontSize: 12, color: '#888', marginTop: 2 },
  price: { fontSize: 15, color: '#6C63FF', fontWeight: '700', marginTop: 4 },
  ratingRow: { flexDirection: 'row', marginTop: 4 },
  rating: { fontSize: 12, color: '#f59e0b' },
  adminBtns: { justifyContent: 'center', paddingRight: 10, gap: 10 },
  editBtn: { fontSize: 20 },
  deleteBtn: { fontSize: 20 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
