<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MouseMoved implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;

    public $position;

    public $color;

    /**
     * Create a new event instance.
     */
    public function __construct($payload)
    {
        $this->userId = $payload['userId'];
        $this->position = $payload['position'];
        $this->color = $payload['color'];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('mouse-movement'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'position' => $this->position,
            'color' => $this->color,
        ];
    }
}
