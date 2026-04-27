import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { createProduct, updateProduct, getCategories } from '../../api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductFormScreen({ route, navigation }) {
  const existing = route.params?.product;
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [brand, setBrand] = useState(existing?.brand || '');
  const [color, setColor] = useState(existing?.color || '');
  const [categoryId, setCategoryId] = useState(existing?.category?._id || '');
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState(existing?.sizes || []);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.categories));
  }, []);

  const toggleSize = (size) => {
    const exists = sizes.find(s => s.size === size);
    if (exists) setSizes(sizes.filter(s => s.size !== size));
    else setSizes([...sizes, { size, stock: 10 }]);
  };

  const updateStock = (size, stock) => {
    setSizes(sizes.map(s => s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setImages(result.assets.map(a => a.uri));
  };

  const handleSubmit = async () => {
    if (!name || !price || !categoryId) return Toast.show({ type: 'error', text1: 'Name, price and category are required' });
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('brand', brand);
      formData.append('color', color);
      formData.append('category', categoryId);
      formData.append('sizes', JSON.stringify(sizes));
      images.forEach((uri, i) => formData.append('images', { uri, name: `image_${i}.jpg`, type: 'image/jpeg' }));

      if (existing) await updateProduct(existing._id, formData);
      else await createProduct(formData);

      Toast.show({ type: 'success', text1: existing ? 'Product updated!' : 'Product created!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Product Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Classic White Tee" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline placeholder="Product description..." />

      <Text style={styles.label}>Price (LKR) *</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 2500" />

      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Zara" />

      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="e.g. White" />

      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {categories.map(c => (
          <TouchableOpacity key={c._id} style={[styles.chip, categoryId === c._id && styles.chipActive]} onPress={() => setCategoryId(c._id)}>
            <Text style={[styles.chipTxt, categoryId === c._id && styles.chipTxtActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Sizes & Stock</Text>
      <View style={styles.sizesRow}>
        {SIZES.map(s => {
          const selected = sizes.find(x => x.size === s);
          return (
            <View key={s} style={styles.sizeBlock}>
              <TouchableOpacity style={[styles.sizeBtn, selected && styles.sizeBtnActive]} onPress={() => toggleSize(s)}>
                <Text style={[styles.sizeTxt, selected && styles.sizeTxtActive]}>{s}</Text>
              </TouchableOpacity>
              {selected && (
                <TextInput style={styles.stockInput} value={selected.stock.toString()}
                  onChangeText={v => updateStock(s, v)} keyboardType="numeric" placeholder="Qty" />
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.label}>Product Images</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerTxt}>📷 Pick Images</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={{ marginBottom: 16 }}>
        {images.map((uri, i) => <Image key={i} source={{ uri }} style={styles.preview} />)}
      </ScrollView>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>{existing ? 'Update Product' : 'Create Product'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipTxt: { fontSize: 13, color: '#555' },
  chipTxtActive: { color: '#fff' },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  sizeBlock: { alignItems: 'center', gap: 4 },
  sizeBtn: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  sizeBtnActive: { borderColor: '#6C63FF', backgroundColor: '#6C63FF' },
  sizeTxt: { fontWeight: '600', color: '#444' },
  sizeTxtActive: { color: '#fff' },
  stockInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, width: 48, padding: 4, textAlign: 'center', fontSize: 12 },
  imagePicker: { borderWidth: 1.5, borderColor: '#6C63FF', borderRadius: 10, borderStyle: 'dashed', padding: 14, alignItems: 'center', marginBottom: 10 },
  imagePickerTxt: { color: '#6C63FF', fontWeight: '600' },
  preview: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  submitBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
