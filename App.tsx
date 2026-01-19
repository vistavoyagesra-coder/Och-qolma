
import React, { useState, useMemo, useEffect } from 'react';
import { recipes } from './data';
import { Recipe, CartItem, OrderStatus, RestaurantStats, PaymentMethod } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'recipes' | 'cart' | 'admin' | 'adminLogin'>('home');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('karta');
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderTime, setPreOrderTime] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // AI Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // User info
  const [address, setAddress] = useState('Toshkent, Mirabod tumani, Oybek ko\'chasi');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('Hammasi');

  const partnerStats: RestaurantStats = {
    totalSales: 12450000,
    orderCount: 154,
    rating: 4.9,
    recentReviews: [
      { user: "Dostonbek", comment: "Palov haqiqiy to'y oshidek mazali ekan!", stars: 5 },
      { user: "Kamola", comment: "Yetkazib berish juda tez, somsa issiq keldi.", stars: 5 },
      { user: "Sherzod", comment: "Norin oshining siri xamirida ekan, rahmat!", stars: 5 }
    ]
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const addToCart = (recipe: Recipe, note: string = '') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === recipe.id);
      if (existing) {
        return prev.map(item => item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: recipe.id, name: recipe.name, price: recipe.price, quantity: 1, note }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addToShoppingList = (items: string[]) => {
    setShoppingList(prev => Array.from(new Set([...prev, ...items])));
    alert("Masalliqlar xarid ro'yxatiga qo'shildi!");
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const placeOrder = () => {
    if (cart.length === 0) return;
    const newOrder: OrderStatus = {
      id: "OCH-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: 'qabul_qilindi',
      timestamp: Date.now(),
      items: [...cart],
      total: cartTotal + 15000,
      address,
      paymentMethod,
      isPreOrder,
      preOrderTime: isPreOrder ? preOrderTime : undefined
    };
    setActiveOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab('tracking');
    
    // Simulate flow
    setTimeout(() => setActiveOrder(prev => prev ? {...prev, status: 'tayyorlanmoqda'} : null), 6000);
    setTimeout(() => setActiveOrder(prev => prev ? {...prev, status: 'yolda'} : null), 18000);
  };

  const handleAskChef = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsLoading(true);
    
    const context = `Sahifa: ${activeTab}. Savatcha: ${cart.length} taom. Jami: ${cartTotal} so'm. Manzil: ${address}. Sevimlilar: ${favorites.length} taom.`;
    const response = await geminiService.askChef(userMsg, context);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => difficultyFilter === 'Hammasi' || r.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  const favoriteRecipes = useMemo(() => recipes.filter(r => favorites.includes(r.id)), [favorites]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform rotate-3">🍲</div>
            <span className="text-2xl font-black tracking-tighter text-stone-900">Och Qolma<span className="text-orange-500">.</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
             <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Bosh sahifa</button>
             <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Menyu</button>
             <button onClick={() => setActiveTab('recipes')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'recipes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Retseptlar</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('favorites')} className="p-2.5 bg-stone-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors relative">
               <svg className="w-6 h-6" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
               {favorites.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <button onClick={() => setActiveTab('cart')} className="relative p-2.5 bg-stone-100 rounded-2xl hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">{cart.length}</span>}
            </button>
            <button onClick={() => setActiveTab('partner')} className="p-2.5 bg-stone-900 rounded-2xl text-white hover:bg-stone-800 transition-colors hidden sm:block">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </button>
          </div>
        </div>

{activeTab === 'admin' && (
  <div style={{ padding: 40 }}>
    <h1>Admin Panel</h1>
    <p>Bu yerda admin boshqaruvi bo‘ladi</p>

    <button onClick={() => alert("Taom qo‘shish")}>
      + Taom qo‘shish
    </button>

    <br /><br />

    <button onClick={() => alert("Buyurtmalarni ko‘rish")}>
      Buyurtmalarni ko‘rish
    </button>
  </div>
)}

        
{activeTab === 'adminLogin' && (
  <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow">
    <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

    <input
      type="password"
      placeholder="Admin paroli"
      value={adminPassword}
      onChange={(e) => setAdminPassword(e.target.value)}
      className="w-full border p-3 rounded mb-4"/>

    <button
      onClick={() => {
        if (adminPassword === '1234') {
          setActiveTab('admin');
          setAdminPassword('');
        } else {
          alert("Noto‘g‘ri parol");
        }
      }}
      className="w-full bg-red-600 text-white py-3 rounded font-bold"
    >
      Kirish
    </button>
  </div>
)}

  </div>
)}

      
 <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
  <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">

    {/* chap tomoni — logo */}
    <div>LOGO</div>

    {/* o‘ng tomoni — tugmalar */}
    <div className="flex items-center gap-3">

      {/* boshqa tugmalar shu yerda */}
      <button onClick={() => setActiveTab('adminLogin')}
        className="p-2.5 bg-red-600 rounded-2xl text-white font-bold">
        ADMIN
      </button>

    </div>
  </div>
</header>

      {/* Main Content Area */}
<main className="flex-grow max-w-6xl mx-auto w-full p-6 pb-32">
  {activeTab === 'home' && (
    <div className="space-y-16">
      {/* Hero */}
      <section>...</section>

      {/* Trending */}
      <section>...</section>
    </div>
  )}

  {activeTab === 'menu' && (
    <div>...</div>
  )}

  {activeTab === 'recipes' && (
    <div>...</div>
  )}

  {activeTab === 'cart' && (
    <div>...</div>
  )}

  {activeTab === 'admin' && (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>
      <p>Bu yerda admin boshqaruvi bo‘ladi</p>

      <button onClick={() => alert("Taom qo‘shish")}>
        + Taom qo‘shish
      </button>

      <br /><br />

      <button onClick={() => alert("Buyurtmalarni ko‘rish")}>
        Buyurtmalarni ko‘rish
      </button>
    </div>
  )}

</main>


    <br /><br />

    <button onClick={() => alert("Buyurtmalarni ko‘rish")}>
      Buyurtmalarni ko‘rish
    </button>
  </div>
)}
     <div className="space-y-16 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="bg-stone-900 rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-12">
              <div className="relative z-10 flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  <span className="text-orange-400 font-black uppercase tracking-widest text-[10px]">Milliy lazzat sirlari</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter">Och qoldingizmi? <br/><span className="text-orange-500">Och Qolma!</span></h1>
                <p className="text-stone-400 text-lg md:text-xl font-medium max-w-lg leading-relaxed">Toshkentning eng sara milliy taomlari va usta oshpazlaridan eksklyuziv retseptlar endi bir joyda.</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => setActiveTab('menu')} className="bg-orange-500 hover:bg-orange-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-orange-500/30 transform hover:scale-105 active:scale-95">Hozir Buyurtma Berish</button>
                  <button onClick={() => setActiveTab('recipes')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-white/10">Retseptlar Olami</button>
                </div>
              </div>
              <div className="flex-1 relative hidden lg:block">
                 <div className="w-[400px] h-[400px] bg-orange-500 rounded-[4rem] rotate-12 absolute inset-0 blur-2xl opacity-20"></div>
                 <img src="https://images.unsplash.com/photo-1512058560366-cd2427ff667f?auto=format&fit=crop&q=80&w=800" className="w-full h-[500px] object-cover rounded-[4rem] rotate-3 shadow-2xl relative z-10" />
              </div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[120px]"></div>
            </section>

            {/* Trending Menu */}
            <section>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-black text-stone-900 tracking-tight">Haftaning <span className="text-orange-500">eng xushxo'r</span> taomlari</h2>
                  <p className="text-stone-500 font-medium mt-2">Usta oshpazlarimiz tomonidan haftalik tavsiya</p>
                </div>
                <button onClick={() => setActiveTab('menu')} className="bg-stone-100 text-stone-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm">Barchasini ko'rish</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {recipes.slice(0, 4).map(r => (
                  <MenuCard 
                    key={r.id} 
                    recipe={r} 
                    onClick={() => setSelectedRecipe(r)} 
                    onAddToCart={addToCart} 
                    isFavorite={favorites.includes(r.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>

            {/* AI Call to Action */}
            <section className="bg-emerald-900 rounded-[3.5rem] p-12 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="max-w-xl">
                 <h2 className="text-4xl font-black mb-6 leading-tight">Nima tanlashni bilmayapsizmi? <br/><span className="text-emerald-400">AI-Oshpaz yordam beradi!</span></h2>
                 <p className="text-emerald-100/70 text-lg leading-relaxed mb-8">Oshpazimizga ta'bingiz haqida ayting, u sizga eng mos keladigan milliy lazzatni tavsiya qiladi.</p>
                 <button onClick={() => setIsChatOpen(true)} className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-100 transition-all flex items-center gap-2">
                   <span className="text-xl">👨‍🍳</span> Oshpaz bilan suhbat
                 </button>
               </div>
               <div className="text-9xl opacity-20 hidden md:block select-none">🍲</div>
            </section>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="max-w-xl">
                <h2 className="text-5xl font-black mb-4 tracking-tighter">Och Qoldingizmi? <span className="text-orange-500 underline decoration-orange-200 underline-offset-8">Tanlang!</span></h2>
                <p className="text-stone-500 text-lg font-medium">Toshkent bo'ylab 30-60 daqiqada issiq yetkazib beramiz.</p>
              </div>
              <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-stone-100 overflow-x-auto max-w-full no-scrollbar">
                {['Hammasi', 'Tez', "An'anaviy", 'Bayramona'].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${difficultyFilter === d ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-stone-400 hover:text-stone-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredRecipes.map(r => (
                <MenuCard 
                  key={r.id} 
                  recipe={r} 
                  onClick={() => setSelectedRecipe(r)} 
                  onAddToCart={addToCart}
                  isFavorite={favorites.includes(r.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black mb-4 tracking-tighter">Oshxona <span className="text-orange-500">Sirlari</span></h2>
              <p className="text-stone-500 text-lg leading-relaxed">O'zbek xalqining asriy gastronomik merosini uyingizda takrorlang. Har bir retsept - bu bir hikoya.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recipes.map(r => (
                <div key={r.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-stone-100" onClick={() => setSelectedRecipe(r)}>
                   <div className="h-48 overflow-hidden relative">
                     <img src={r.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-orange-500 shadow-lg group-hover:rotate-12 transition-transform">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                     </div>
                   </div>
                   <div className="p-6">
                     <h3 className="text-xl font-black mb-2 text-stone-900">{r.name}</h3>
                     <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Pishirish: {r.cookTime}</p>
                     <p className="text-stone-500 text-sm line-clamp-2 italic leading-relaxed">"{r.history}"</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="max-w-2xl">
              <h2 className="text-5xl font-black mb-4 tracking-tighter">Siz <span className="text-red-500">yoqtirgan</span> lazzatlar</h2>
              <p className="text-stone-500 text-lg leading-relaxed">Sizga ma'qul kelgan eng sara taomlar to'plami.</p>
            </div>
            {favoriteRecipes.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-stone-100 flex flex-col items-center">
                 <div className="text-6xl mb-6">❤️</div>
                 <p className="text-stone-400 font-bold text-xl mb-8">Hozircha sevimli taomlaringiz yo'q.</p>
                 <button onClick={() => setActiveTab('menu')} className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Menyuni ko'rish</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {favoriteRecipes.map(r => (
                  <MenuCard 
                    key={r.id} 
                    recipe={r} 
                    onClick={() => setSelectedRecipe(r)} 
                    onAddToCart={addToCart}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Savatcha</h2>
            {cart.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-stone-100 flex flex-col items-center">
                <div className="text-6xl mb-6">🛒</div>
                <p className="text-stone-400 font-bold text-xl mb-8">Savatchangiz bo'sh. Qorinni aldab bo'lmaydi!</p>
                <button onClick={() => setActiveTab('menu')} className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20">Taom tanlash</button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-stone-100 space-y-10">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center pb-10 border-b border-stone-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner">🍲</div>
                          <div>
                            <h4 className="font-black text-xl text-stone-900">{item.name}</h4>
                            <p className="text-stone-400 text-xs font-black uppercase tracking-widest mt-1">{item.price.toLocaleString()} so'm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center bg-stone-100 rounded-2xl p-1 gap-4">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black hover:bg-orange-500 hover:text-white transition-all">-</button>
                            <span className="font-black text-stone-900 min-w-[1.5rem] text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black hover:bg-orange-500 hover:text-white transition-all">+</button>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <span className="block font-black text-xl text-stone-900">{(item.price * item.quantity).toLocaleString()}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-1 hover:text-red-600">O'chirish</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {activeTab === 'admin' && (
  <div style={{ padding: 40 }}>
    <h1>Admin Panel</h1>
    <p>Bu yerda admin boshqaruvi bo‘ladi</p>

    <button onClick={() => alert("Taom qo‘shish")} style={{ marginRight: 10 }}>
      + Taom qo‘shish
    </button>

    <button onClick={() => alert("Buyurtmalar")}>
      Buyurtmalarni ko‘rish
    </button>
  </div>
)}
      
                  {/* Address Selection */}
                  <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-stone-100">
                    <h4 className="text-xl font-black mb-6 tracking-tight">Yetkazib berish manzili</h4>
                    <div className="flex items-center gap-6 bg-stone-50 p-6 rounded-[2rem] border border-stone-100 group">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-orange-500 text-xl group-hover:rotate-12 transition-transform">📍</div>
                      <div className="flex-grow">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Manzilingiz</label>
                        <input 
                          type="text" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-bold text-stone-700 focus:ring-0 text-lg"
                          placeholder="Manzilni kiriting..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900 rounded-[3.5rem] p-12 text-white h-fit sticky top-28 shadow-2xl space-y-12">
                  <div>
                    <h3 className="text-2xl font-black mb-10 tracking-tight">Jami To'lov</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center opacity-60 text-sm font-bold">
                        <span>Taomlar:</span>
                        <span>{cartTotal.toLocaleString()} so'm</span>
                      </div>
                      <div className="flex justify-between items-center opacity-60 text-sm font-bold">
                        <span>Yetkazib berish (30-60 min):</span>
                        <span>15,000 so'm</span>
                      </div>
                      <div className="h-px bg-white/10 my-6"></div>
                      <div className="flex justify-between items-end">
                        <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest pb-1">Umumiy summa:</span>
                        <span className="text-4xl font-black text-orange-500">{(cartTotal + 15000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-orange-500/30 transform hover:scale-105 active:scale-95">Tasdiqlash</button>
                    <p className="text-[10px] text-center text-stone-500 font-black uppercase tracking-widest">Issiq va sifatli yetkazish kafolati</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shopping' && (
           <div className="max-w-3xl mx-auto py-12 space-y-12 animate-in fade-in duration-500">
             <div className="text-center">
               <h2 className="text-5xl font-black mb-4 tracking-tighter">Xarid <span className="text-emerald-600">Ro'yxati</span></h2>
               <p className="text-stone-500">Retseptlar uchun kerakli masalliqlarni rejalashtiring.</p>
             </div>
             {shoppingList.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-stone-100 flex flex-col items-center">
                  <div className="text-6xl mb-6">📝</div>
                  <p className="text-stone-400 font-bold text-xl mb-8">Hozircha xaridlar ro'yxati bo'sh.</p>
                  <button onClick={() => setActiveTab('recipes')} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Retseptlar Olami</button>
               </div>
             ) : (
               <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-stone-100 space-y-6">
                 {shoppingList.map((item, i) => (
                   <div key={i} className="flex items-center gap-6 p-6 bg-stone-50 rounded-3xl border border-stone-100 group hover:bg-white hover:border-emerald-200 transition-all">
                      <input type="checkbox" className="w-6 h-6 rounded-xl border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-xl font-bold text-stone-700 flex-grow">{item}</span>
                   </div>
                 ))}
                 <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-between">
                    <button onClick={() => setShoppingList([])} className="text-red-400 font-black uppercase tracking-widest text-[10px] hover:text-red-600">Hammasini tozalash</button>
                    <button className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                       Telegramga jo'natish
                    </button>
                 </div>
               </div>
             )}
           </div>
        )}

        {activeTab === 'tracking' && (
          <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-500">
            {activeOrder ? (
              <div className="space-y-12">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-orange-100 rounded-[3rem] flex items-center justify-center text-5xl shadow-xl shadow-orange-500/10 rotate-12 animate-pulse">
                    {activeOrder.status === 'qabul_qilindi' ? '📥' : activeOrder.status === 'tayyorlanmoqda' ? '👨‍🍳' : '🚴‍♂️'}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white text-xl">✓</div>
                </div>
                
                <div>
                  <h2 className="text-5xl font-black tracking-tighter mb-2">Buyurtma #{activeOrder.id}</h2>
                  <p className="text-stone-400 font-black uppercase tracking-widest text-[10px]">Tushgan vaqt: {new Date(activeOrder.timestamp).toLocaleTimeString()}</p>
                </div>
                
                <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100 space-y-12 text-left relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                   
                   <StatusStep active={activeOrder.status === 'qabul_qilindi'} done={['tayyorlanmoqda', 'yolda', 'yetkazildi'].includes(activeOrder.status)} number={1} label="Buyurtma qabul qilindi" />
                   <StatusStep active={activeOrder.status === 'tayyorlanmoqda'} done={['yolda', 'yetkazildi'].includes(activeOrder.status)} number={2} label="Usta oshpaz tayyorlamoqda..." />
                   <StatusStep active={activeOrder.status === 'yolda'} done={activeOrder.status === 'yetkazildi'} number={3} label="Kuryer yo'lda (Issiq yetkazamiz)" />
                   <StatusStep active={activeOrder.status === 'yetkazildi'} done={false} number={4} label="Yetkazib berildi. Yoqimli ishtaha!" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     Kuryerga qo'ng'iroq
                   </button>
                   <button onClick={() => setActiveTab('home')} className="text-stone-400 font-black uppercase tracking-widest text-[10px] hover:text-stone-900 transition-colors py-5">Asosiy sahifaga</button>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center">
                <div className="text-7xl mb-10">📦</div>
                <h3 className="text-3xl font-black mb-4">Faol buyurtma topilmadi</h3>
                <p className="text-stone-500 mb-10 max-w-xs mx-auto">Hozirda sizning hech qanday buyurtmangiz tayyorlanmayapti.</p>
                <button onClick={() => setActiveTab('menu')} className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20">Buyurtma Berish</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'partner' && (
          <div className="space-y-12 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-5xl font-black mb-2 tracking-tighter">Hamkor <span className="text-orange-500">Paneli</span></h2>
                <p className="text-stone-500 text-lg">Restoran statistikasi va real-vaqtdagi buyurtmalar.</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">+ Taom qo'shish</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Umumiy savdo" value={`${partnerStats.totalSales.toLocaleString()} so'm`} color="stone" />
              <StatCard label="Buyurtmalar" value={`${partnerStats.orderCount} ta`} color="orange" />
              <StatCard label="O'rtacha reyting" value={`⭐️ ${partnerStats.rating}`} color="stone" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
               <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-stone-100">
                 <h4 className="text-2xl font-black mb-10 tracking-tight">Mijozlar nima deydi?</h4>
                 <div className="space-y-10">
                   {partnerStats.recentReviews.map((rev, i) => (
                     <div key={i} className="group pb-8 border-b border-stone-50 last:border-0 last:pb-0">
                       <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-600 text-xs">{rev.user[0]}</div>
                           <span className="font-black text-stone-900">{rev.user}</span>
                         </div>
                         <div className="flex text-orange-500 text-xs">{"★".repeat(rev.stars)}</div>
                       </div>
                       <p className="text-stone-500 italic font-medium leading-relaxed">"{rev.comment}"</p>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="bg-orange-500 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-3xl font-black mb-6 tracking-tight">Oshxonangizni Och Qolma bilan kengaytiring!</h4>
                    <p className="text-orange-100 text-lg font-medium leading-relaxed mb-10 opacity-90">Minglab mijozlar aynan sizning taomlaringizni kutmoqda. Biz bilan hamkorlik - bu rivojlanish demakdir.</p>
                    <button className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Hamkorlik Shartlari</button>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Nav (Mobile/Tablet Friendly) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-stone-100 px-8 py-5 z-50 flex justify-between items-center max-w-4xl mx-auto md:rounded-t-[3.5rem] md:shadow-2xl md:mb-4">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Asosiy" icon="🏠" />
        <NavButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} label="Menyu" icon="🍽️" />
        <NavButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} label="Retsept" icon="📖" />
        <NavButton active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} label="Savat" icon="🛒" count={cart.length} />
        <NavButton active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} label="Status" icon="📍" />
      </nav>

      {/* Recipe/Dish Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-2xl animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-2/5 relative h-80 md:h-auto bg-stone-100">
              <img src={selectedRecipe.image} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedRecipe(null)} className="absolute top-8 left-8 bg-white/20 backdrop-blur-md p-4 rounded-[2rem] text-white hover:bg-white hover:text-stone-900 transition-all shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-white/95 backdrop-blur-sm p-8 rounded-[3rem] shadow-2xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Kishi soni</span>
                       <span className="font-black text-stone-900">{selectedRecipe.servings} kishi</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Yetkazish</span>
                       <span className="font-black text-stone-900">{selectedRecipe.estimatedDelivery}</span>
                    </div>
                 </div>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-12 bg-white flex flex-col scrollbar-hide">
              <div className="flex-grow space-y-12">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest block">{selectedRecipe.category}</span>
                    <button onClick={(e) => toggleFavorite(selectedRecipe.id, e)} className={`p-3 rounded-2xl transition-all ${favorites.includes(selectedRecipe.id) ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-stone-100 text-stone-400 hover:text-red-500'}`}>
                       <svg className="w-6 h-6" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                  <h2 className="text-5xl font-black text-stone-900 mb-8 leading-none tracking-tighter">{selectedRecipe.name}</h2>
                  <p className="text-stone-500 text-lg leading-relaxed font-medium">{selectedRecipe.description}</p>
                </div>
                
                <div className="bg-stone-50 p-10 rounded-[3rem] border border-stone-100 relative overflow-hidden group">
                   <div className="absolute -top-6 -right-6 text-7xl opacity-5 grayscale group-hover:grayscale-0 transition-all duration-700">📜</div>
                   <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Milliy Meros
                   </h4>
                   <p className="text-stone-700 leading-relaxed italic text-base leading-loose">"{selectedRecipe.history}"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                   <section>
                      <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest">Masalliqlar</h4>
                        <button onClick={() => addToShoppingList(selectedRecipe.ingredients)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">Ro'yxatga ol</button>
                      </div>
                      <ul className="space-y-5">
                        {selectedRecipe.ingredients.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-stone-700 font-bold text-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span> {item}
                          </li>
                        ))}
                      </ul>
                   </section>
                   <section>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-8">Oshpazdan sirlar</h4>
                      <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
                        {selectedRecipe.secrets.map((s, i) => (
                          <p key={i} className="text-amber-900 text-sm font-bold leading-relaxed flex gap-3">
                             <span className="text-amber-500">✨</span> {s}
                          </p>
                        ))}
                      </div>
                   </section>
                </div>
              </div>
              
              <div className="pt-12 mt-12 border-t border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div>
                  <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Buyurtma narxi</span>
                  <span className="text-4xl font-black text-stone-900">{selectedRecipe.price.toLocaleString()} <span className="text-lg opacity-40">so'm</span></span>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <button onClick={() => { addToCart(selectedRecipe); setSelectedRecipe(null); }} className="flex-grow md:flex-none px-12 py-6 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-orange-500/30 hover:scale-105 transition-all transform active:scale-95">Savatga Qo'shish</button>
                   <button onClick={() => { setIsChatOpen(true); setSelectedRecipe(null); }} className="p-6 bg-stone-900 text-white rounded-[2rem] shadow-xl hover:bg-stone-800 transition-all">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout/Order Confirmation Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black tracking-tighter">To'lov va <span className="text-orange-500">Tasdiqlash</span></h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-stone-100 rounded-2xl">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-10">
                 {/* Pre-order toggle */}
                 <div className="bg-stone-50 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900">Oldindan buyurtma</h4>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Ma'lum vaqtga rejalashtirish</p>
                    </div>
                    <button 
                      onClick={() => setIsPreOrder(!isPreOrder)}
                      className={`w-14 h-8 rounded-full transition-all relative ${isPreOrder ? 'bg-orange-500' : 'bg-stone-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isPreOrder ? 'right-1' : 'left-1'}`}></div>
                    </button>
                 </div>

                 {isPreOrder && (
                   <input 
                    type="time" 
                    className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-orange-500"
                    value={preOrderTime}
                    onChange={(e) => setPreOrderTime(e.target.value)}
                   />
                 )}

                 {/* Payment Method */}
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">To'lov usuli</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {(['naqd', 'karta', 'online'] as PaymentMethod[]).map(m => (
                        <button 
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border-2 ${paymentMethod === m ? 'bg-stone-900 text-white border-stone-900 shadow-xl' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'}`}
                        >
                          {m === 'naqd' ? '💵 Naqd' : m === 'karta' ? '💳 Karta' : '🌐 Online'}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Order Note */}
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Oshpazga izoh (Ixtiyoriy)</h4>
                    <textarea 
                      className="w-full bg-stone-50 border-none rounded-[2rem] p-6 font-bold text-sm focus:ring-2 focus:ring-orange-500 h-32 resize-none"
                      placeholder="Masalan: Achchiq bo'lmasin, piyozsiz bo'lsin..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                    ></textarea>
                 </div>

                 <div className="bg-stone-900 rounded-[3rem] p-10 text-white">
                    <div className="flex justify-between items-end mb-8">
                       <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Jami summa:</span>
                       <span className="text-4xl font-black text-orange-500">{(cartTotal + 15000).toLocaleString()}</span>
                    </div>
                    <button onClick={placeOrder} className="w-full bg-orange-500 py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-all">Buyurtmani Tasdiqlash</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Floating AI Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-36 right-8 w-20 h-20 bg-stone-900 text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform z-40 border-[6px] border-white group"
      >
        👨‍🍳
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">AI</span>
      </button>

      {/* Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-[120] w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-10 bg-stone-900 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-orange-500 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl shadow-orange-500/20 rotate-3">👨‍🍳</div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter">Och Qolma AI</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Professional Oshpaz-Bot</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-4 hover:bg-white/10 rounded-[2rem] transition-colors relative z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-10 space-y-8 bg-stone-50 scroll-smooth">
            {chatHistory.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="text-7xl mb-10 opacity-20">🥘</div>
                <h4 className="text-2xl font-black mb-4 tracking-tight">Xush kelibsiz!</h4>
                <p className="text-stone-400 font-bold max-w-xs mx-auto text-sm leading-relaxed">
                  Men sizning milliy taomlar bo'yicha shaxsiy maslahatchiman. Nima pishirishni yoki qaysi taomni buyurtma qilishni tavsiya qilay?
                </p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-7 rounded-[2.5rem] text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none shadow-orange-500/10' : 'bg-white text-stone-700 rounded-tl-none border border-stone-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-stone-200 flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 border-t border-stone-100 flex gap-4 bg-white">
            <input 
              type="text" 
              className="flex-grow bg-stone-100 border-none rounded-[2.5rem] px-8 py-6 text-sm font-black focus:ring-4 focus:ring-orange-500/10"
              placeholder="Oshpazga savol bering..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskChef()}
            />
            <button onClick={handleAskChef} className="w-20 h-20 bg-stone-900 text-white rounded-[2.5rem] flex items-center justify-center hover:bg-orange-500 transition-all shadow-xl group">
              <svg className="w-7 h-7 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-500 py-32 px-12 border-t border-stone-800 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-2">
             <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl rotate-6 shadow-xl shadow-orange-500/10">🔥</div>
              <span className="text-3xl font-black text-white italic tracking-tighter">Och Qolma<span className="text-orange-500">.</span></span>
            </div>
            <p className="max-w-md text-stone-400 font-medium text-lg leading-relaxed mb-12 opacity-80">
              Milliy taomlarimizni har bir xonadonga issiq yetkazib berish va gastronomik madaniyatimizni raqamli dunyoda yashnatish - bizning oliy maqsadimiz.
            </p>
            <div className="flex gap-6">
               <FooterSocial label="IG" />
               <FooterSocial label="TG" />
               <FooterSocial label="YT" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-10">Bo'limlar</h4>
            <ul className="space-y-8 font-black text-sm">
              <li><button onClick={() => setActiveTab('menu')} className="hover:text-white transition-colors uppercase tracking-widest text-[11px]">Online Buyurtma</button></li>
              <li><button onClick={() => setActiveTab('recipes')} className="hover:text-white transition-colors uppercase tracking-widest text-[11px]">Retseptlar Olami</button></li>
              <li><button onClick={() => setActiveTab('partner')} className="hover:text-white transition-colors uppercase tracking-widest text-[11px]">Hamkorlar Uchun</button></li>
              <li><button className="hover:text-white transition-colors uppercase tracking-widest text-[11px]">Vakansiyalar</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-10">Ma'lumot</h4>
            <ul className="space-y-8 font-black text-sm">
              <li className="flex items-center gap-3">
                 <span className="text-orange-500">📍</span> Toshkent sh., Navoiy 14
              </li>
              <li className="flex items-center gap-3">
                 <span className="text-orange-500">📞</span> +998 71 200-00-00
              </li>
              <li className="flex items-center gap-3">
                 <span className="text-orange-500">✉️</span> salom@ochqolma.uz
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] font-black uppercase tracking-widest gap-10">
          <p>© 2024 Och Qolma Food-Tech Group. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors">Maxfiylik Siyosati</a>
            <a href="#" className="hover:text-white transition-colors">Foydalanish Shartlari</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// UI Components
const MenuCard: React.FC<{recipe: Recipe, onClick: () => void, onAddToCart: (r: Recipe) => void, isFavorite: boolean, onToggleFavorite: (id: string, e: React.MouseEvent) => void}> = ({ recipe, onClick, onAddToCart, isFavorite, onToggleFavorite }) => (
  <div 
    className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer flex flex-col border border-stone-100 transform hover:-translate-y-3"
    onClick={onClick}
  >
    <div className="relative h-64 overflow-hidden">
      <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg text-orange-600">30-45 min</div>
      <button 
        onClick={(e) => onToggleFavorite(recipe.id, e)}
        className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500 text-white shadow-xl rotate-12' : 'bg-white/40 text-stone-900 hover:bg-white shadow-sm'}`}
      >
        <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      </button>
      <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
         <button onClick={(e) => { e.stopPropagation(); onAddToCart(recipe); }} className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-500/30">Buyurtma Berish</button>
      </div>
    </div>
    <div className="p-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{recipe.category}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Porsiya: {recipe.servings}</span>
      </div>
      <h3 className="text-2xl font-black mb-4 text-stone-900 group-hover:text-orange-500 transition-colors leading-none tracking-tight">{recipe.name}</h3>
      <div className="flex justify-between items-center pt-6 border-t border-stone-50">
        <span className="text-2xl font-black text-stone-900">{recipe.price.toLocaleString()} <span className="text-[10px] opacity-40 uppercase tracking-widest">so'm</span></span>
        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>
    </div>
  </div>
);

const NavButton: React.FC<{active: boolean, onClick: () => void, label: string, icon: string, count?: number}> = ({ active, onClick, label, icon, count }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all group ${active ? 'text-orange-500 scale-110' : 'text-stone-400 hover:text-stone-700'}`}>
    <div className="relative text-2xl group-hover:rotate-12 transition-transform">
      {icon}
      {count !== undefined && count > 0 && <span className="absolute -top-1.5 -right-3 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-lg">{count}</span>}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard: React.FC<{label: string, value: string, color: 'stone' | 'orange'}> = ({ label, value, color }) => (
  <div className={`${color === 'orange' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-white text-stone-900 shadow-sm border border-stone-100'} p-10 rounded-[3rem] transform hover:-translate-y-2 transition-all`}>
    <span className={`${color === 'orange' ? 'text-orange-100' : 'text-stone-400'} text-[10px] font-black uppercase tracking-widest block mb-4`}>{label}</span>
    <h4 className="text-3xl font-black tracking-tighter">{value}</h4>
  </div>
);

const StatusStep: React.FC<{active: boolean, done: boolean, number: number, label: string}> = ({ active, done, number, label }) => (
  <div className={`flex items-center gap-8 ${active ? 'text-orange-600' : done ? 'text-emerald-600' : 'text-stone-300'} transition-all`}>
    <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center font-black text-xs transition-all ${active ? 'bg-orange-500 text-white ring-8 ring-orange-50 shadow-xl' : done ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
      {done ? '✓' : number}
    </div>
    <span className={`font-black uppercase tracking-widest text-sm ${active ? 'scale-110 translate-x-2' : ''} transition-all`}>{label}</span>
  </div>
);

const FooterSocial: React.FC<{label: string}> = ({ label }) => (
  <a href="#" className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-inner font-black uppercase text-[10px] tracking-widest">{label}</a>
);

export default App;
