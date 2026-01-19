
import React, { useState, useMemo } from 'react';
import { recipes } from './data';
import { Recipe, CartItem, OrderStatus, RestaurantStats, PaymentMethod } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'menu' | 'recipes' | 'favorites' | 'cart' | 'tracking' | 'partner' | 'shopping' | 'adminLogin' | 'admin'
  >('home');

  // ADMIN
  const [adminPassword, setAdminPassword] = useState('');

  // USER DATA
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // CHECKOUT
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('karta');
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderTime, setPreOrderTime] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // AI CHAT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState("Toshkent, Mirabod tumani");
  const [difficultyFilter, setDifficultyFilter] = useState('Hammasi');

  // STATS
  const partnerStats: RestaurantStats = {
    totalSales: 12450000,
    orderCount: 154,
    rating: 4.9,
    recentReviews: [
      { user: "Dostonbek", comment: "Palov juda mazali!", stars: 5 },
      { user: "Kamola", comment: "Yetkazib berish tez!", stars: 5 },
      { user: "Sherzod", comment: "Norin zo'r!", stars: 5 }
    ]
  };

  // HELPERS
  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const addToCart = (recipe: Recipe) => {
    setCart(prev => {
      const found = prev.find(i => i.id === recipe.id);
      if (found) {
        return prev.map(i =>
          i.id === recipe.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: recipe.id, name: recipe.name, price: recipe.price, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const placeOrder = () => {
    if (!cart.length) return;
    setActiveOrder({
      id: "OCH-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      status: 'qabul_qilindi',
      timestamp: Date.now(),
      items: cart,
      total: cartTotal + 15000,
      address,
      paymentMethod,
      isPreOrder,
      preOrderTime
    });
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab('tracking');
  };

  const filteredRecipes = useMemo(
    () => recipes.filter(r => difficultyFilter === 'Hammasi' || r.difficulty === difficultyFilter),
    [difficultyFilter]
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div onClick={() => setActiveTab('home')} className="cursor-pointer font-black text-2xl">
            🍲 Och Qolma
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={() => setActiveTab('menu')}>Menyu</button>
            <button onClick={() => setActiveTab('cart')}>🛒 {cart.length}</button>
            <button
              onClick={() => setActiveTab('adminLogin')}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ADMIN
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-6">

        {activeTab === 'home' && <div>HOME CONTENT</div>}

        {activeTab === 'adminLogin' && (
          <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full border p-3 mb-4"
              placeholder="Admin parol"
            />
            <button
              onClick={() => {
                if (adminPassword === '1234') {
                  setAdminPassword('');
                  setActiveTab('admin');
                } else {
                  alert("Noto‘g‘ri parol");
                }
              }}
              className="w-full bg-red-600 text-white p-3 rounded font-bold"
            >
              Kirish
            </button>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="p-10 bg-white rounded shadow">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="flex gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded">
                + Taom qo‘shish
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Buyurtmalar
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
