<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Gunakan Database Transaction agar aman dan cepat
            $result = DB::transaction(function () use ($request) {
                $order = Order::create([
                    'customer_name'  => $request->input('customer_name', 'Tanpa Nama'),
                    'table_number'   => $request->input('table_number', '-'),
                    'payment_method' => $request->input('payment_method', 'kasir'),
                    'total_amount'   => $request->input('total_amount', 0),
                    'status'         => 'pending',
                ]);

                $items = $request->input('items', []);
                if (!empty($items) && is_array($items)) {
                    $orderItemsData = [];

                    foreach ($items as $item) {
                        $menuId = $item['menu_id'] ?? $item['id'] ?? null;
                        if (!$menuId) continue;

                        $qty = (int)($item['quantity'] ?? 1);
                        $price = (float)($item['price'] ?? 0);

                        // Siapkan data untuk bulk insert
                        $orderItemsData[] = [
                            'order_id'   => $order->id,
                            'menu_id'    => $menuId,
                            'quantity'   => $qty,
                            'price'      => $price,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];

                        // Potong stok secara kilat dan aman (Atomic Decrement)
                        Menu::where('id', $menuId)->decrement('stock', $qty);
                    }

                    // Bulk Insert: Masukkan semua item sekaligus dalam 1 query kilat!
                    if (!empty($orderItemsData)) {
                        OrderItem::insert($orderItemsData);
                    }
                }

                return $order;
            });

            return response()->json(['message' => 'Pesanan berhasil!', 'order_id' => $result->id], 201);
        } catch (\Throwable $e) {
            Log::error('Gagal checkout: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membuat pesanan', 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        $orders = Order::with(['items.menu'])->where('status', 'pending')->orderBy('created_at', 'asc')->get();
        return response()->json($orders);
    }

    public function allOrders()
    {
        // 1. Hitung total omset bersih secara global dari SEMUA pesanan 'selesai'
        $totalOmsetSukses = Order::where('status', 'selesai')->sum('total_amount');
        
        // 2. Ambil data terbaru untuk tabel dashboard owner
        $orders = Order::with(['items.menu'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
            
        // 3. Kembalikan dalam bentuk object JSON yang lengkap
        return response()->json([
            'total_omset_global' => (float) $totalOmsetSukses,
            'orders' => $orders
        ]);
    }

    public function markAsDone($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
            
            $order->status = 'selesai';
            $order->save();
            return response()->json(['message' => 'Pesanan selesai!'], 200);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error backend', 'error' => $e->getMessage()], 500);
        }
    }
}