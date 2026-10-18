<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    // 1. Beritahu Laravel bahwa ID kita adalah UUID (teks/string), bukan angka
    protected $keyType = 'string';
    
    // 2. Beritahu Laravel agar tidak mencoba menambah ID secara otomatis (karena Supabase yang mengaturnya)
    public $incrementing = false;
}