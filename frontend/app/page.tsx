"use client";
import { useState, useEffect } from "react";

interface Menu {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  badge?: string;
}

interface CartItem extends Menu {
  qty: number;
}

export default function CustomerPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState("All menu");
  const [searchTerm, setSearchTerm] = useState("");

  const [isCartOpen, setIsCartOpen] = useState(false);

  // State Input Pelanggan
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE BARU: Untuk melacak status loading dan error agar layar tidak cuma blank
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchMenus();

    // Ambil keranjang dari penyimpanan browser (Anti-Hilang)
    const savedCart = localStorage.getItem("cafego_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cafego_cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cafego_cart");
    }
  }, [cart]);

  // FUNGSI FETCH YANG SUDAH DIOPTIMASI
  const fetchMenus = () => {
    setIsLoading(true);
    setErrorMsg("");

    // Catatan: Jika 127.0.0.1 tetap gagal, coba ganti menjadi localhost:8000
    fetch("http://127.0.0.1:8000/api/menus")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal terhubung ke server Laravel.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.length === 0) {
          setErrorMsg("Data menu kosong. Silakan isi tabel menus di Supabase.");
        }
        const formatted = data.map((item: any) => ({
          ...item,
          category: item.category || "Coffee",
          description:
            item.description ||
            "Sajian premium kami yang dibuat dengan bahan-bahan pilihan.",
          image:
            item.image ||
            "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=400&fit=crop",
          badge: item.stock <= 5 ? "STOK MENIPIS" : null,
        }));
        setMenus(formatted);
      })
      .catch((err) => {
        console.error("Gagal memuat menu:", err);
        setErrorMsg(
          "Koneksi terputus. Pastikan server Laravel (php artisan serve) sedang menyala.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const categories = [
    "All menu",
    "Coffee",
    "Non Coffee",
    "Pastries",
    "Food",
    "Minuman",
    "Makanan",
  ];

  const filteredMenus = menus.filter((item) => {
    const matchCategory =
      currentCategory === "All menu" ||
      item.category.toLowerCase() === currentCategory.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const addToCart = (menu: Menu) => {
    if (menu.stock <= 0) return alert("Maaf, stok menu ini habis!");
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === menu.id);
      if (existing) {
        if (existing.qty >= menu.stock) {
          alert("Mencapai batas maksimal stok!");
          return prevCart;
        }
        return prevCart.map((c) =>
          c.id === menu.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prevCart, { ...menu, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((item) => {
            if (item.id === id) {
              const newQty = item.qty + delta;
              return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const processCheckout = async () => {
    if (!customerName.trim() || !tableNumber.trim()) {
      alert("Tolong isi Nama dan Nomor Meja terlebih dahulu ya!");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customer_name: customerName,
      table_number: tableNumber,
      payment_method: paymentMethod,
      total_amount: totalAmount,
      items: cart.map((item) => ({
        menu_id: item.id,
        quantity: item.qty,
        price: item.price,
      })),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert("Pesanan berhasil dibuat! Silakan tunggu di meja Anda.");
        setCart([]);
        setCustomerName("");
        setTableNumber("");
        setIsCartOpen(false);
        fetchMenus();
      } else {
        alert("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbf7f3] text-[#3e2723] font-sans antialiased min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fbf7f3]/90 backdrop-blur-md px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3e2723] text-[#fbf7f3] rounded-xl flex items-center justify-center shrink-0">
            <i className="ph ph-coffee text-2xl"></i>
          </div>
          {/* NAMA SUDAH DIPERBAIKI MENJADI CafeGo */}
          <h1 className="font-serif font-bold text-2xl tracking-tight hidden sm:block">
            CafeGo
          </h1>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative group">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari menu..."
              className="pl-9 pr-4 py-2 w-40 sm:w-56 md:w-64 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:border-[#a77b5a] text-sm"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="w-10 h-10 rounded-full bg-[#3e2723] flex items-center justify-center text-white relative hover:scale-105 transition shadow-sm"
          >
            <i className="ph ph-shopping-bag text-xl"></i>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <section className="mb-10 relative">
          <p className="text-xs font-semibold tracking-widest text-[#a77b5a] uppercase mb-3 flex items-center gap-2">
            <i className="ph-fill ph-sparkle text-sm"></i> Made fresh, just for
            you
          </p>
          <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-4 text-[#3e2723]">
            Good mood, <br />
            <span className="italic text-[#a77b5a]">great coffee.</span>
          </h2>
          <p className="text-gray-600 max-w-md">
            Pilih menu favoritmu, pesanan akan langsung diteruskan ke dapur.
          </p>
        </section>

        <div className="flex overflow-x-auto gap-3 py-4 mb-6 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${
                currentCategory === cat
                  ? "bg-[#3e2723] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TAMPILAN GRID MENU (DENGAN INDIKATOR LOADING & ERROR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[300px]">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="font-bold text-lg animate-pulse">
                Memuat menu lezat untukmu...
              </p>
            </div>
          ) : errorMsg ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100">
              <p className="font-bold text-lg">{errorMsg}</p>
              <p className="text-sm mt-2 text-red-400">
                Cek terminal VS Code untuk memastikan backend berjalan.
              </p>
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="font-medium">
                Tidak ada menu yang sesuai dengan pencarian.
              </p>
            </div>
          ) : (
            filteredMenus.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col h-full border border-gray-50"
              >
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#3e2723] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm z-10">
                    {item.badge}
                  </span>
                )}

                <div className="w-full h-48 rounded-[1.5rem] overflow-hidden mb-4 relative bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="flex flex-col flex-grow px-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-[#a77b5a] uppercase tracking-widest">
                      {item.category}
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      Stok: {item.stock}
                    </p>
                  </div>
                  <h4 className="font-serif font-bold text-xl mb-3 leading-tight text-[#3e2723]">
                    {item.name}
                  </h4>

                  <div className="mt-auto flex justify-between items-end pt-2">
                    <span className="font-bold text-lg text-[#3e2723]">
                      {formatRp(item.price)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock <= 0}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        item.stock > 0
                          ? "bg-[#fbf7f3] text-[#3e2723] border border-[#ebdccc] hover:bg-[#3e2723] hover:text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <i className="ph ph-plus text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Area Keranjang / Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#fbf7f3]">
              <h2 className="font-serif font-bold text-xl text-[#3e2723]">
                Pesanan Anda
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gray-50/50">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="mt-4 font-medium">Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-[#3e2723]">
                        {item.name}
                      </h5>
                      <p className="text-[#a77b5a] text-sm font-semibold">
                        {formatRp(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 bg-white rounded-full font-bold shadow-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 bg-[#3e2723] text-white rounded-full font-bold shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Area Input Data Pelanggan */}
            <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] space-y-4">
              {cart.length > 0 && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan Nama Anda"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#a77b5a] outline-none text-sm font-bold text-[#3e2723]"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Nomor Meja"
                      className="w-1/2 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#a77b5a] outline-none text-sm font-bold text-[#3e2723]"
                    />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-1/2 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#a77b5a] outline-none text-sm font-bold text-[#3e2723] bg-white"
                    >
                      <option value="qris">Bayar QRIS</option>
                      <option value="kasir">Di Kasir</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 font-medium">
                  Total Pembayaran
                </span>
                <span className="text-2xl font-black text-[#3e2723]">
                  {formatRp(totalAmount)}
                </span>
              </div>
              <button
                onClick={processCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${cart.length > 0 ? "bg-[#3e2723] hover:bg-[#a77b5a] active:scale-95" : "bg-gray-400"}`}
              >
                {isSubmitting ? "Memproses..." : "Kirim Pesanan ke Dapur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
