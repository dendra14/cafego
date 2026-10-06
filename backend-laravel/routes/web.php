<?php

use Illuminate\Support\Facades\DB;

Route::get('/api/menus', function () {
    try {
        // Mengambil seluruh data dari tabel menus di Supabase
        $menus = DB::table('menus')->get();
        return response()->json($menus);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});