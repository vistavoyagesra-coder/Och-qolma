import React, { useState, useMemo } from 'react';
import { recipes } from './data';
import { Recipe, CartItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'menu' | 'recipes' | 'cart' | 'adminLogin' | 'admin'
  >('home');

  const [adminPassword, setAdminPassword] = useState('');

  /* ================= HEADER ================= */
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">

          {/* LOGO */}
          <div
            className="text-2xl font-black cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            Och Qolma<span className="text-orange-500">.</span>
          </div>

          {/* NAV */}
          <div className="flex gap-3 items-center">
            <button onClick={() => setActiveTab('home')}>Home</button>
            <button onClick={() => setActiveTab('menu')}>Menu</button>
            <button onClick={() => setActiveTab('recipes')}>Recipes</button>

            <button
              onClick={() => setActiveTab('adminLogin')}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
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
          <h1 className="text-4xl font-black">Bosh sahifa</h1>
        )}

        {/* ADMIN LOGIN */}
        {activeTab === 'adminLogin' && (
          <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-black mb-6 text-center">
              Admin Login
            </h2>

            <input
              type="password"
              placeholder="Admin parol"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
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
          <div className="bg-white p-10 rounded-2xl shadow">
            <h1 className="text-3xl font-black mb-6">
              Admin Panel
            </h1>

            <div className="flex gap-4">
              <button
                className="bg-green-600 text-white px-6 py-3 rounded font-bold"
                onClick={() => alert("Taom qo‘shish")}
              >
                + Taom qo‘shish
              </button>

              <button
                className="bg-blue-600 text-white px-6 py-3 rounded font-bold"
                onClick={() => alert("Buyurtmalar")}
              >
                Buyurtmalar
              </button>

              <button
                className="bg-gray-300 px-6 py-3 rounded font-bold"
                onClick={() => setActiveTab('home')}
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
