<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rute untuk Customer membuat pesanan
Route::post('/orders', [OrderController::class, 'store']);

// Rute untuk Kasir
Route::get('/orders', [OrderController::class, 'index']); // Kasir melihat antrean
Route::put('/orders/{id}/selesai', [OrderController::class, 'markAsDone']); // Kasir menandai selesai