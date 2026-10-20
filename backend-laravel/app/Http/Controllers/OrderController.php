<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            $order = Order::create([
                'customer_name'  => $request->input('customer_name', 'Tanpa Nama'),
                'table_number'   => $request->input('table_number', '-'),
                'payment_method' => $request->input('payment_method', 'kasir'),
                'total_amount'   => $request->input('total_amount', 0),
                'status'         => 'pending',
            ]);

            $items = $request->input('items', []);
            if (!empty($items) && is_array($items)) {
                foreach ($items as $item) {
                    $menuId = $item['menu_id'] ?? $item['id'] ?? null;
                    if (!$menuId) continue;

                    $qty = (int)($item['quantity'] ?? 1);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_id'  => $menuId,
                        'quantity' => $qty,
                        'price'    => (float)($item['price'] ?? 0),
                    ]);

                    // POTONG STOK
                    $menu = Menu::find($menuId);
                    if ($menu) {
                        $currentStock = is_null($menu->stock) ? 50 : (int)$menu->stock;
                        $menu->stock = max(0, $currentStock - $qty);
                        $menu->save();
                    }
                }
            }
            return response()->json(['message' => 'Pesanan berhasil!', 'order_id' => $order->id], 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal membuat pesanan', 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        // Khusus Kasir: HANYA yang pending
        $orders = Order::with(['items.menu'])->where('status', 'pending')->orderBy('created_at', 'asc')->get();
        return response()->json($orders);
    }

    public function allOrders()
    {
        // Khusus Owner: SEMUA pesanan (Pending & Selesai) untuk Omset
        $orders = Order::with(['items.menu'])->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
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