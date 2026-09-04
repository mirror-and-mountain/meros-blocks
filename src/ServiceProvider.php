<?php 

namespace MM\Meros\Blocks;

use MM\Meros\App\Providers\PackageServiceProvider;

class ServiceProvider extends PackageServiceProvider {
    protected function init(): void {
        $this->setPackageClass(MerosBlocks::class);
    }
}