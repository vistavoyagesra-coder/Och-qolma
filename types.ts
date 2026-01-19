
export interface Recipe {
  id: string;
  name: string;
  category: 'Asosiy' | 'Suyuq' | 'Xamir' | 'Kabob';
  difficulty: 'Tez' | "An'anaviy" | 'Bayramona';
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  history: string;
  ingredients: string[];
  steps: string[];
  secrets: string[];
  serving: string;
  seoKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  image: string;
  price: number; 
  estimatedDelivery: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export type PaymentMethod = 'naqd' | 'karta' | 'online';

export interface OrderStatus {
  id: string;
  status: 'qabul_qilindi' | 'tayyorlanmoqda' | 'yolda' | 'yetkazildi';
  timestamp: number;
  items: CartItem[];
  total: number;
  address: string;
  paymentMethod: PaymentMethod;
  isPreOrder: boolean;
  preOrderTime?: string;
}

export interface RestaurantStats {
  totalSales: number;
  orderCount: number;
  rating: number;
  recentReviews: { user: string; comment: string; stars: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
