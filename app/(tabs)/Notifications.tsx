import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';
import { useFocusEffect } from '@react-navigation/native'; // Đảm bảo đã cài đặt thư viện này

interface Order {
  id: string;
  userId: string;
  fullName: string;
  totalPrice: string;
  status: string;
  createdAt: string;
}

export default function Notifications() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserOrders = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_CONFIG.baseURL}/orders`);
      const userOrders = response.data.filter((order: Order) => order.userId === userId);
      setOrders(userOrders.reverse()); // Đảo ngược để mới nhất hiển thị trước
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // Tải lại dữ liệu mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchUserOrders();
    }, [fetchUserOrders])
  );

  // Xử lý kéo để làm mới
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserOrders();
  }, [fetchUserOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffa500'; // Cam cho trạng thái đang xử lý
      case 'completed':
        return '#28a745'; // Xanh lá cho trạng thái hoàn thành
      default:
        return '#6c757d'; // Xám cho các trạng thái khác
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang xử lý';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5445/5445197.png' }}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        <Text style={styles.emptySubText}>Hãy mua sắm để có thông báo về đơn hàng</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>Làm mới</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Thông Báo Đơn Hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#28a745"]}
            tintColor="#28a745"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationItem}>
            <View style={styles.orderHeader}>
              <View style={styles.idContainer}>
                <Text style={styles.idLabel}>Mã đơn hàng:</Text>
                <Text style={styles.idValue}>{item.id}</Text>
              </View>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(item.status) }
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Người nhận:</Text>
                <Text style={styles.detailValue}>{item.fullName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tổng tiền:</Text>
                <Text style={styles.priceValue}>{item.totalPrice}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày đặt:</Text>
                <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f9fc',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 26,
    color: '#2c3e50',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20, 
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 4,
  },
  idValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 10,
  },
  orderDetails: {
    marginTop: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  dateValue: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#34495e',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});