import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { getProductById, addToCart } from '../../api';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then(res => setProduct(res.data.product))
      .catch(() => Toast.show({ type: 'error', text1: 'Failed to load product' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize) return Toast.show({ type: 'error', text1: 'Please select a size' });
    setAdding(true);
    try {
      await addToCart({ productId: id, size: selectedSize, quantity: 1 });
      Toast.show({ type: 'success', text1: 'Added to cart!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to add' });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;
  if (!product) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Product not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.images[0] || 'https://via.placeholder.com/400' }} style={styles.image} />

      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand} · {product.color}</Text>
        <Text style={styles.price}>LKR {product.price.toFixed(2)}</Text>
        <Text style={styles.rating}>⭐ {product.averageRating.toFixed(1)} ({product.numReviews} reviews)</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.sectionTitle}>Select Size</Text>
        <View style={styles.sizes}>
          {product.sizes.map(s => (
            <TouchableOpacity key={s.size}
              style={[styles.sizeBtn, selectedSize === s.size && styles.sizeBtnActive, s.stock === 0 && styles.sizeBtnDisabled]}
              onPress={() => s.stock > 0 && setSelectedSize(s.size)}
              disabled={s.stock === 0}>
              <Text style={[styles.sizeTxt, selectedSize === s.size && styles.sizeTxtActive]}>{s.size}</Text>
              {s.stock === 0 && <Text style={styles.outOfStock}>Out</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart} disabled={adding}>
            <Text style={styles.cartBtnTxt}>{adding ? 'Adding...' : '🛒 Add to Cart'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reviewBtn} onPress={() => navigation.navigate('Reviews', { productId: id, productName: product.name })}>
            <Text style={styles.reviewBtnTxt}>💬 Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  body: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700', color: '#222' },
  brand: { fontSize: 13, color: '#888', marginTop: 4 },
  price: { fontSize: 22, color: '#6C63FF', fontWeight: '700', marginTop: 8 },
  rating: { fontSize: 14, color: '#f59e0b', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#333' },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  sizeBtnActive: { borderColor: '#6C63FF', backgroundColor: '#6C63FF' },
  sizeBtnDisabled: { opacity: 0.4 },
  sizeTxt: { fontSize: 13, fontWeight: '600', color: '#444' },
  sizeTxtActive: { color: '#fff' },
  outOfStock: { fontSize: 9, color: '#e53e3e' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cartBtn: { flex: 1, backgroundColor: '#6C63FF', padding: 14, borderRadius: 10, alignItems: 'center' },
  cartBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
  reviewBtn: { flex: 1, backgroundColor: '#f3f4f6', padding: 14, borderRadius: 10, alignItems: 'center' },
  reviewBtnTxt: { color: '#333', fontWeight: '600', fontSize: 15 },
});
