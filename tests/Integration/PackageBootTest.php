<?php

namespace MM\Meros\Blocks\Tests\Integration;

use MM\Meros\Blocks\MerosBlocks;
use MM\Meros\Facades\Components\DynamicBlocks;
use MM\Meros\Testing\PackageTestCase;

/**
 * Verifies that the enabled Blocks package registers its blocks with WordPress.
 */
final class PackageBootTest extends PackageTestCase
{
    protected function packageClass(): string { return MerosBlocks::class; }
    protected function packageHandle(): string { return 'meros_blocks'; }

    public function test_enabled_package_registers_blocks_in_wordpress(): void
    {
        $package = $this->package();
        do_action('init');
        $blocks = DynamicBlocks::checkout($package)->all();
        $this->assertNotEmpty($blocks);
        foreach ($blocks as $block) {
            $this->assertBlockRegistered($block->getName());
        }
    }
}
