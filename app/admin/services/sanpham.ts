import { Alert } from 'react-native';
import { API_CONFIG } from '../../../config';

export type Product = {
  id: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  lightPreference?: string;
};

export type FormData = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: string;
  lightPreference: string;
  category: string;
};

// Lấy dữ liệu sản phẩm theo loại
export const fetchProducts = async () => {
  try {
    // Lấy dữ liệu cây
    const plantsResponse = await fetch(`${API_CONFIG.baseURL}/plants`);
    const plantsData = await plantsResponse.json();
    
    // Lấy dữ liệu chậu
    const potsResponse = await fetch(`${API_CONFIG.baseURL}/pots`);
    const potsData = await potsResponse.json();
    
    // Lấy dữ liệu phụ kiện
    const accessoriesResponse = await fetch(`${API_CONFIG.baseURL}/accessories`);
    const accessoriesData = await accessoriesResponse.json();
    
    return {
      plants: plantsData,
      pots: potsData,
      accessories: accessoriesData
    };
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
    return {
      plants: [],
      pots: [],
      accessories: []
    };
  }
};

// Xóa sản phẩm
export const deleteProduct = async (productType: string, productId: string) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/${productType}/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Không thể xóa sản phẩm');
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    return false;
  }
};

// Thêm hoặc cập nhật sản phẩm
export const saveProduct = async (formData: FormData, isEditMode: boolean, currentProductId?: string) => {
  try {
    const endpoint = formData.category;
    const productData: any = {
      name: formData.name,
      price: formData.price,
      image: formData.image,
      quantity: parseInt(formData.quantity),
    };

    if (formData.category === 'plants') {
      productData.lightPreference = formData.lightPreference;
    }

    let url = `${API_CONFIG.baseURL}/${endpoint}`;
    let method = 'POST';

    if (isEditMode && currentProductId) {
      url = `${url}/${currentProductId}`;
      method = 'PUT';
      productData.id = currentProductId;
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Lỗi khi lưu sản phẩm');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error);
    return false;
  }
};

// Lọc sản phẩm theo từ khóa tìm kiếm
export const filterProducts = (products: Product[], searchQuery: string) => {
  if (!searchQuery) return products;
  
  return products.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// Kiểm tra dữ liệu form trước khi lưu
export const validateProductForm = (formData: FormData) => {
  if (!formData.name || !formData.price || !formData.image || !formData.quantity) {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin sản phẩm.");
    return false;
  }

  if (formData.category === 'plants' && !formData.lightPreference) {
    Alert.alert("Thiếu thông tin", "Vui lòng chọn điều kiện ánh sáng cho cây.");
    return false;
  }

  return true;
};