import { API_CONFIG } from '../../../config';

export type Stats = {
  userCount: number;
  orderCount: number;
  productCount: number;
};

// Lấy dữ liệu thống kê
export const fetchStats = async (productCount: number): Promise<Stats> => {
  try {
    // Lấy số lượng người dùng từ API
    const usersResponse = await fetch(`${API_CONFIG.baseURL}/users`);
    const usersData = await usersResponse.json();
    
    // Giả sử API trả về một mảng user
    const userCount = usersData.length;
    
    // Trả về đối tượng thống kê
    return {
      userCount: userCount,
      orderCount: 2, // Giả sử có 2 đơn hàng
      productCount: productCount
    };
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu thống kê:', error);
    return {
      userCount: 0,
      orderCount: 0,
      productCount: productCount
    };
  }
};