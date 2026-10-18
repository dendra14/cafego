"use client";
import { useEffect, useState } from "react";

interface Menu {
  id: string;
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  menu: Menu;
}

interface Order {
  id: number;
  payment_method: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function KasirPOS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        // Jika order yang sedang dipilih ternyata sudah tidak ada di antrean, kosongkan layar kanan
        if (
          selectedOrder &&
          !data.find((o: Order) => o.id === selectedOrder.id)
        ) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error("Gagal menarik data antrean:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  const handleSelesai = async (id: number) => {
    // Validasi anti-salah pencet
    if (!confirm("Konfirmasi: Kopi sudah dibuat dan siap diserahkan?")) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${id}/selesai`,
        {
          method: "PUT",
        },
      );
      if (response.ok) {
        setSelectedOrder(null); // Tutup struk di kanan
        fetchOrders(); // Segarkan antrean di kiri
      }
    } catch (error) {
      alert("Gagal memperbarui status pesanan.");
    }
  };

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto flex gap-6 h-[90vh]">
        {/* PANEL KIRI: Daftar Antrean (1/3 Layar) */}
        <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-white z-10 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Antrean</h1>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {orders.length} Aktif
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? (
              <p className="text-center text-gray-400 mt-10">
                Memuat antrean...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-gray-400 font-medium">Kosong</p>
                <p className="text-xs text-gray-400">Dapur sedang santai</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedOrder?.id === order.id
                      ? "border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-gray-500">
                        ORDER #{order.id}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {formatRp(order.total_amount)}
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {order.payment_method}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 font-medium">
                    {order.items?.length || 0} macam minuman
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL KANAN: Struk Digital & Aksi (2/3 Layar) */}
        <div className="w-2/3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col relative overflow-hidden">
          {selectedOrder ? (
            <>
              {/* Header Struk */}
              <div className="border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Order #{selectedOrder.id}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Metode:{" "}
                      <span className="uppercase font-bold">
                        {selectedOrder.payment_method}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">
                      Total Tagihan
                    </p>
                    <h2 className="text-3xl font-black text-orange-600">
                      {formatRp(selectedOrder.total_amount)}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Rincian Minuman */}
              <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Rincian Pesanan
                </h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 rounded-lg flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {item.menu ? item.menu.name : "Menu tidak diketahui"}
                        </span>
                      </div>
                      <span className="font-bold text-gray-600">
                        {formatRp(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">
                    Detail minuman tidak ditemukan.
                  </p>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="pt-6 mt-4 border-t border-gray-100">
                <button
                  onClick={() => handleSelesai(selectedOrder.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-black py-5 rounded-2xl shadow-lg transition-transform active:scale-95"
                >
                  SELESAIKAN PESANAN
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <svg
                className="w-24 h-24 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <h2 className="text-2xl font-bold">Pilih Pesanan</h2>
              <p className="mt-2 text-gray-400">
                Klik salah satu kartu di antrean sebelah kiri untuk melihat
                rincian.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
