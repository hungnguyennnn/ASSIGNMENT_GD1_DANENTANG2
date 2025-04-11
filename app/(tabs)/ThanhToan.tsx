import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    category?: 'plants' | 'pots' | 'accessories' | 'combos';
}

interface UserInfo {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export default function ThanhToan() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        id: '',
        fullName: '',
        email: '',
        phoneNumber: ''
    });
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, bank, momo
    const baseURL = `${API_CONFIG.baseURL}`;

    useEffect(() => {
        fetchCartItems();
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems]);

    const getUserId = async () => {
        return await AsyncStorage.getItem('userId');
    };

    const fetchCartItems = async () => {
        try {
            setIsLoading(true);
            const userId = await getUserId();
            if (!userId) {
                router.push('./DangNhap');
                return;
            }
            
            const response = await axios.get(`${baseURL}/users/${userId}`);
            if (response.data.cart.length === 0) {
                Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
                return;
            }
            
            setCartItems(response.data.cart || []);
            setUserInfo({
                id: response.data.id,
                fullName: response.data.fullName,
                email: response.data.email,
                phoneNumber: response.data.phoneNumber
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
            setIsLoading(false);
            Alert.alert('Lỗi', 'Không thể lấy thông tin giỏ hàng. Vui lòng thử lại sau.');
        }
    };

    const calculateTotalPrice = () => {
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/\./g, '').replace('đ', ''));
            return sum + (price * item.quantity);
        }, 0);
        setTotalPrice(total);
    };

    const handleCheckout = async () => {
    if (!address.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng');
        return;
    }

    try {
        setIsLoading(true);

        const orderId = `ord-${Date.now().toString().slice(-6)}`;
        const order = {
            id: orderId,
            userId: userInfo.id,
            fullName: userInfo.fullName,
            email: userInfo.email,
            phoneNumber: userInfo.phoneNumber,
            address: address,
            products: cartItems,
            totalPrice: `${totalPrice.toLocaleString()}đ`,
            status: "pending",
            paymentMethod: paymentMethod,
            createdAt: new Date().toISOString()
        };

        // Chỉ cần post nếu orders đã có trong db.json
        await axios.post(`${baseURL}/orders`, order);

        // Xóa giỏ hàng
        await axios.patch(`${baseURL}/users/${userInfo.id}`, { cart: [] });

        // Chuyển hướng
        router.push({
            pathname: '/HoaDon',
            params: { orderId: orderId }
        });
    } catch (error) {
        console.error('Lỗi khi thanh toán:', error);
        setIsLoading(false);
        Alert.alert('Lỗi', 'Không thể hoàn tất thanh toán. Vui lòng thử lại sau.');
    }
};


    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#28a745" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh Toán</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Họ và tên:</Text>
                        <TextInput
                            style={styles.infoInput}
                            value={userInfo.fullName}
                            onChangeText={(text) => setUserInfo({...userInfo, fullName: text})}
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <TextInput
                            style={styles.infoInput}
                            value={userInfo.email}
                            onChangeText={(text) => setUserInfo({...userInfo, email: text})}
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Số điện thoại:</Text>
                        <TextInput
                            style={styles.infoInput}
                            value={userInfo.phoneNumber}
                            onChangeText={(text) => setUserInfo({...userInfo, phoneNumber: text})}
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Địa chỉ giao hàng:</Text>
                        <TextInput
                            style={styles.infoInput}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Nhập địa chỉ giao hàng"
                            multiline
                        />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Text style={styles.paymentOptionText}>Thanh toán khi nhận hàng (COD)</Text>
                        {paymentMethod === 'cod' && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'bank' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('bank')}
                    >
                        <Text style={styles.paymentOptionText}>Chuyển khoản ngân hàng</Text>
                        {paymentMethod === 'bank' && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'momo' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('momo')}
                    >
                        <Text style={styles.paymentOptionText}>Ví MoMo</Text>
                        {paymentMethod === 'momo' && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                    {cartItems.map((item) => (
                        <View key={item.id} style={styles.cartItemContainer}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.cartItemImage}
                            />
                            <View style={styles.cartItemDetails}>
                                <Text style={styles.cartItemName}>{item.name}</Text>
                                <Text style={styles.cartItemPrice}>{item.price} x {item.quantity}</Text>
                                <Text style={styles.cartItemTotal}>
                                    Tổng: {(parseFloat(item.price.replace(/\./g, '').replace('đ', '')) * item.quantity).toLocaleString()}đ
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}đ</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutButtonText}>XÁC NHẬN ĐẶT HÀNG</Text>
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
    infoContainer: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    infoInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        marginBottom: 10,
    },
    paymentOptionSelected: {
        borderColor: '#28a745',
        backgroundColor: '#f0fff4',
    },
    paymentOptionText: {
        fontSize: 16,
        color: '#333',
    },
    checkmark: {
        fontSize: 18,
        color: '#28a745',
        fontWeight: 'bold',
    },
    cartItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginRight: 12,
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    cartItemTotal: {
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
    checkoutButton: {
        backgroundColor: '#28a745',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});