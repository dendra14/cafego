"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import MenuCard from "../components/MenuCard";
import CartSidebar from "../components/CartSidebar";
import MenuDetailModal from "../components/MenuDetailModal";
import CheckoutModal from "../components/CheckoutModal"; // 1. Import komponen baru

export default function Home() {
  const [menus, setMenus] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState("All menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // 2. State untuk modal checkout

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/menus")
      .then((response) => {
        if (!response.ok) throw new Error("Gagal terhubung ke server");
        return response.json();
      })
      .then((data) => {
        setMenus(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const categories = [
    "All menu",
    ...Array.from(new Set(menus.map((item) => item.category))),
  ].filter(Boolean);

  const filteredMenus = menus.filter((item) => {
    const matchCategory =
      currentCategory === "All menu" || item.category === currentCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id: any, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return { ...item, qty: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  // 3. Tombol checkout di keranjang sekarang akan membuka modal pembayaran
  const openCheckout = () => {
    setIsCartOpen(false); // Tutup sidebar keranjang
    setIsCheckoutOpen(true); // Buka panel pembayaran
  };

  // 4. Logika ketika pembayaran akhirnya dikonfirmasi
  const handleFinalCheckout = (method: string) => {
    if (method === "kasir") {
      alert(
        "Sip! Pesanan dicatat. Silakan lakukan pembayaran di meja Kasir ya.",
      );
    } else if (method === "qris") {
      alert(
        "Pembayaran QRIS berhasil! Barista kami akan segera menyiapkan pesananmu.",
      );
    }

    // Setelah sukses, kosongkan keranjang dan tutup modal
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Header
        cartCount={cartCount}
        onSearch={setSearchTerm}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        <HeroSection />

        <div className="flex overflow-x-auto gap-3 py-4 mb-6 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ease-out ${
                currentCategory === cat
                  ? "bg-cafe-text text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm hover:scale-105"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-between items-end fade-in-up">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
              Today's Picks
            </p>
            <h3 className="font-serif text-3xl font-bold transition-all">
              {searchTerm ? `Mencari: "${searchTerm}"` : currentCategory}
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {filteredMenus.length} menu tersedia
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-cafe-accent font-medium animate-pulse">
            Memanaskan mesin espresso... (Memuat data)
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-medium">
            Error: {error} <br />
            <span className="text-sm text-gray-500">
              Pastikan backend Laravel berjalan di terminal lain.
            </span>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 fade-in-up">
            <i className="ph ph-magnifying-glass text-5xl mb-3 opacity-50"></i>
            <p className="font-medium text-lg text-cafe-text">
              Menu tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[300px]">
            {filteredMenus.map((item, index) => (
              <MenuCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedItem(item)}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={updateCartQty}
        onCheckout={openCheckout} // Memanggil fungsi baru untuk membuka modal
      />

      <MenuDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={addToCart}
      />

      {/* 5. Memasang komponen Modal Checkout di halaman utama */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onConfirm={handleFinalCheckout}
      />
    </>
  );
}
