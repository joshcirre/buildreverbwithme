<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SwitchFlipped implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $toggleSwitch;

    public function __construct($toggleSwitch)
    {
        $this->toggleSwitch = $toggleSwitch;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('switch'),
        ];
    }

    public function broadcastWith(): array
    {
        return ['toggleSwitch' => $this->toggleSwitch];
    }
}
