import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '../../config';

interface OrderProduct {
    id: string;
    productId: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
}

interface Order {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    products: OrderProduct[];
    totalPrice: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'cod' | 'bank' | 'momo';
    createdAt: string;
}

export default function HoaDon() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { orderId } = params;
    
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const baseURL = `${API_CONFIG.baseURL}`;

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng', [
                { text: 'OK', onPress: () => router.push('/(tabs)/TrangChu') }
            ]);
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${baseURL}/orders/${orderId}`);
            setOrder(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
            setIsLoading(false);
            Alert.alert('Lỗi', 'Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.', [
                { text: 'OK', onPress: () => router.push('/(tabs)/TrangChu') }
            ]);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'cod': return 'Thanh toán khi nhận hàng (COD)';
            case 'bank': return 'Chuyển khoản ngân hàng';
            case 'momo': return 'Ví MoMo';
            default: return 'Không xác định';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đang giao hàng';
            case 'delivered': return 'Đã giao hàng';
            case 'cancelled': return 'Đã hủy';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ffa500';
            case 'processing': return '#3498db';
            case 'shipped': return '#9b59b6';
            case 'delivered': return '#28a745';
            case 'cancelled': return '#e74c3c';
            default: return '#666';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#28a745" />
                <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
                <TouchableOpacity
                    style={styles.backToHomeButton}
                    onPress={() => router.push('/(tabs)/TrangChu')}
                >
                    <Text style={styles.backToHomeButtonText}>Quay về trang chủ</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/TrangChu')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hóa Đơn</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Text style={styles.successIconText}>✓</Text>
                    </View>
                    <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
                    <Text style={styles.successMessage}>Cảm ơn bạn đã mua hàng tại PlantShop</Text>
                </View>

                <View style={styles.orderInfoContainer}>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Mã đơn hàng:</Text>
                        <Text style={styles.orderInfoValue}>{order.id}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Ngày đặt hàng:</Text>
                        <Text style={styles.orderInfoValue}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Trạng thái:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.customerInfo}>
                        <Text style={styles.customerInfoText}>Họ tên: {order.fullName}</Text>
                        <Text style={styles.customerInfoText}>Email: {order.email}</Text>
                        <Text style={styles.customerInfoText}>Số điện thoại: {order.phoneNumber}</Text>
                        <Text style={styles.customerInfoText}>Địa chỉ: {order.address}</Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <Text style={styles.paymentMethodText}>{getPaymentMethodText(order.paymentMethod)}</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Sản phẩm đã mua</Text>
                    {order.products.map((item) => (
                        <View key={item.id} style={styles.productItem}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.productImage}
                            />
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{item.price} x {item.quantity}</Text>
                                <Text style={styles.productTotal}>
                                    Tổng: {(parseFloat(item.price.replace(/\./g, '').replace('đ', '')) * item.quantity).toLocaleString()}đ
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalPrice}>{order.totalPrice}</Text>
                </View>

                <TouchableOpacity
                    style={styles.backToHomeButton}
                    onPress={() => router.push('/(tabs)/TrangChu')}
                >
                    <Text style={styles.backToHomeButtonText}>Tiếp tục mua sắm</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#e74c3c',
        marginBottom: 20,
        textAlign: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 34,
        color: 'black',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContainer: {
        flex: 1,
    },
    successContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f0fff4',
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#28a745',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successIconText: {
        fontSize: 36,
        color: 'white',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    orderInfoContainer: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderInfoLabel: {
        fontSize: 14,
        color: '#666',
    },
    orderInfoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
    },
    sectionContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    customerInfo: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    customerInfoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    paymentMethodText: {
        fontSize: 16,
        color: '#333',
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    productTotal: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: 'bold',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
    },
    backToHomeButton: {
        backgroundColor: '#28a745',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    backToHomeButtonText: {
        color: 'white',
        fontSize: 16
    }
});