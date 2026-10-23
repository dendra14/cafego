<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(Menu::all());
    }

   // 1. Tambah Menu Baru
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'     => 'required|string',
                'category' => 'required|string',
                'price'    => 'required|numeric',
                'stock'    => 'required|integer',
            ]);

            $imageUrl = $request->input('image');
            if (empty($imageUrl)) {
                $imageUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=400&fit=crop';
            }

            $menu = new Menu();
            // Coba hapus baris UUID di bawah ini jika ID di database kamu berupa angka (integer auto-increment)
            $menu->id = (string) \Illuminate\Support\Str::uuid(); 
            $menu->name = $request->input('name');
            $menu->category = $request->input('category');
            $menu->price = $request->input('price');
            $menu->stock = $request->input('stock');
            $menu->image = $imageUrl;
            $menu->description = $request->input('description', 'Sajian premium kami.');
            $menu->save();

            return response()->json(['message' => 'Menu berhasil ditambahkan!', 'menu' => $menu], 201);

        } catch (\Exception $e) {
            // Ini akan mengembalikan pesan error asli ke browser/frontend
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    // 2. Update Stok Menu
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock' => 'required|integer',
        ]);

        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $menu->stock = $request->stock;
        $menu->save();

        return response()->json(['message' => 'Stok berhasil diperbarui!', 'menu' => $menu]);
    }

    // Update data menu lengkap (Termasuk Ganti Foto)
    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $request->validate([
            'name'     => 'sometimes|required|string',
            'category' => 'sometimes|required|string',
            'price'    => 'sometimes|required|numeric',
            'stock'    => 'sometimes|required|integer',
            'image'    => 'nullable|string',
        ]);

        if ($request->has('name')) $menu->name = $request->input('name');
        if ($request->has('category')) $menu->category = $request->input('category');
        if ($request->has('price')) $menu->price = $request->input('price');
        if ($request->has('stock')) $menu->stock = $request->input('stock');
        
        if ($request->has('image')) {
            $imageUrl = $request->input('image');
            if (!empty($imageUrl)) {
                $menu->image = $imageUrl;
            }
        }

        $menu->save();

        return response()->json(['message' => 'Menu berhasil diperbarui!', 'menu' => $menu]);
    }
}