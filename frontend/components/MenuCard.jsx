export default function MenuCard({ item, onClick, onAdd, index = 0 }) {
  const formatRp = (num) => "Rp " + (num || 0).toLocaleString("id-ID");
  const imageUrl =
    item.image_url ||
    item.image ||
    "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=400&fit=crop";

  return (
    <div
      onClick={() => onClick(item)}
      // Tambahan animasi melayang (hover:-translate-y-2) dan bayangan halus
      className="fade-in-up bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out relative group flex flex-col h-full border border-gray-50 cursor-pointer hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }} // Efek muncul bergantian (stagger)
    >
      {item.badge && (
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-cafe-text text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm z-10 transition-transform duration-300 group-hover:scale-105">
          {item.badge}
        </span>
      )}

      <div className="w-full h-48 rounded-[1.5rem] overflow-hidden mb-4 relative bg-gray-100 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          // Efek gambar membesar (zoom) perlahan saat disentuh
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/5"></div>
      </div>

      <div className="flex flex-col flex-grow px-2">
        <p className="text-[10px] font-bold text-cafe-accent uppercase tracking-widest mb-1 transition-colors duration-300 group-hover:text-cafe-text">
          {item.category}
        </p>
        <h4 className="font-serif font-bold text-xl mb-3 leading-tight">
          {item.name}
        </h4>

        <div className="mt-auto flex justify-between items-end pt-2">
          <span className="font-bold text-lg text-cafe-text">
            {formatRp(item.price)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item);
            }}
            disabled={item.is_available === false}
            // Animasi tombol saat ditekan (active:scale-95)
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              item.is_available !== false
                ? "bg-cafe-bg text-cafe-text border border-cafe-light hover:bg-cafe-text hover:text-white hover:scale-110 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            <i className="ph ph-plus text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
