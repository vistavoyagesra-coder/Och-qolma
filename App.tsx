import React, { useState, useMemo } from 'react';
import { recipes } from './data';
import { Recipe, CartItem, OrderStatus, RestaurantStats, PaymentMethod } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  /* ================== STATES ================== */
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'menu'
    | 'recipes'
    | 'cart'
    | 'favorites'
    | 'shopping'
    | 'tracking'
    | 'partner'
    | 'admin'
    | 'adminLogin'
  >('home');

  const [adminPassword, setAdminPassword] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('karta');
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderTime, setPreOrderTime] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState("Toshkent, Mirabod tumani");
  const [difficultyFilter, setDifficultyFilter] = useState('Hammasi');

  /* ================== HELPERS ================== */
  const toggleFavorite = (id: string) => {
    setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
  };

  const addToCart = (r: Recipe) => {
    setCart(p => {
      const ex = p.find(i => i.id === r.id);
      if (ex) return p.map(i => i.id === r.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...p, { id: r.id, name: r.name, price: r.price, quantity: 1 }];
    });
  };

  const cartTotal = useMemo(
    () => cart.reduce((a, b) => a + b.price * b.quantity, 0),
    [cart]
  );

  /* ================== RENDER ================== */
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div
            className="font-black text-2xl cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            Och Qolma<span className="text-orange-500">.</span>
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={() => setActiveTab('home')}>Home</button>
            <button onClick={() => setActiveTab('menu')}>Menu</button>
            <button onClick={() => setActiveTab('recipes')}>Recipes</button>

            <button
              onClick={() => setActiveTab('adminLogin')}
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold"
            >
              ADMIN
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-6">

        {/* HOME */}
        {activeTab === 'home' && (
          <div>
            <h1 className="text-4xl font-black mb-6">
              Och qoldingizmi? <span className="text-orange-500">Och Qolma!</span>
            </h1>
            <p className="text-gray-600 mb-6">
              Milliy taomлар ва тез yetkazib berish
            </p>
          </div>
        )}

        {/* MENU */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes.map(r => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-xl shadow cursor-pointer"
                onClick={() => addToCart(r)}
              >
                <h3 className="font-bold">{r.name}</h3>
                <p>{r.price.toLocaleString()} so'm</p>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN LOGIN */}
        {activeTab === 'adminLogin' && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <input
              type="password"
              placeholder="Admin parol"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />
            <button
              className="w-full bg-red-600 text-white p-3 rounded font-bold"
              onClick={() => {
                if (adminPassword === '1234') {
                  setActiveTab('admin');
                  setAdminPassword('');
                } else {
                  alert("Noto‘g‘ri parol");
                }
              }}
            >
              Kirish
            </button>
          </div>
        )}

        {/* ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="p-8 bg-white rounded-2xl shadow">
            <h1 className="text-3xl font-black mb-6">Admin Panel</h1>

            <div className="flex gap-4">
              <button
                onClick={() => alert("Taom qo‘shish")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                + Taom qo‘shish
              </button>

              <button
                onClick={() => alert("Buyurtmalar")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
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
