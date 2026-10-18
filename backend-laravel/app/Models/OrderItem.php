<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    // Tambahkan properti $fillable ini di dalam class
    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'price'
    ];
    // Memberitahu Laravel bahwa OrderItem ini merujuk ke tabel Menu
    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }    
}