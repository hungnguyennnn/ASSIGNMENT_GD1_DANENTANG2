import { API_CONFIG } from '../../../config';
import axios from 'axios';

export type Order = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  products: Array<{
    id: string;
    productId: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
  }>;
  totalPrice: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

// Hàm lấy danh sách đơn hàng từ API
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Giả sử API_CONFIG.baseURL đã được cấu hình
    const response = await axios.get(`${API_CONFIG.baseURL}/orders`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return [];
  }
};

// Hàm cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
  try {
    // Trước tiên lấy thông tin đơn hàng hiện tại
    const response = await axios.get(`${API_CONFIG.baseURL}/orders/${orderId}`);
    const currentOrder = response.data;
    
    // Cập nhật trạng thái
    const updatedOrder = {
      ...currentOrder,
      status: newStatus
    };
    
    // Gửi yêu cầu PUT để cập nhật đơn hàng
    await axios.put(`${API_CONFIG.baseURL}/orders/${orderId}`, updatedOrder);
    
    console.log(`Đã cập nhật đơn hàng ${orderId} sang trạng thái ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, error);
    return false;
  }
};

// Hàm chuyển đổi trạng thái từ tiếng Anh sang tiếng Việt để hiển thị
export const translateOrderStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Đang xử lý';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Hàm chuyển đổi trạng thái từ tiếng Việt sang tiếng Anh để lưu vào database
export const convertOrderStatus = (vietnameseStatus: string): string => {
  switch (vietnameseStatus.toLowerCase()) {
    case 'đang xử lý':
      return 'pending';
    case 'đã hoàn thành':
      return 'completed';
    case 'đã hủy':
      return 'cancelled';
    default:
      return vietnameseStatus;
  }
};