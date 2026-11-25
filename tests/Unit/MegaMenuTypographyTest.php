<?php

namespace MM\Meros\Blocks\Tests\Unit;

use MM\Meros\Blocks\Support\MegaMenuStyles;
use MM\Meros\Contracts\Features\Components\DynamicBlock;
use PHPUnit\Framework\TestCase;

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class MegaMenuTypographyTest extends TestCase {
    protected function setUp(): void {
        require_once dirname(__DIR__) . '/Support/BlockStyleDoubles.php';
    }

    private function wrapperStyles(array $attributes, string $part = 'menu'): array {
        return json_decode(MegaMenuStyles::wrapper('menu', $attributes, $part), true, flags: JSON_THROW_ON_ERROR);
    }

    public function testNativeTypographyIsNotOverridden(): void {
        MegaMenuStyles::register(new DynamicBlock());
        self::assertSame(['class' => 'menu'], $this->wrapperStyles([]));
        MegaMenuStyles::register(new DynamicBlock(), 'column');
        foreach (['menu', 'column'] as $part) {
            self::assertSame(['class' => 'menu'], $this->wrapperStyles([
                'menu_font_size_group' => 'large',
                'menu_font_size_column_heading' => 'custom:22px',
                'menu_font_size_panel_link' => 'small',
                'menu_font_size_link' => 'medium',
                'menu_decoration_column_heading' => 'underline',
            ], $part));
        }
    }

    public function testColumnStylesAcceptOnlySupportedDecorations(): void {
        $columnStyles = $this->wrapperStyles([
            'menu_decoration_panel_link' => 'none',
            'menu_decoration_panel_link_current' => 'underline',
            'menu_decoration_group' => 'line-through',
            'menu_color_panel_link' => 'red',
            'menu_color_panel_text' => 'blue',
        ], 'column');
        self::assertSame('--meros-menu-panel-link-decoration:none;--meros-menu-panel-link-current-decoration:underline;', $columnStyles['style'] ?? '');
        self::assertSame('--meros-menu-panel-link-decoration:underline;', $this->wrapperStyles(['menu_decoration_link' => 'underline'], 'column')['style'] ?? '');
        self::assertSame(['class' => 'menu'], $this->wrapperStyles(['menu_decoration_panel_link' => 'underline;color:red'], 'column'));
    }
}
