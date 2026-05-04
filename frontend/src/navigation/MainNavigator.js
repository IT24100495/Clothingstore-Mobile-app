import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import CategoryListScreen from '../screens/categories/CategoryListScreen';
import CategoryFormScreen from '../screens/categories/CategoryFormScreen';
import CategoryProductsScreen from '../screens/categories/CategoryProductsScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import EditOrderScreen from '../screens/orders/EditOrderScreen';
import AdminOrdersScreen from '../screens/orders/AdminOrdersScreen';
import AdminUsersScreen from '../screens/users/AdminUsersScreen';
import AdminPaymentsScreen from '../screens/Payments/AdminPaymentsScreen';
import TrackOrderScreen from '../screens/tracking/TrackOrderScreen';
import AdminTrackScreen from '../screens/tracking/AdminTrackScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import ReviewScreen from '../screens/reviews/ReviewScreen';
import AddReviewScreen from '../screens/reviews/AddReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Shop' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Add / Edit Product' }} />
      <Stack.Screen name="Reviews" component={ReviewScreen} options={{ title: 'Reviews' }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Write Review' }} />
    </Stack.Navigator>
  );
}

function CategoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: 'Categories' }} />
      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: 'Add / Edit Category' }} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} options={({ route }) => ({ title: route.params?.categoryName || 'Products' })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Add / Edit Product' }} />
      <Stack.Screen name="Reviews" component={ReviewScreen} options={{ title: 'Reviews' }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Write Review' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}

function CustomerOrderStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
      <Stack.Screen name="EditOrder" component={EditOrderScreen} options={{ title: 'Edit Address' }} />
    </Stack.Navigator>
  );
}

function CustomerTrackStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: 'Track Order' }} />
    </Stack.Navigator>
  );
}

function AdminOrderStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'All Orders' }} />
    </Stack.Navigator>
  );
}

function AdminUsersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
    </Stack.Navigator>
  );
}

function AdminTrackStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminTrack" component={AdminTrackScreen} options={{ title: 'Order Tracking' }} />
    </Stack.Navigator>
  );
}

function AdminPaymentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ title: 'Payment Review' }} />
    </Stack.Navigator>
  );
}

const icon = (emoji) => () => <Text style={{ fontSize: 22 }}>{emoji}</Text>;

function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#6C63FF', tabBarInactiveTintColor: '#999', tabBarStyle: { paddingBottom: 5, height: 60 } }}>
      <Tab.Screen name="Home"       component={HomeStack}          options={{ tabBarIcon: icon('🏠'), tabBarLabel: 'Home' }} />
      <Tab.Screen name="Categories" component={CategoryStack}      options={{ tabBarIcon: icon('📂'), tabBarLabel: 'Categories' }} />
      <Tab.Screen name="Orders"     component={AdminOrderStack}    options={{ tabBarIcon: icon('📦'), tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Payments"   component={AdminPaymentsStack} options={{ tabBarIcon: icon('💳'), tabBarLabel: 'Payments' }} />
      <Tab.Screen name="Tracking"   component={AdminTrackStack}    options={{ tabBarIcon: icon('🚚'), tabBarLabel: 'Tracking' }} />
      <Tab.Screen name="Users"      component={AdminUsersStack}    options={{ tabBarIcon: icon('👥'), tabBarLabel: 'Users' }} />
      <Tab.Screen name="Account"    component={ProfileStack}       options={{ tabBarIcon: icon('👤'), tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

function CustomerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#6C63FF', tabBarInactiveTintColor: '#999', tabBarStyle: { paddingBottom: 5, height: 60 } }}>
      <Tab.Screen name="Home"       component={HomeStack}          options={{ tabBarIcon: icon('🏠'), tabBarLabel: 'Home' }} />
      <Tab.Screen name="Categories" component={CategoryStack}      options={{ tabBarIcon: icon('📂'), tabBarLabel: 'Categories' }} />
      <Tab.Screen name="Cart"       component={CartStack}          options={{ tabBarIcon: icon('🛒'), tabBarLabel: 'Cart' }} />
      <Tab.Screen name="Orders"     component={CustomerOrderStack} options={{ tabBarIcon: icon('📦'), tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Track"      component={CustomerTrackStack} options={{ tabBarIcon: icon('🚚'), tabBarLabel: 'Track' }} />
      <Tab.Screen name="Account"    component={ProfileStack}       options={{ tabBarIcon: icon('👤'), tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminNavigator /> : <CustomerNavigator />;
}