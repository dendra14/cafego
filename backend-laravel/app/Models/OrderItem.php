<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;
    
    // WAJIB ADA: Mengizinkan quantity untuk disimpan massal, jika tidak, Laravel akan memaksa jumlahnya jadi 1.
    protected $fillable = ['order_id', 'menu_id', 'quantity', 'price'];

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}