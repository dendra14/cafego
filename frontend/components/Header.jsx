"use client";

export default function Header({ cartCount = 0, onSearch, onCartClick }) {
  return (
    <header className="sticky top-0 z-40 bg-cafe-bg/90 backdrop-blur-md px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Logo & Judul */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-cafe-text text-cafe-bg rounded-xl flex items-center justify-center shrink-0">
          <i className="ph ph-coffee text-2xl"></i>
        </div>
        <h1 className="font-serif font-bold text-2xl tracking-tight hidden sm:block">
          CafeGo
        </h1>
      </div>

      {/* Fitur Pencarian & Keranjang */}
      <div className="flex gap-3 items-center">
        {/* Search Bar */}
        <div className="relative group">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cafe-text transition-colors"></i>
          <input
            type="text"
            placeholder="Cari menu..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-40 sm:w-56 md:w-64 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:border-cafe-accent focus:ring-1 focus:ring-cafe-accent text-sm transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Cart Button */}
        <button
          onClick={onCartClick}
          className="w-10 h-10 shrink-0 rounded-full bg-cafe-text shadow-sm flex items-center justify-center text-white relative hover:bg-opacity-90 transition transform hover:scale-105"
        >
          <i className="ph ph-shopping-bag text-xl"></i>

          {/* Badge Angka Keranjang (Hanya muncul jika cartCount > 0) */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
