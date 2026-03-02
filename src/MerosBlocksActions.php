<?php

namespace MM\Meros\Blocks;

use MM\Meros\Helpers\Theme\Actions;

class MerosBlocksActions extends Actions {
    public function register(): void {
        
    }

    public function createFormPostType(): void {
        $labels = [
            'name'              => 'Forms',
            'singular_name'     => 'Form',
            'menu_name'         => 'Forms',
            'name_admin_bar'    => 'Form',
            'add_new'           => 'Add New',
            'add_new_item'      => 'Add New Form',
            'new_item'          => 'New Form',
            'edit_item'         => 'Edit Form',
            'view_item'         => 'View Form',
            'all_items'         => 'All Forms',
            'search_items'      => 'Search Forms',
            'parent_item_colon' => 'Parent Forms:',
            'not_found'         => 'No forms found.',
            'not_found_in_trash' => 'No forms found in Trash.',
        ];

        register_post_type('meros_form', [
            'labels' => $labels,
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-feedback',
            'supports' => ['title', 'editor'],
            'template' => [
                ['meros/form', [], [
                    ['meros/form-section', [], [
                        ['meros/form-row', [], [
                            ['meros/form-field', [
                                'type'  => 'text',
                                'label' => 'First Name',
                                'name'  => 'first_name',
                                'required' => true,
                            ], []],
                            ['meros/form-field', [
                                'type'  => 'text',
                                'label' => 'Last Name',
                                'name'  => 'last_name',
                                'required' => true,
                            ], []]
                        ]],
                        ['meros/form-row', [], [
                            ['meros/form-field', [
                                'type'  => 'email',
                                'label' => 'Email',
                                'name'  => 'email',
                                'required' => true,
                            ], []]
                        ]],
                        ['meros/form-row', [], [
                            ['meros/form-field', [
                                'type'  => 'textarea',
                                'label' => 'Message',
                                'name'  => 'message',
                                'rows'  => 10,
                                'required' => true,
                            ], []]
                        ]]
                    ]]
                ]]
            ],
        ]);
    }
}