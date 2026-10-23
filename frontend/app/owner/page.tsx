"use client";
import { useEffect, useState, useRef } from "react";

interface Menu {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

interface Order {
  id: number;
  customer_name: string;
  table_number: string;
  payment_method: string;
  total_amount: number;
  status: string;
}

export default function OwnerDashboard() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOmsetGlobal, setTotalOmsetGlobal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State Form Tambah Menu
  const [newMenu, setNewMenu] = useState({
    name: "",
    category: "Coffee",
    price: 0,
    stock: 20,
    image: "",
    description: "",
  });

  // State Form Edit Menu / Ganti Foto
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  const fetchOwnerData = async () => {
    try {
      const timestamp = new Date().getTime();

      const [resMenu, resOrder] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/menus?_t=${timestamp}`, {
          cache: "no-store",
        }),
        fetch(`http://127.0.0.1:8000/api/orders/all?_t=${timestamp}`, {
          cache: "no-store",
        }),
      ]);

      if (resMenu.ok && isMounted.current) {
        const dataMenu = await resMenu.json();
        setMenus(dataMenu || []);
      }

      if (resOrder.ok && isMounted.current) {
        const dataOrder = await resOrder.json();
        setOrders(dataOrder.orders || []);
        setTotalOmsetGlobal(dataOrder.total_omset_global || 0);
      }
    } catch (error) {
      console.error("Koneksi ke dapur terputus, mencoba lagi...");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    document.title = "CafeGo - Owner Dashboard";
    isMounted.current = true;
    fetchOwnerData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // FUNGSI UPDATE STOK KILAT
  const handleUpdateStock = async (menuId: string, newStock: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/menus/${menuId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        setMenus((prev) =>
          prev.map((m) => (m.id === menuId ? { ...m, stock: newStock } : m))
        );
      } else {
        alert("Gagal memperbarui stok.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // FUNGSI TAMBAH MENU BARU
  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.name.trim() || newMenu.price <= 0) {
      alert("Mohon isi Nama Menu dan Harga dengan benar!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMenu),
      });

      if (res.ok) {
        alert("Menu baru berhasil ditambahkan!");
        setShowAddMenuModal(false);
        setNewMenu({
          name: "",
          category: "Coffee",
          price: 0,
          stock: 20,
          image: "",
          description: "",
        });
        fetchOwnerData();
      } else {
        alert("Gagal menambahkan menu baru.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI UPDATE / EDIT MENU (TERMASUK GANTI FOTO)
  const handleEditMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/menus/${editingMenu.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMenu),
      });

      if (res.ok) {
        alert("Data menu & foto berhasil diperbarui!");
        setShowEditModal(false);
        setEditingMenu(null);
        fetchOwnerData();
      } else {
        alert("Gagal meng-update menu.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const totalStok = menus.reduce((sum, item) => sum + item.stock, 0);
  const menuMenipis = menus.filter((m) => m.stock <= 10).length;

  const pesananAktif = orders.filter((o) => o.status === "pending");
  const totalOmset = totalOmsetGlobal;
  const potensiOmset = pesananAktif.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              Dashboard Owner
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Sistem tersinkronisasi langsung dengan Database Utama (Real-Time).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
              Sistem Live
            </span>
          </div>
        </header>

        {/* KARTU ANALITIK (GRID 4 KOLOM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KARTU 1: OMSET */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Omset Bersih (Sukses)
            </p>
            <h2 className="text-3xl font-black text-emerald-600 mt-2">
              {formatRp(totalOmset)}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              + Potensi{" "}
              <span className="text-slate-800 font-bold">
                {formatRp(potensiOmset)}
              </span>{" "}
              dari {pesananAktif.length} antrean
            </p>
          </div>

          {/* KARTU 2: KETERSEDIAAN STOK */}
          <div
            onClick={() => setShowStockModal(true)}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer group hover:border-blue-200 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ketersediaan Stok
              </p>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                + Kelola
              </span>
            </div>
            <h2 className="text-3xl font-black text-blue-600 mt-2">
              {totalStok} Porsi
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Tersebar di{" "}
              <span className="text-slate-800 font-bold">{menus.length}</span>{" "}
              jenis menu
            </p>
          </div>

          {/* KARTU 3: STATUS DAPUR */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Dapur
            </p>
            <h2
              className={`text-3xl font-black mt-2 ${
                menuMenipis > 0 ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {menuMenipis > 0 ? `${menuMenipis} Menu Menipis` : "Stok Aman"}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              {menuMenipis > 0
                ? "Segera lakukan *restock* bahan baku"
                : "Semua menu di atas 10 porsi"}
            </p>
          </div>

          {/* KARTU 4: BUTTON TAMBAH MENU BARU */}
          <button
            onClick={() => setShowAddMenuModal(true)}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer group hover:border-blue-200 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
              +
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight mt-3">
                Tambah Menu Baru
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Buat racikan & varian menu baru
              </p>
            </div>
          </button>
        </div>

        {/* PANEL BAWAH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TABEL STOK MENU & MONITORING */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px]">
            <h2 className="text-xl font-black mb-6 text-slate-800 flex justify-between">
              Monitoring Menu
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                {menus.length} Item
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoading ? (
                <p className="text-center text-slate-400 mt-10 animate-pulse">
                  Menghubungkan ke database...
                </p>
              ) : (
                menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          menu.image ||
                          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop"
                        }
                        alt={menu.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{menu.name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          {menu.category} • {formatRp(menu.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                          menu.stock > 10
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700 animate-pulse shadow-sm"
                        }`}
                      >
                        {menu.stock} PORSI
                      </span>
                      {/* TOMBOL EDIT / GANTI FOTO */}
                      <button
                        onClick={() => {
                          setEditingMenu(menu);
                          setShowEditModal(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold text-slate-500 text-xs transition flex items-center justify-center"
                        title="Edit Menu & Foto"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TABEL PESANAN AKTIF */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px]">
            <h2 className="text-xl font-black mb-6 text-slate-800 flex justify-between">
              Antrean Berjalan
              <span className="text-xs font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full">
                {pesananAktif.length} Pending
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {isLoading ? (
                <p className="text-center text-slate-400 mt-10 animate-pulse">
                  Memuat antrean kasir...
                </p>
              ) : pesananAktif.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    ☕
                  </div>
                  <p className="font-medium text-slate-400">
                    Tidak ada antrean pesanan.
                  </p>
                </div>
              ) : (
                pesananAktif.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 border border-slate-100 rounded-2xl hover:border-blue-200 transition shadow-sm bg-slate-50/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-slate-800 text-xl">
                          {order.customer_name || "Tanpa Nama"}
                        </p>
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          Meja: {order.table_number || "-"}
                        </p>
                      </div>
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                        PROSES
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 border-dashed">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {order.payment_method}
                      </span>
                      <span className="font-black text-emerald-600 text-lg">
                        {formatRp(order.total_amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT MENU / GANTI FOTO */}
      {showEditModal && editingMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h3 className="text-xl font-black text-slate-800">
                Edit Menu & Foto
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMenuSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  value={editingMenu.name}
                  onChange={(e) =>
                    setEditingMenu({ ...editingMenu, name: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Kategori
                  </label>
                  <select
                    value={editingMenu.category}
                    onChange={(e) =>
                      setEditingMenu({ ...editingMenu, category: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Non Coffee">Non Coffee</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Food">Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingMenu.price}
                    onChange={(e) =>
                      setEditingMenu({
                        ...editingMenu,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  URL Foto Menu Baru
                </label>
                <input
                  type="text"
                  value={editingMenu.image || ""}
                  onChange={(e) =>
                    setEditingMenu({ ...editingMenu, image: e.target.value })
                  }
                  placeholder="Paste URL foto Unsplash di sini..."
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {editingMenu.image && (
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <img
                    src={editingMenu.image}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <p className="text-xs font-semibold text-slate-500">
                    Preview foto menu saat ini
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition shadow-lg text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA STOK MENU */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Kelola Stok Menu
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Tambah atau sesuaikan ketersediaan porsi per menu
                </p>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {menu.name}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">
                      {menu.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateStock(menu.id, Math.max(0, menu.stock - 5))
                      }
                      className="w-8 h-8 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100 shadow-sm text-xs"
                    >
                      -5
                    </button>
                    <span className="w-12 text-center font-black text-slate-800 text-sm">
                      {menu.stock}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(menu.id, menu.stock + 10)}
                      className="w-8 h-8 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm text-xs"
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStockModal(false)}
              className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MENU BARU */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <h3 className="text-xl font-black text-slate-800">
                Tambah Menu Baru
              </h3>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMenuSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  value={newMenu.name}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, name: e.target.value })
                  }
                  placeholder="Misal: Matcha Latte"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Kategori
                  </label>
                  <select
                    value={newMenu.category}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, category: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Non Coffee">Non Coffee</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Food">Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={newMenu.price || ""}
                    onChange={(e) =>
                      setNewMenu({
                        ...newMenu,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="25000"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    required
                    value={newMenu.stock || ""}
                    onChange={(e) =>
                      setNewMenu({
                        ...newMenu,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="20"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    URL Gambar (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newMenu.image}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition shadow-lg text-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}