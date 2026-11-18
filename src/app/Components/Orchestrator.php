<?php

namespace MM\Meros\Blocks\App\Components;

use MM\Meros\App\Components\Fields\Repeater;
use MM\Meros\App\Components\Fields\PostsLookup;

use MM\Meros\Blocks\Support\MegaMenuStyles;

use MM\Meros\Contracts\Orchestrators\ComponentsOrchestrator;
use MM\Meros\Contracts\Features\Components\DynamicBlock;

class Orchestrator extends ComponentsOrchestrator {

    protected function configure(): void {
        $this->configureDynamicMegaMenu();
    }

    /**
     * Configures the dynamic Mega Menu block.
     *
     * @return void
     */
    private function configureDynamicMegaMenu(): void {
        $views = $this->getHandle() . '::mega-menu';
        $megaMenu = $this->dynamicBlocks()->make(function (DynamicBlock $block) use ($views) {
            $block->name('mega-menu');
            $block->title(__('Mega Menu', 'meros-blocks'));
            $block->category('design');
            $block->icon('menu');

            $block->attribute('menu_name', [
                'type' => 'string',
                'default' => __('Primary navigation', 'meros-blocks'),
                'label' => __('Navigation label', 'meros-blocks'),
                'control' => true,
            ]);

            $block->attribute('menu_orientation', [
                'type' => 'string',
                'default' => 'horizontal',
                'label' => __('Group layout', 'meros-blocks'),
                'control' => [
                    'type' => 'select',
                    'options' => [
                        'horizontal' => __('Horizontal (header)', 'meros-blocks'),
                        'vertical' => __('Vertical (sidebar)', 'meros-blocks'),
                    ],
                ],
            ]);

            $block->attribute('menu_trigger', [
                'type' => 'string',
                'default' => 'click',
                'label' => __('Open groups on', 'meros-blocks'),
                'control' => [
                    'type' => 'select',
                    'options' => [
                        'click' => __('Click', 'meros-blocks'),
                        'hover' => __('Hover or click', 'meros-blocks'),
                    ],
                ],
            ]);

            $block->attribute('menu_animation_speed', [
                'type' => 'string',
                'default' => 'normal',
                'label' => __('Animation speed', 'meros-blocks'),
                'control' => [
                    'type' => 'select',
                    'options' => [
                        'fast' => __('Fast', 'meros-blocks'),
                        'normal' => __('Normal', 'meros-blocks'),
                        'slow' => __('Slow', 'meros-blocks'),
                        'off' => __('Off', 'meros-blocks'),
                    ],
                ],
            ]);

            MegaMenuStyles::colours($block, 'menu');
            MegaMenuStyles::fontSizes($block);
            MegaMenuStyles::textDecorations($block);
            $block->attribute('menu_mobile_collapse', [
                'type' => 'boolean',
                'default' => true,
                'label' => __('Collapse on mobile', 'meros-blocks'),
                'control' => true,
            ]);
            $block->attribute('menu_mobile_breakpoint', [
                'type' => 'string',
                'default' => '640',
                'label' => __('Collapse at or below (px)', 'meros-blocks'),
                'control' => true,
            ]);
            $block->attribute('menu_mobile_direction', [
                'type' => 'string',
                'default' => 'right',
                'label' => __('Mobile menu opens from', 'meros-blocks'),
                'control' => [
                    'type' => 'select',
                    'options' => [
                        'left' => __('Left', 'meros-blocks'),
                        'right' => __('Right', 'meros-blocks'),
                        'top' => __('Top', 'meros-blocks'),
                    ],
                ],
            ]);
            $block->attribute('menu_mobile_min_width', [
                'type' => 'string',
                'default' => '',
                'label' => __('Side drawer minimum width (px)', 'meros-blocks'),
                'control' => true,
            ]);
            $block->renderCallback(fn (array $args): string => view("{$views}.menu", $args)->render());
        });

        $megaMenuGroup = $this->dynamicBlocks()->make(function (DynamicBlock $block) use ($megaMenu, $views) {
            $block->name('mega-menu-group');
            $block->title(__('Mega Menu Group', 'meros-blocks'));
            $block->category('design');
            $block->icon('arrow-down-alt2');
            $block->parent([$megaMenu]);

            $block->attribute('group_label', [
                'type' => 'string',
                'default' => __('Menu group', 'meros-blocks'),
                'label' => __('Group label', 'meros-blocks'),
                'control' => true,
            ]);

            $block->attribute('group_link', [
                'type' => 'string',
                'default' => '',
                'label' => __('Group link', 'meros-blocks'),
                'control' => ['type' => 'url'],
            ]);

            $block->attribute('group_link_new_tab', [
                'type' => 'boolean',
                'default' => false,
                'label' => __('Open group link in a new tab', 'meros-blocks'),
                'control' => true,
            ]);

            $block->attribute('group_hide_link_chevron', [
                'type' => 'boolean',
                'default' => false,
                'label' => __('Hide group chevron (desktop only)', 'meros-blocks'),
                'control' => true,
            ]);

            MegaMenuStyles::colours($block, 'group');
            MegaMenuStyles::textDecorations($block);
            $block->renderCallback(fn (array $args): string => view("{$views}.group", $args)->render());
        });

        $megaMenuColumn = $this->dynamicBlocks()->make(function (DynamicBlock $block) use ($megaMenuGroup, $views) {
            $block->name('mega-menu-custom-column');
            $block->title(__('Mega Menu Column', 'meros-blocks'));
            $block->category('design');
            $block->icon('columns');
            $block->parent([$megaMenuGroup]);
            $block->allowedBlocks(['core/paragraph', 'core/image']);

            $block->attribute('column_title', [
                'type' => 'string',
                'default' => '',
                'label' => __('Column title', 'meros-blocks'),
                'control' => true,
            ]);

            $block->attribute('column_links', [
                'type' => 'array',
                'default' => [],
                'label' => __('Column links', 'meros-blocks'),
                'control' => true,
                'control_callback' => function (Repeater $repeater): void {
                    $repeater->allowReorder();

                    $repeater->field('posts_lookup', function (PostsLookup $field) {
                        $field->name('url');
                        $field->label(__('Select post', 'meros-blocks'));
                        $field->postType('any');
                        $field->key('url');
                        $field->allowAdd(true);
                    });
                    
                    $repeater->field('text', [
                        'name' => 'label',
                        'label' => __('Link label', 'meros-blocks'),
                    ]);

                    $repeater->field('checkbox', [
                        'name'   => 'new_tab',
                        'label'  => __('Open in a new tab', 'meros-blocks'),
                        'toggle' => true,
                    ]);
                },
            ]);

            MegaMenuStyles::colours($block, 'column');
            MegaMenuStyles::fontSizes($block);
            MegaMenuStyles::textDecorations($block);
            $block->renderCallback(fn (array $args): string => view("{$views}.column", $args)->render());
        });

        if ($megaMenu instanceof DynamicBlock && 
            $megaMenuGroup instanceof DynamicBlock && 
            $megaMenuColumn instanceof DynamicBlock
        ) {
            $megaMenu->variations([[
                'name' => 'starter',
                'title' => __('Mega Menu', 'meros-blocks'),
                'isDefault' => true,
                'scope' => ['inserter'],
                'innerBlocks' => [
                    [$megaMenuGroup->getName(), [], [[$megaMenuColumn->getName()]]],
                ],
            ]]);
            $megaMenuGroup->variations([[
                'name' => 'starter',
                'title' => __('Mega Menu Group', 'meros-blocks'),
                'isDefault' => true,
                'scope' => ['inserter'],
                'innerBlocks' => [[$megaMenuColumn->getName()]],
            ]]);
        }
    }

}