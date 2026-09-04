<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Orchestrators\AssetsOrchestrator;

class Orchestrator extends AssetsOrchestrator {

    protected function configure(): void {
        $this->assets()->group(FX::class)->make()->enqueue();
        $this->assets()->group(Navigation::class)->make()->enqueue();
    }
}