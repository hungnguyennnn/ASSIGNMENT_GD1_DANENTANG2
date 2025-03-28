import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

type User = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
};

export default function EditProfile() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { user } = route.params as { user: User };

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    // Gán dữ liệu người dùng vào các state
    useEffect(() => {
        setFullName(user.fullName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber);
    }, [user]);

    const handleSave = async () => {
        try {
            const updateData: Partial<User> = { fullName, email, phoneNumber };
            if (password.trim()) {
                updateData.password = password;
            }

            await axios.put(`http://192.168.1.8:3000/users/${user.id}`, updateData);
            navigation.navigate('profile'); // Quay về trang Profile sau khi lưu
        } catch (error) {
            console.error('Lỗi cập nhật thông tin:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Nút quay về */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.header}>Chỉnh sửa thông tin</Text>

            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Họ và tên" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Số điện thoại" keyboardType="numeric" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mật khẩu mới (nếu muốn đổi)" secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu thông tin</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    backButton: { position: 'absolute', top: 20, left: 20, padding: 10, marginTop: 20 },
    backButtonText: { fontSize: 24, fontWeight: 'bold' },
    header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 40 },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 },
    button: { backgroundColor: 'gray', padding: 15, alignItems: 'center', borderRadius: 5 },
    buttonText: { color: 'white', fontSize: 16 },
});
