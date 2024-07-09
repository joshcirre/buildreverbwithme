<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'home');

require __DIR__.'/auth.php';
