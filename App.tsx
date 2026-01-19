
import React, { useState, useMemo, useEffect } from 'react';
import { recipes as initialRecipes } from './data';
import { Recipe, CartItem, OrderStatus, RestaurantStats, PaymentMethod } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'tracking' | 'recipes' | 'favorites' | 'partner'>('home');
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(initialRecipes);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Admin / Partner States
  const [isEditingRecipe, setIsEditingRecipe] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);

  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('karta');
  const [address, setAddress] = useState('Toshkent sh., Mirabod tumani, Oybek ko\'chasi');
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderTime, setPreOrderTime] = useState('');

  // AI Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cart Functions
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (recipe: Recipe) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === recipe.id);
      if (existing) {
        return prev.map(item => item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: recipe.id, name: recipe.name, price: recipe.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Order Functions
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
    
    // Simulate status updates
    setTimeout(() => setActiveOrder(prev => prev ? {...prev, status: 'tayyorlanmoqda'} : null), 5000);
    setTimeout(() => setActiveOrder(prev => prev ? {...prev, status: 'yolda'} : null), 15000);
  };

  // Admin Functions
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    if (editingRecipe.id) {
      // Update existing
      setAllRecipes(prev => prev.map(r => r.id === editingRecipe.id ? (editingRecipe as Recipe) : r));
    } else {
      // Create new
      const newRecipe: Recipe = {
        ...(editingRecipe as Recipe),
        id: Math.random().toString(36).substr(2, 9),
      };
      setAllRecipes(prev => [newRecipe, ...prev]);
    }
    setIsEditingRecipe(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm("Ushbu taomni o'chirib tashlamoqchimisiz?")) {
      setAllRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const startEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditingRecipe(true);
  };

  const startCreate = () => {
    setEditingRecipe({
      name: '',
      category: 'Asosiy',
      difficulty: 'Tez',
      price: 0,
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      ingredients: [],
      steps: [],
      secrets: [],
      history: '',
      estimatedDelivery: '30-45 min',
      cookTime: '30 min',
      prepTime: '15 min',
      servings: 1
    });
    setIsEditingRecipe(true);
  };

  // AI Functions
  const handleAskChef = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsLoading(true);
    const response = await geminiService.askChef(userMsg, `Tab: ${activeTab}, Recipes count: ${allRecipes.length}`);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50 h-20">
        <div className="max-w-6xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform">🔥</div>
            <span className="text-2xl font-black tracking-tighter">Och Qolma<span className="text-orange-500">.</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('home')} className={`text-xs font-black uppercase tracking-widest ${activeTab === 'home' ? 'text-orange-600' : 'text-stone-400'}`}>Bosh sahifa</button>
            <button onClick={() => setActiveTab('menu')} className={`text-xs font-black uppercase tracking-widest ${activeTab === 'menu' ? 'text-orange-600' : 'text-stone-400'}`}>Menyu</button>
            <button onClick={() => setActiveTab('recipes')} className={`text-xs font-black uppercase tracking-widest ${activeTab === 'recipes' ? 'text-orange-600' : 'text-stone-400'}`}>Retseptlar</button>
            <button onClick={() => setActiveTab('partner')} className={`text-xs font-black uppercase tracking-widest ${activeTab === 'partner' ? 'text-orange-600' : 'text-stone-400'}`}>Admin</button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('favorites')} className="p-2.5 bg-stone-100 rounded-2xl hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button onClick={() => setActiveTab('cart')} className="relative p-2.5 bg-stone-100 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black px-1.5 rounded-full ring-2 ring-white">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-6 pb-32">
        {activeTab === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <section className="bg-stone-900 rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-8">
                <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">Och qoldingizmi? <br/><span className="text-orange-500">Och Qolma!</span></h1>
                <p className="text-stone-400 text-lg max-w-lg">Eng sara o'zbek taomlari va pishirish sirlari endi bir joyda. Tez, issiq va mazali!</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setActiveTab('menu')} className="bg-orange-500 hover:bg-orange-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-orange-500/30">Buyurtma berish</button>
                  <button onClick={() => setActiveTab('recipes')} className="bg-white/10 hover:bg-white/20 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm border border-white/10">Retseptlar</button>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]"></div>
            </section>

            <section>
              <h2 className="text-4xl font-black mb-12">Mashhur taomlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {allRecipes.slice(0, 4).map(r => (
                  <MenuCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} onAddToCart={addToCart} isFavorite={favorites.includes(r.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Toliq Menyu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {allRecipes.map(r => (
                <MenuCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} onAddToCart={addToCart} isFavorite={favorites.includes(r.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Pishirish sirlari</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {allRecipes.map(r => (
                <div key={r.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 cursor-pointer" onClick={() => setSelectedRecipe(r)}>
                  <img src={r.image} className="h-48 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-black mb-2">{r.name}</h3>
                    <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Vaqt: {r.cookTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black tracking-tighter">Savatcha</h2>
            {cart.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-stone-100 flex flex-col items-center">
                <div className="text-6xl mb-6">🛒</div>
                <p className="text-stone-400 font-bold text-xl mb-8">Savatchangiz bo'sh.</p>
                <button onClick={() => setActiveTab('menu')} className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm">Taom tanlash</button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-stone-100 space-y-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center pb-8 border-b border-stone-50 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-black text-xl">{item.name}</h4>
                          <p className="text-stone-400 text-sm">{item.quantity} dona x {item.price.toLocaleString()} so'm</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-black text-2xl text-stone-900">{(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-900 rounded-[3.5rem] p-12 text-white h-fit shadow-2xl space-y-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center opacity-60 font-bold"><span>Jami:</span><span>{cartTotal.toLocaleString()} so'm</span></div>
                    <div className="flex justify-between items-center opacity-60 font-bold"><span>Yetkazish:</span><span>15,000 so'm</span></div>
                    <div className="h-px bg-white/10 my-6"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">Jami to'lov:</span>
                      <span className="text-4xl font-black text-orange-500">{(cartTotal + 15000).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-orange-500 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl">Davom etish</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-500">
            {activeOrder ? (
              <div className="space-y-12">
                <div className="w-32 h-32 bg-orange-100 rounded-[3rem] flex items-center justify-center text-5xl mx-auto shadow-xl rotate-12">
                  {activeOrder.status === 'qabul_qilindi' ? '📥' : activeOrder.status === 'tayyorlanmoqda' ? '👨‍🍳' : '🚴‍♂️'}
                </div>
                <h2 className="text-5xl font-black tracking-tighter">Buyurtma #{activeOrder.id}</h2>
                <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100 space-y-12 text-left">
                   <StatusStep active={activeOrder.status === 'qabul_qilindi'} done={['tayyorlanmoqda', 'yolda', 'yetkazildi'].includes(activeOrder.status)} number={1} label="Buyurtma qabul qilindi" />
                   <StatusStep active={activeOrder.status === 'tayyorlanmoqda'} done={['yolda', 'yetkazildi'].includes(activeOrder.status)} number={2} label="Usta oshpaz tayyorlamoqda..." />
                   <StatusStep active={activeOrder.status === 'yolda'} done={activeOrder.status === 'yetkazildi'} number={3} label="Kuryer yo'lda" />
                </div>
              </div>
            ) : (
              <p className="text-stone-400 font-bold">Faol buyurtma topilmadi.</p>
            )}
          </div>
        )}

        {activeTab === 'partner' && (
          <div className="space-y-12 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-black tracking-tighter">Admin Paneli</h2>
                <p className="text-stone-500 text-lg">Taomlarni boshqarish va statistika.</p>
              </div>
              <button onClick={startCreate} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">+ Yangi Taom</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Jami Savdo" value="12,450,000 so'm" />
              <StatCard label="Buyurtmalar" value="154 ta" />
              <StatCard label="Reyting" value="⭐️ 4.9" />
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-stone-100 overflow-hidden">
               <h4 className="text-2xl font-black mb-8">Barcha Taomlar</h4>
               <div className="divide-y divide-stone-100">
                  {allRecipes.map(r => (
                    <div key={r.id} className="py-6 flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <img src={r.image} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h5 className="font-black text-lg">{r.name}</h5>
                          <span className="text-xs text-stone-400 font-bold">{r.category} • {r.price.toLocaleString()} so'm</span>
                        </div>
                      </div>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => startEdit(r)} className="p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all">Tahrirlash</button>
                         <button onClick={() => handleDeleteRecipe(r.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">O'chirish</button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Edit/Create Modal */}
      {isEditingRecipe && editingRecipe && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl space-y-8 my-10">
            <h3 className="text-3xl font-black">{editingRecipe.id ? "Taomni tahrirlash" : "Yangi taom qo'shish"}</h3>
            <form onSubmit={handleSaveRecipe} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-stone-400">Nomi</label>
                  <input required value={editingRecipe.name} onChange={e => setEditingRecipe({...editingRecipe, name: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold" />
               </div>
               <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-stone-400">Kategoriya</label>
                  <select value={editingRecipe.category} onChange={e => setEditingRecipe({...editingRecipe, category: e.target.value as any})} className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold">
                    <option>Asosiy</option>
                    <option>Suyuq</option>
                    <option>Xamir</option>
                    <option>Kabob</option>
                  </select>
               </div>
               <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-stone-400">Narxi (so'm)</label>
                  <input required type="number" value={editingRecipe.price} onChange={e => setEditingRecipe({...editingRecipe, price: Number(e.target.value)})} className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold" />
               </div>
               <div className="space-y-4">
                  <label className="block text-xs font-black uppercase text-stone-400">Rasm URL</label>
                  <input required value={editingRecipe.image} onChange={e => setEditingRecipe({...editingRecipe, image: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold" />
               </div>
               <div className="md:col-span-2 space-y-4">
                  <label className="block text-xs font-black uppercase text-stone-400">Tavsif</label>
                  <textarea value={editingRecipe.description} onChange={e => setEditingRecipe({...editingRecipe, description: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl p-4 font-bold h-24 resize-none" />
               </div>
               <div className="md:col-span-2 flex gap-4 pt-6">
                  <button type="submit" className="flex-grow bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Saqlash</button>
                  <button type="button" onClick={() => setIsEditingRecipe(false)} className="px-10 py-5 bg-stone-100 text-stone-400 rounded-2xl font-black uppercase tracking-widest text-sm">Bekor qilish</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl space-y-10">
              <h3 className="text-4xl font-black tracking-tighter">To'lov va Tasdiqlash</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">To'lov usuli</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {(['naqd', 'karta', 'online'] as PaymentMethod[]).map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} className={`py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border-2 ${paymentMethod === m ? 'bg-stone-900 text-white border-stone-900 shadow-xl' : 'bg-white text-stone-400 border-stone-100'}`}>
                        {m === 'naqd' ? '💵 Naqd' : m === 'karta' ? '💳 Karta' : '🌐 Online'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-stone-900 rounded-[3rem] p-10 text-white">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Jami:</span>
                    <span className="text-4xl font-black text-orange-500">{(cartTotal + 15000).toLocaleString()}</span>
                  </div>
                  <button onClick={placeOrder} className="w-full bg-orange-500 py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl">Buyurtmani Tasdiqlash</button>
                </div>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-full text-stone-400 font-bold uppercase tracking-widest text-[10px]">Bekor qilish</button>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-2xl animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-2/5 relative h-80 md:h-auto bg-stone-100">
              <img src={selectedRecipe.image} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedRecipe(null)} className="absolute top-8 left-8 bg-white/20 backdrop-blur-md p-4 rounded-[2rem] text-white hover:bg-white hover:text-stone-900 transition-all shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-12 bg-white flex flex-col">
              <div className="flex-grow space-y-10">
                <h2 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">{selectedRecipe.name}</h2>
                <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Taom Tarixi</h4>
                  <p className="text-stone-700 italic">"{selectedRecipe.history || selectedRecipe.description}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                   <section>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-6">Masalliqlar</h4>
                      <ul className="space-y-4">
                        {selectedRecipe.ingredients.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-stone-700 font-bold text-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></span> {item}
                          </li>
                        ))}
                      </ul>
                   </section>
                   <section>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-6">Tayyorlash usuli</h4>
                      <div className="space-y-4">
                        {selectedRecipe.steps.map((s, i) => (
                           <p key={i} className="text-stone-500 text-sm font-medium"><span className="text-orange-500 font-black mr-2">{i+1}.</span> {s}</p>
                        ))}
                      </div>
                   </section>
                </div>
              </div>
              <div className="pt-12 mt-12 border-t border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div>
                  <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Narxi</span>
                  <span className="text-3xl font-black text-stone-900">{selectedRecipe.price.toLocaleString()} so'm</span>
                </div>
                <button onClick={() => { addToCart(selectedRecipe); setSelectedRecipe(null); }} className="px-12 py-6 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl transform hover:scale-105 transition-all">Savatga Qo'shish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Button */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-8 w-20 h-20 bg-stone-900 text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform z-40 border-[6px] border-white group">
        👨‍🍳
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">AI</span>
      </button>

      {/* AI Assistant Drawer */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-[120] w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-10 bg-stone-900 text-white flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tighter">Och Qolma AI</h3>
            <button onClick={() => setIsChatOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-10 space-y-8 bg-stone-50">
            {chatHistory.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="text-7xl mb-10 opacity-20">🥟</div>
                <p className="text-stone-400 font-bold max-w-xs mx-auto">Assalomu alaykum! Bugun qanday lazzatli milliy taomni iste'mol qilmoqchisiz?</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-7 rounded-[2.5rem] text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-stone-700 rounded-tl-none border border-stone-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="animate-pulse text-stone-400 font-black uppercase text-[10px] tracking-widest">Oshpaz javob yozmoqda...</div>}
          </div>
          <div className="p-10 border-t border-stone-100 flex gap-4 bg-white">
            <input type="text" className="flex-grow bg-stone-100 border-none rounded-[2.5rem] px-8 py-6 text-sm font-black focus:ring-4 focus:ring-orange-500/10" placeholder="Savol bering..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskChef()} />
            <button onClick={handleAskChef} className="w-20 h-20 bg-stone-900 text-white rounded-[2.5rem] flex items-center justify-center hover:bg-orange-500 transition-all shadow-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-500 py-24 px-12 border-t border-stone-800 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl rotate-6 shadow-xl">🔥</div>
              <span className="text-3xl font-black text-white italic tracking-tighter">Och Qolma<span className="text-orange-500">.</span></span>
            </div>
            <p className="max-w-md text-stone-400 font-medium text-lg leading-relaxed mb-12">Milliy taomlarimizni har bir xonadonga issiq yetkazib berish va o'zbek oshxonasi san'atini butun dunyoga tanitish - bizning asosiy maqsadimizdir.</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-10">Bo'limlar</h4>
            <ul className="space-y-8 font-black text-sm uppercase tracking-widest text-[11px]">
              <li><button onClick={() => setActiveTab('menu')} className="hover:text-white transition-colors">Menyu</button></li>
              <li><button onClick={() => setActiveTab('recipes')} className="hover:text-white transition-colors">Retseptlar</button></li>
              <li><button onClick={() => setActiveTab('partner')} className="hover:text-white transition-colors">Admin Paneli</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-10">Kontakt</h4>
            <ul className="space-y-8 font-black text-sm">
              <li className="flex items-center gap-3">📍 Toshkent sh., Navoiy 14</li>
              <li className="flex items-center gap-3">📞 +998 71 200-00-00</li>
              <li className="flex items-center gap-3">✉️ info@ochqolma.uz</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

// UI Components
const MenuCard: React.FC<{recipe: Recipe, onClick: () => void, onAddToCart: (r: Recipe) => void, isFavorite: boolean, onToggleFavorite: (id: string, e: React.MouseEvent) => void}> = ({ recipe, onClick, onAddToCart, isFavorite, onToggleFavorite }) => (
  <div className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer flex flex-col border border-stone-100 transform hover:-translate-y-3" onClick={onClick}>
    <div className="relative h-64 overflow-hidden">
      <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <button onClick={(e) => onToggleFavorite(recipe.id, e)} className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500 text-white shadow-xl' : 'bg-white/40 text-stone-900 hover:bg-white'}`}>
        <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      </button>
      <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
         <button onClick={(e) => { e.stopPropagation(); onAddToCart(recipe); }} className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl">Buyurtma Berish</button>
      </div>
    </div>
    <div className="p-8 flex-grow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{recipe.category}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">{recipe.estimatedDelivery}</span>
      </div>
      <h3 className="text-2xl font-black mb-4 leading-none tracking-tight">{recipe.name}</h3>
      <div className="flex justify-between items-center pt-6 border-t border-stone-50">
        <span className="text-2xl font-black text-stone-900">{recipe.price.toLocaleString()} so'm</span>
        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></div>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{label: string, value: string}> = ({ label, value }) => (
  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100 transform hover:-translate-y-2 transition-all">
    <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest block mb-4">{label}</span>
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

export default App;
