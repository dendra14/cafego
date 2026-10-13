export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onCheckout,
}) {
  const formatRp = (num) => "Rp " + (num || 0).toLocaleString("id-ID");
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return (
    <>
      {/* 1. OVERLAY: Hanya menganimasikan opacity (sangat ringan) durasi 300ms */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 2. SIDEBAR: Menggunakan will-change-transform untuk memaksa GPU bekerja, durasi 300ms */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out will-change-transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Keranjang */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-cafe-bg">
          <h2 className="font-serif font-bold text-xl flex items-center gap-2 text-cafe-text">
            <i className="ph ph-shopping-cart-simple text-2xl"></i> Pesanan Anda
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Daftar Item (Tanpa animasi tambahan di dalam yang bisa membuat berat) */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <i className="ph ph-shopping-bag-open text-6xl mb-4 text-gray-300"></i>
              <p className="font-medium text-cafe-text">
                Keranjang masih kosong
              </p>
              <p className="text-sm">Yuk, pilih menu favoritmu!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm items-center"
              >
                <img
                  src={
                    item.image_url ||
                    item.image ||
                    "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=400&fit=crop"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h5 className="font-bold text-sm text-cafe-text line-clamp-1">
                    {item.name}
                  </h5>
                  <p className="text-cafe-accent text-sm font-semibold">
                    {formatRp(item.price)}
                  </p>
                </div>

                {/* Tombol Plus Minus */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-red-500 transition-colors"
                  >
                    <i className="ph ph-minus"></i>
                  </button>
                  <span className="font-bold text-sm w-4 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-cafe-text text-white shadow-sm hover:bg-cafe-accent transition-colors"
                  >
                    <i className="ph ph-plus"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bagian Checkout */}
        <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Pembayaran</span>
            <span className="text-2xl font-bold text-cafe-text">
              {formatRp(totalAmount)}
            </span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white transition-transform duration-200 shadow-lg flex justify-center items-center gap-2 ${
              cart.length > 0
                ? "bg-cafe-text hover:bg-cafe-accent hover:scale-[1.02] active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <span>Checkout Pesanan</span>
            <i className="ph ph-arrow-right font-bold"></i>
          </button>
        </div>
      </div>
    </>
  );
}
