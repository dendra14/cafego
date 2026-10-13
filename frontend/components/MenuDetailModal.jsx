export default function MenuDetailModal({ item, isOpen, onClose, onAdd }) {
  // Jika panel tidak sedang dibuka atau tidak ada item yang dipilih, sembunyikan komponen ini
  if (!isOpen || !item) return null;

  const formatRp = (num) => "Rp " + (num || 0).toLocaleString("id-ID");
  const imageUrl =
    item.image_url ||
    item.image ||
    "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=400&fit=crop";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      {/* Latar Belakang Gelap (Backdrop) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity fade-in-up"
        onClick={onClose}
      ></div>

      {/* Kotak Konten Modal */}
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 fade-in-up flex flex-col">
        {/* Tombol Silang (Tutup) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors z-20"
        >
          <i className="ph ph-x text-xl font-bold"></i>
        </button>

        {/* Gambar Penuh */}
        <div className="w-full h-64 sm:h-72 relative bg-gray-100">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Detail Teks */}
        <div className="p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-cafe-accent uppercase tracking-widest mb-1">
              {item.category}
            </p>
            <h3 className="font-serif text-3xl font-bold text-cafe-text leading-tight">
              {item.name}
            </h3>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            {item.description ||
              "Perpaduan sempurna antara bahan-bahan berkualitas untuk menemani hari santaimu di CafeGo."}
          </p>

          {/* Area Harga dan Tombol Beli */}
          <div className="mt-4 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium">Harga</p>
              <p className="text-2xl font-bold text-cafe-text">
                {formatRp(item.price)}
              </p>
            </div>

            <button
              onClick={() => {
                onAdd(item);
                onClose(); // Otomatis menutup panel setelah ditambah ke keranjang
              }}
              disabled={item.is_available === false}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg flex items-center gap-2 ${
                item.is_available !== false
                  ? "bg-cafe-text hover:bg-cafe-accent hover:-translate-y-1 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <i className="ph ph-shopping-cart-simple text-xl font-bold"></i>
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
