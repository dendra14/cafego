<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    // WAJIB DITAMBAHKAN: Memberi tahu Laravel bahwa ID berbentuk teks (UUID)
    protected $keyType = 'string';
    public $incrementing = false;
    //Mematikan update kolom created_at & updated_at
    public $timestamps = false;

    protected $fillable = ['id', 'name', 'category', 'price', 'stock', 'description', 'image'];
}