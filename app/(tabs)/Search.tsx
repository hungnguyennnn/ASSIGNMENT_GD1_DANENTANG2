
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  lightPreference?: 'Ưa bóng' | 'Ưa sáng';
  category: 'plants' | 'pots' | 'accessories' | 'combos';
  quantity?: number;
}

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const baseURL = 'http://192.168.1.8:3000';
        const [plantsRes, potsRes, accessoriesRes] = await Promise.all([
          axios.get(`${baseURL}/plants`),
          axios.get(`${baseURL}/pots`),
          axios.get(`${baseURL}/accessories`),
        ]);

        const combinedProducts = [
          ...plantsRes.data.map((p: Product) => ({ ...p, category: "plants" })),
          ...potsRes.data.map((p: Product) => ({ ...p, category: "pots" })),
          ...accessoriesRes.data.map((p: Product) => ({ ...p, category: "accessories" })),
        ];

        setAllProducts(combinedProducts);
        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi tải sản phẩm:', err.message);
        setError('Không thể tải sản phẩm. Vui lòng kiểm tra kết nối.');
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allProducts]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/(tabs)/ProductDetail",
      params: {
        id: product.id,
        category: product.category
      }
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
        />
      </View>
      <View style={styles.productDetailsContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productInfoRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.lightPreference && (
            <View style={styles.lightPreferenceChip}>
              <Text style={styles.lightPreferenceText}>
                {item.lightPreference}
              </Text>
            </View>
          )}
        </View>
        {item.quantity !== undefined && (
          <Text style={styles.quantityText}>
            Còn {item.quantity} sản phẩm
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            color="#888"
            size={20}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close" color="#888" size={20} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.category}-${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          searchTerm ? (
            <View style={styles.centerContainer}>
              <Text>Không tìm thấy sản phẩm</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 36,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    backgroundColor: '#f5f5f5',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 18,
  },
  productDetailsContainer: {
    padding: 8,
    width: '100%',
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
  productPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  lightPreferenceChip: {
    backgroundColor: '#e6f3e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lightPreferenceText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default SearchScreen;