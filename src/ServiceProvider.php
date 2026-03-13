<?php 

namespace MM\Meros\Blocks;

use MM\Meros\App\Providers\PackageServiceProvider;

class ServiceProvider extends PackageServiceProvider {
    protected string $serviceClass = MerosBlocks::class;
}