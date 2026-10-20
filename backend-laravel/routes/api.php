<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MenuController; // Sesuaikan jika controllermu bernama lain

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rute untuk Customer membuat pesanan
Route::post('/orders', [OrderController::class, 'store']);

// Rute untuk Kasir
Route::get('/orders', [OrderController::class, 'index']); // Kasir melihat antrean
Route::put('/orders/{id}/selesai', [OrderController::class, 'markAsDone']); // Kasir menandai selesai

// Ambil daftar menu (Asumsi sudah ada dan berfungsi)
Route::get('/menus', [MenuController::class, 'index']);

// 3 Rute WAJIB untuk fitur pemesanan CafeGo
Route::post('/orders', [OrderController::class, 'store']); // Untuk Customer membuat pesanan
Route::get('/orders', [OrderController::class, 'index']);  // Untuk Kasir/Owner melihat pesanan
Route::put('/orders/{id}/selesai', [OrderController::class, 'markAsDone']); // INI YANG BARU: Untuk Kasir menyelesaikan pesanan

Route::get('/orders/all', [OrderController::class, 'allOrders']);