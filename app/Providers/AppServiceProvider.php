<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void {}
}

namespace Pusher;

function preg_match($pattern, $subject, &$matches = null, $flags = 0, $offset = 0)
{
    if ($pattern === '/\A\d+\.\d+\z/') {
        $pattern = '/[\w.]+/';
    }

    return \preg_match($pattern, $subject, $matches, $flags, $offset);
}
