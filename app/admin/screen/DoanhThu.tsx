import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Platform , Alert, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Order } from '../services/donhang';
import { fetchOrders } from '../services/donhang';
import DateTimePicker from '@react-native-community/datetimepicker';
export default function TraCuuDoanhThu() {
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState<string>('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const getOrdersInRange = (orders: Order[], startDate: Date, endDate: Date): Order[] => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const calculateRevenue = (orders: Order[]): number => {
    return orders.reduce((total, order) => {
      const cleaned = order.totalPrice.replace(/[^\d]/g, '');
      const price = parseInt(cleaned, 10);
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };

  const handleTraCuu = async () => {
    if (!ngayBatDau || !ngayKetThuc) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    const startDate = parseDate(ngayBatDau);
    const endDate = parseDate(ngayKetThuc);
    const allOrders = await fetchOrders();
    const filtered = getOrdersInRange(allOrders, startDate, endDate);
    const totalAmount = calculateRevenue(filtered);

    setOrders(filtered);
    setTotal(totalAmount.toLocaleString('vi-VN') + 'đ');
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.text}>Mã đơn: {item.id}</Text>
      <Text style={styles.text}>Khách hàng: {item.fullName}</Text>
      <Text style={styles.text}>Tổng tiền: {item.totalPrice}</Text>
      <Text style={styles.text}>Ngày mua: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Tra Cứu Doanh Thu' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Tra Cứu Doanh Thu</Text>

        <Text style={styles.label}>Ngày bắt đầu (dd/MM/yyyy):</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 01/01/2024"
          value={ngayBatDau}
          onChangeText={setNgayBatDau}
        />

        <Text style={styles.label}>Ngày kết thúc (dd/MM/yyyy):</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 31/01/2024"
          value={ngayKetThuc}
          onChangeText={setNgayKetThuc}
        />

        <TouchableOpacity style={styles.button} onPress={handleTraCuu}>
          <Feather name="search" size={20} color="white" />
          <Text style={styles.buttonText}>Tra Cứu</Text>
        </TouchableOpacity>

        {total !== '' && (
          <Text style={styles.result}>Tổng doanh thu: {total}</Text>
        )}

        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={{ marginTop: 20 }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#007537',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007537',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007537',
    textAlign: 'center',
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});