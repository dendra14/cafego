import { useState, useEffect } from "react";

export default function CheckoutModal({ isOpen, onClose, cart, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState("");

  // State baru untuk melacak apakah pelanggan sudah scan dan bayar QRIS
  const [isPaid, setIsPaid] = useState(false);

  // Reset semua pilihan setiap kali modal ditutup atau dibuka
  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod("");
      setIsPaid(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRp = (num) => "Rp " + (num || 0).toLocaleString("id-ID");
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  // Fungsi saat memilih metode pembayaran (Reset status isPaid jika pindah metode)
  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    setIsPaid(false); // Selalu reset status bayar kalau ganti metode
  };

  const handleConfirm = () => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran terlebih dahulu!");
      return;
    }
    // Jika pilih QRIS tapi belum bayar (belum klik simulasi), blokir checkout
    if (paymentMethod === "qris" && !isPaid) {
      alert("Silakan scan QRIS dan selesaikan pembayaran terlebih dahulu.");
      return;
    }

    onConfirm(paymentMethod);
  };

  // Dinamika Tombol Checkout Utama
  let buttonText = "Selesaikan Pesanan";
  let isButtonDisabled = cart.length === 0 || !paymentMethod;
  let buttonClass =
    "bg-cafe-text hover:bg-cafe-accent text-white shadow-lg active:scale-95";

  // Ubah wujud tombol jika sedang menunggu pembayaran QRIS
  if (paymentMethod === "qris" && !isPaid) {
    buttonText = "Menunggu scan QRIS...";
    isButtonDisabled = true;
    buttonClass = "bg-gray-200 text-gray-500 cursor-not-allowed";
  } else if (paymentMethod === "qris" && isPaid) {
    buttonText = "Pembayaran Valid! Buat Pesanan";
    buttonClass =
      "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 active:scale-95";
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in-up"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] fade-in-up">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-cafe-bg">
          <h2 className="font-serif font-bold text-xl text-cafe-text">
            Detail Pembayaran
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition text-gray-700"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-6">
          {/* Ringkasan Pesanan */}
          <div>
            <h3 className="font-bold text-xs text-cafe-accent uppercase tracking-widest mb-3">
              Ringkasan Pesanan
            </h3>
            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium text-cafe-text">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-bold text-cafe-text">
                    {formatRp(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-500">Total Tagihan</span>
                <span className="font-bold text-xl text-cafe-text">
                  {formatRp(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Pemilihan Metode Pembayaran */}
          <div>
            <h3 className="font-bold text-xs text-cafe-accent uppercase tracking-widest mb-3">
              Pilih Metode
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMethodChange("kasir")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${
                  paymentMethod === "kasir"
                    ? "border-cafe-text bg-cafe-light/30 shadow-md transform scale-[1.02]"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <i
                  className={`ph ph-storefront text-3xl ${paymentMethod === "kasir" ? "text-cafe-text" : "text-gray-400"}`}
                ></i>
                <span
                  className={`font-bold text-sm ${paymentMethod === "kasir" ? "text-cafe-text" : "text-gray-500"}`}
                >
                  Bayar di Kasir
                </span>
              </button>

              <button
                onClick={() => handleMethodChange("qris")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${
                  paymentMethod === "qris"
                    ? "border-cafe-text bg-cafe-light/30 shadow-md transform scale-[1.02]"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <i
                  className={`ph ph-qr-code text-3xl ${paymentMethod === "qris" ? "text-cafe-text" : "text-gray-400"}`}
                ></i>
                <span
                  className={`font-bold text-sm ${paymentMethod === "qris" ? "text-cafe-text" : "text-gray-500"}`}
                >
                  Pakai QRIS
                </span>
              </button>
            </div>
          </div>

          {/* Area QRIS dengan Logika Verifikasi (Hanya muncul kalau QRIS dipilih) */}
          {paymentMethod === "qris" && (
            <div className="flex flex-col items-center justify-center p-5 bg-white shadow-inner rounded-2xl border border-gray-100 fade-in-up">
              {!isPaid ? (
                // Tampilan saat belum dibayar
                <>
                  <p className="text-xs font-bold text-gray-500 mb-3">
                    SCAN QRIS BERIKUT
                  </p>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    alt="QRIS"
                    className="w-36 h-36 rounded-xl mb-3 shadow-sm border border-gray-100"
                  />
                  <p className="text-[10px] text-gray-400 text-center font-medium mb-4">
                    Bisa pakai Gopay, OVO, Dana, atau M-Banking
                  </p>

                  {/* Tombol Simulasi - Nanti ini diganti dengan respons otomatis dari API Midtrans/Laravel */}
                  <button
                    onClick={() => setIsPaid(true)}
                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex justify-center items-center gap-2"
                  >
                    <i className="ph ph-magic-wand text-lg"></i> (Simulasi)
                    Pelanggan Selesai Bayar
                  </button>
                </>
              ) : (
                // Tampilan saat sukses dibayar
                <div className="flex flex-col items-center justify-center text-center py-6 fade-in-up">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <i className="ph-fill ph-check-circle text-4xl"></i>
                  </div>
                  <p className="font-bold text-lg text-cafe-text">
                    Pembayaran Diterima!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Saldo sudah masuk. Silakan lanjutkan pesanan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Konfirmasi Akhir (Dinamis) */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${buttonClass}`}
          >
            {paymentMethod === "qris" && isPaid ? (
              <i className="ph ph-rocket text-xl"></i>
            ) : (
              <i className="ph ph-check-circle text-xl"></i>
            )}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
