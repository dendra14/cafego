<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Mendaftarkan kolom yang diizinkan untuk diisi secara otomatis (Mass Assignment)
    protected $fillable = [
        'customer_name',
        'table_number',
        'payment_method',
        'total_amount',
        'status',
    ];

    // Relasi ke tabel order_items (Satu pesanan memiliki banyak rincian item)
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}