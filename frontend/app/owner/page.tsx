"use client";
import { useEffect, useState, useRef } from "react";

interface Menu {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
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
  const [isLoading, setIsLoading] = useState(true);

  // Ref untuk memastikan state tidak update jika komponen sudah ditutup
  const isMounted = useRef(true);

  const fetchOwnerData = async () => {
    try {
      // TRIK PAMUNGKAS: Memaksa bypass semua cache dengan Timestamp URL
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
        setMenus(dataMenu);
      }

      if (resOrder.ok && isMounted.current) {
        const dataOrder = await resOrder.json();
        setOrders(dataOrder);
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
    isMounted.current = true;

    // Tarik data pertama kali halaman dibuka
    fetchOwnerData();

    // Lakukan polling tarik data secara agresif setiap 2.5 detik
    const interval = setInterval(() => {
      fetchOwnerData();
    }, 2500);

    // Bersihkan interval saat pindah halaman agar tidak bocor memori
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const totalStok = menus.reduce((sum, item) => sum + item.stock, 0);
  const menuMenipis = menus.filter((m) => m.stock <= 10).length;

  const pesananAktif = orders.filter((o) => o.status === "pending");
  const pesananSelesai = orders.filter((o) => o.status === "selesai");

  const totalOmset = pesananSelesai.reduce(
    (sum, order) => sum + order.total_amount,
    0,
  );
  const potensiOmset = pesananAktif.reduce(
    (sum, order) => sum + order.total_amount,
    0,
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

        {/* KARTU ANALITIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ketersediaan Stok
            </p>
            <h2 className="text-3xl font-black text-blue-600 mt-2">
              {totalStok} Porsi
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Tersebar di{" "}
              <span className="text-slate-800 font-bold">{menus.length}</span>{" "}
              jenis menu
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Dapur
            </p>
            <h2
              className={`text-3xl font-black mt-2 ${menuMenipis > 0 ? "text-red-500" : "text-emerald-500"}`}
            >
              {menuMenipis > 0 ? `${menuMenipis} Menu Menipis` : "Stok Aman"}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              {menuMenipis > 0
                ? "Segera lakukan *restock* bahan baku"
                : "Semua menu di atas 10 porsi"}
            </p>
          </div>
        </div>

        {/* PANEL BAWAH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TABEL STOK MENU */}
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
                    <div>
                      <p className="font-bold text-slate-700">{menu.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                        {menu.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${menu.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 animate-pulse shadow-sm"}`}
                      >
                        {menu.stock} PORSI
                      </span>
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
    </div>
  );
}
