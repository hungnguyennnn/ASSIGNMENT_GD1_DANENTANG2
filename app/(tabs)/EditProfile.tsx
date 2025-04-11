import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import * as ImagePicker from 'expo-image-picker';

// Define avatar options
const AVATAR_OPTIONS = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
];

type User = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    avatar?: string;
    cart: any[];
};

export default function EditProfile() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { user } = route.params as { user: User };
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    
    // Assign user data to states
    useEffect(() => {
        setFullName(user.fullName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber);
        setAvatar(user.avatar || `https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}`);
    }, [user]);
    
    const handleSave = async () => {
        try {
            // Ensure all necessary fields are returned
            const updateData: Partial<User> = {
                fullName,
                email,
                phoneNumber,
                avatar: avatar || undefined,
                id: user.id, // Keep the id
                cart: user.cart || [] // Keep the cart or initialize an empty array if it doesn't exist
            };
            
            // Only add password if the user enters a new one
            if (password.trim()) {
                updateData.password = password;
            } else if (user.password) {
                // Keep the old password if no new one is entered
                updateData.password = user.password;
            }
            
            const response = await axios.put(`${API_CONFIG.baseURL}/users/${user.id}`, updateData);
            navigation.goBack();
        } catch (error) {
            console.error('Error updating information:', error);
        }
    };

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
                setShowAvatarModal(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const takePhoto = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
                setShowAvatarModal(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const selectPredefinedAvatar = (avatarUrl: string) => {
        setAvatar(avatarUrl);
        setShowAvatarModal(false);
    };
    
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.header}>Chỉnh sửa thông tin</Text>
            
            {/* Avatar section */}
            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                    <Image 
                        source={{ uri: avatar || `https://ui-avatars.com/api/?name=${fullName.replace(' ', '+')}` }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.editAvatarButton}>
                        <Text style={styles.editAvatarText}>Edit</Text>
                    </View>
                </TouchableOpacity>
            </View>
            
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Họ và tên" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Số điện thoại" keyboardType="numeric" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mật khẩu mới (nếu muốn đổi)" secureTextEntry />
            
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu thông tin</Text>
            </TouchableOpacity>

            {/* Avatar selection modal */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
                        
                        <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
                            <Text style={styles.modalOptionText}>Chụp ảnh mới</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
                            <Text style={styles.modalOptionText}>Chọn từ thư viện</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.predefinedTitle}>Hoặc chọn ảnh có sẵn:</Text>
                        
                        <FlatList
                            data={AVATAR_OPTIONS}
                            horizontal={false}
                            numColumns={3}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.avatarOption}
                                    onPress={() => selectPredefinedAvatar(item)}
                                >
                                    <Image source={{ uri: item }} style={styles.avatarOptionImage} />
                                </TouchableOpacity>
                            )}
                        />
                        
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setShowAvatarModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: 'white' 
    },
    backButton: { 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        padding: 10, 
        marginTop: 30, 
        zIndex: 1 
    },
    backButtonText: { 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    header: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20, 
        marginTop: 60 
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#28a745',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    input: { 
        borderBottomWidth: 1, 
        marginBottom: 15, 
        padding: 10 
    },
    button: { 
        backgroundColor: '#28a745', 
        padding: 15, 
        alignItems: 'center', 
        borderRadius: 5,
        marginBottom: 30
    },
    buttonText: { 
        color: 'white', 
        fontSize: 16 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalOptionText: {
        fontSize: 16,
    },
    predefinedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    avatarOption: {
        margin: 5,
        width: '30%',
    },
    avatarOptionImage: {
        width: '100%',
        height: 80,
        borderRadius: 5,
    },
    closeButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'red',
        fontWeight: 'bold',
    },
});