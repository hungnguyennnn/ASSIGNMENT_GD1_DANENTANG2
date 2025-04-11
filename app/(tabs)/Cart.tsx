import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert
} from 'react-native';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config';
interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    category: 'plants' | 'pots' | 'accessories' | 'combos';
}

export default function Cart() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const baseURL = `${API_CONFIG.baseURL}`;

    useFocusEffect(
        React.useCallback(() => {
            fetchCartItems();
            return () => {};
        }, [])
    );

    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems]);

    const getUserId = async () => {
        return await AsyncStorage.getItem('userId');
    };

    const fetchCartItems = async () => {
        try {
            const userId = await getUserId();
            if (!userId) return;
            
            const response = await axios.get(`${baseURL}/users/${userId}`);
            setCartItems(response.data.cart || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            setIsLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/\./g, '').replace('đ', ''));
            return sum + (price * item.quantity);
        }, 0);
        setTotalPrice(total);
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        try {
            const userId = await getUserId();
            if (!userId) return;

            let updatedCart;
            if (newQuantity === 0) {
                updatedCart = cartItems.filter(item => item.id !== itemId);
            } else {
                updatedCart = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
            }

            await axios.patch(`${baseURL}/users/${userId}`, { cart: updatedCart });
            setIsLoading(true);
            fetchCartItems();
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const userId = await getUserId();
            if (!userId) return;
            
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            await axios.patch(`${baseURL}/users/${userId}`, { cart: updatedCart });
            setIsLoading(true);
            fetchCartItems();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const removeAllItems = async () => {
        try {
            const userId = await getUserId();
            if (!userId) return;
            
            await axios.patch(`${baseURL}/users/${userId}`, { cart: [] });
            setIsLoading(true);
            fetchCartItems();
        } catch (error) {
            console.error('Error removing all items:', error);
        }
    };

    const navigateToCheckout = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập để thanh toán');
                router.push('./DangNhap');
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert('Thông báo', 'Giỏ hàng của bạn trống, vui lòng thêm sản phẩm vào giỏ hàng');
                return;
            }

            // Chuyển đến trang thanh toán
            router.push('/ThanhToan');
        } catch (error) {
            console.error('Lỗi khi chuyển đến trang thanh toán:', error);
            Alert.alert('Lỗi', 'Không thể chuyển đến trang thanh toán. Vui lòng thử lại sau.');
        }
    };

    const renderCartItem = (item: CartItem) => (
        <View key={item.id} style={styles.cartItemContainer}>
            <Image
                source={{ uri: item.image }}
                style={styles.cartItemImage}
            />
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>{item.price}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                    Alert.alert(
                        'Xóa tất cả',
                        'Bạn có chắc muốn sản phẩm  này khỏi giỏ hàng?',
                        [
                            { text: 'Hủy', style: 'cancel' },
                            {
                                text: 'Xóa',
                                style: 'destructive',
                                onPress: () => removeItem(item.id)
                            }
                        ]
                    );
                }}
            >
                <Text style={styles.removeButtonText}>🗑️</Text>
            </TouchableOpacity>
        </View >
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>

                
                    <Text style={styles.headerTitle}>Giỏ Hàng</Text>
                

                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        Alert.alert(
                            'Xóa tất cả',
                            'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                {
                                    text: 'Xóa',
                                    style: 'destructive',
                                    onPress: removeAllItems
                                }
                            ]
                        );
                    }} style={styles.removeAllButton}>
                        <Text style={styles.removeAllButtonText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>
         

            <ScrollView style={styles.scrollContainer}>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Giỏ hàng của bạn trống</Text>
                        <TouchableOpacity
                            style={styles.continueBrowsingButton}
                            onPress={() => router.push('/(tabs)/TrangChu')}
                        >
                            <Text style={styles.continueBrowsingButtonText}>Tiếp tục mua sắm</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {cartItems.map(renderCartItem)}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Tổng cộng</Text>
                            <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}đ</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={navigateToCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>THANH TOÁN</Text>
                        </TouchableOpacity>

                    </>
                )}
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
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
    removeAllButton: {
        paddingHorizontal: 10,
    },
    removeAllButtonText: {
        color: 'red',
        fontSize: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    cartItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 16,
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
        color: '#28a745',
        marginVertical: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 30,
        height: 30,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    quantityButtonText: {
        fontSize: 18,
        color: '#333',
    },
    quantityText: {
        fontSize: 16,
        marginHorizontal: 10,
    },
    removeButton: {
        padding: 10,
    },
    removeButtonText: {
        fontSize: 20,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyCartText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    continueBrowsingButton: {
        backgroundColor: '#28a745',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    continueBrowsingButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 18,
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
   
    reloadButtonText: {
        fontSize: 24,
        color: 'black',
    },
});