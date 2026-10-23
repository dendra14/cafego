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
  customer_name: string;
  table_number: string;
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
  
  // STATE PENGAMAN: Mencegah klik ganda pada tombol selesai
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STATE PENGAMAN BARU: Mencegah tumpukan request fetchOrders yang bikin lag
  const [isFetching, setIsFetching] = useState(false);

  const fetchOrders = async () => {
    if (isFetching) return; // Jika proses fetch sebelumnya belum selesai, abaikan dulu

    setIsFetching(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        // Deselect pesanan jika sudah tidak ada di antrean
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
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  // Polling data dari backend setiap 10 detik secara aman (tidak menumpuk)
  useEffect(() => {
    let isMounted = true;

    fetchOrders();

    const interval = setInterval(async () => {
      if (isMounted) {
       await fetchOrders();
      }
    }, 10000);

    return () => {
     isMounted = false;
      clearInterval(interval);
   };
 }, []);

  const handleSelesai = async (id: number) => {
    if (isSubmitting) return;

    if (!confirm("Konfirmasi: Pesanan sudah siap diserahkan ke pelanggan?"))
      return;

    try {
      setIsSubmitting(true);

      // Optimistic UI: Hilangkan langsung dari layar agar terasa instan
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${id}/selesai`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        fetchOrders(); // Rollback jika gagal
      }
    } catch (error) {
      fetchOrders(); // Rollback jika error jaringan
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto flex gap-6 h-[90vh]">
        {/* PANEL KIRI: Daftar Antrean */}
        <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Antrean Masuk</h1>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {orders.length} Aktif
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isLoading ? (
              <p className="text-center text-gray-400 mt-10">
                Menghubungkan ke dapur...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center mt-10 text-gray-400 font-medium">
                Belum ada pesanan
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
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-black text-gray-800 truncate w-32">
                        {order.customer_name || "Tanpa Nama"}
                      </h3>
                      <span className="text-xs font-bold text-gray-500">
                        Meja: {order.table_number || "-"}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {order.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200/60">
                    <span className="text-sm text-gray-500 font-medium">
                      {order.items?.length || 0} Item
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatRp(order.total_amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL KANAN: Detail Pesanan */}
        <div className="w-2/3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col relative overflow-hidden">
          {selectedOrder ? (
            <>
              <div className="border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-gray-800">
                      {selectedOrder.customer_name || "Tanpa Nama"}
                    </h2>
                    <div className="flex gap-3 mt-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                        Meja: {selectedOrder.table_number || "-"}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold">
                        Order #{selectedOrder.id}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Total Tagihan ({selectedOrder.payment_method})
                    </p>
                    <h2 className="text-3xl font-black text-orange-600">
                      {formatRp(selectedOrder.total_amount)}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Rincian Pesanan
                </h3>
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="bg-gray-200 text-gray-700 font-black w-10 h-10 rounded-lg flex items-center justify-center text-lg">
                        {item.quantity}x
                      </span>
                      <span className="text-xl font-bold text-gray-800">
                        {item.menu?.name || "Menu tidak diketahui"}
                      </span>
                    </div>
                    <span className="font-bold text-gray-600 text-lg">
                      {formatRp(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100">
                <button
                  onClick={() => handleSelesai(selectedOrder.id)}
                  disabled={isSubmitting}
                  className={`w-full text-xl font-black py-5 rounded-2xl shadow-lg transition-transform active:scale-95 ${
                    isSubmitting
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isSubmitting
                    ? "MEMPROSES..."
                    : `SELESAIKAN PESANAN (MEJA ${selectedOrder.table_number})`}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <svg
                className="w-24 h-24 mb-4 opacity-50"
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
              <h2 className="text-2xl font-bold text-gray-400">
                Pilih Pesanan
              </h2>
              <p className="mt-2 text-gray-400">
                Klik kartu antrean untuk melihat rincian.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}