<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Validasi data yang masuk dari frontend
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'total_amount' => 'required|numeric',
            'items' => 'required|array',
            'items.*.menu_id' => 'required|uuid', // Harus UUID karena tabel menu pakai UUID
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
        ]);

        try {
            // Gunakan transaksi agar jika gagal di tengah jalan, data tidak setengah-setengah masuk
            DB::beginTransaction();

            // 1. Simpan ke tabel orders
            $order = Order::create([
                'payment_method' => $validated['payment_method'],
                'total_amount' => $validated['total_amount'],
                'status' => 'pending',
            ]);

            // 2. Simpan detail tiap item ke tabel order_items
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat!',
                'order_id' => $order->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Gagal memproses pesanan: ' . $e->getMessage()], 500);
        }
    }

    // ... (fungsi store yang sudah ada sebelumnya) ...

    // 1. Fungsi untuk Kasir melihat daftar antrean
    public function index()
    {
        // Tarik pesanan pending BESERTA detail item dan info menunya
        $orders = Order::with(['items.menu'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($orders);
    }

    // 2. Fungsi untuk Kasir menyelesaikan pesanan
    public function markAsDone($id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $order->status = 'selesai';
        $order->save();

        return response()->json(['message' => 'Pesanan berhasil diselesaikan!']);
    }
}