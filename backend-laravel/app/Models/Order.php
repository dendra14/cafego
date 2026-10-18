<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// (Biasanya ada use HasFactory; di sini, tapi karena di punyamu tidak ada, kita sesuaikan saja)

class Order extends Model
{
    // Tambahkan properti $fillable ini di dalam class
    protected $fillable = [
        'payment_method',
        'total_amount',
        'status'
    ];
    // Memberitahu Laravel bahwa 1 Order punya banyak OrderItem
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}