import React, { useState } from 'react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'menu' | 'recipes' | 'adminLogin' | 'admin'
  >('home');

  const [adminPassword, setAdminPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">

          {/* LOGO */}
          <div
            className="text-xl font-bold cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            Och Qolma.
          </div>

          {/* NAV */}
          <div className="flex items-center gap-6">
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

        {/* -------- HOME -------- */}
        {activeTab === 'home' && (
          <div>
            <h1 className="text-4xl font-bold mb-4">Och qoldingizmi?</h1>
            <p className="text-gray-600">
              Milliy taomлар, тез етказиб бериш ва уста ошпазлар 👨‍🍳
            </p>
          </div>
        )}

        {/* -------- MENU -------- */}
        {activeTab === 'menu' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Menyu</h1>
            <p>Bu yerda taomlar ro‘yxati bo‘ladi</p>
          </div>
        )}

        {/* -------- RECIPES -------- */}
        {activeTab === 'recipes' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Retseptlar</h1>
            <p>Bu yerda retseptlar bo‘ladi</p>
          </div>
        )}

        {/* -------- ADMIN LOGIN -------- */}
        {activeTab === 'adminLogin' && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow">
            <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

            <input
              type="password"
              placeholder="Admin parol"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={() => {
                if (adminPassword === '1234') {
                  setActiveTab('admin');
                  setAdminPassword('');
                } else {
                  alert('Noto‘g‘ri parol');
                }
              }}
              className="w-full bg-red-600 text-white p-3 rounded font-bold"
            >
              Kirish
            </button>
          </div>
        )}

        {/* -------- ADMIN PANEL -------- */}
        {activeTab === 'admin' && (
          <div className="p-10 bg-gray-50 rounded-2xl">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

            <div className="flex gap-4">
              <button
                onClick={() => alert('Taom qo‘shish')}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                + Taom qo‘shish
              </button>

              <button
                onClick={() => alert('Buyurtmalar')}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Buyurtmalar
              </button>

              <button
                onClick={() => setActiveTab('home')}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
