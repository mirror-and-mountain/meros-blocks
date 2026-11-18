@php
    $label = trim($attributes['menu_name'] ?? '') ?: __('Primary navigation', 'meros-blocks');
    $vertical = ($attributes['menu_orientation'] ?? 'horizontal') === 'vertical';
    $class = 'meros-dynamic-mega-menu' . ($vertical ? ' meros-dynamic-mega-menu--vertical' : '');
    $trigger = ($attributes['menu_trigger'] ?? 'click') === 'hover' ? 'hover' : 'click';
    $mobile = ($attributes['menu_mobile_collapse'] ?? true) === true;
    $pixels = static function ($value, $default, $min) {
        return is_string($value) && ctype_digit(trim($value))
            ? max($min, min(9999, (int) $value))
            : $default;
    };
    $breakpoint = $pixels($attributes['menu_mobile_breakpoint'] ?? '', 640, 1);
    $minimum = $pixels($attributes['menu_mobile_min_width'] ?? '', 0, 0);
    $direction = $attributes['menu_mobile_direction'] ?? 'right';
    if (!in_array($direction, ['left', 'right', 'top'], true)) {
        $direction = 'right';
    }
@endphp

@if($block !== null && trim($content) !== '')
    <nav {!! \MM\Meros\Blocks\Support\MegaMenuStyles::wrapper($class, $attributes) !!} aria-label="{{ $label }}" data-meros-menu-trigger="{{ $trigger }}" @if($mobile) data-meros-menu-breakpoint="{{ $breakpoint }}" @endif>
        @if($mobile)
            @php($dialogId = wp_unique_id('meros-mobile-menu-'))
            <button type="button" class="meros-dynamic-mega-menu__mobile-toggle" aria-label="{{ sprintf(__('Open %s', 'meros-blocks'), $label) }}" aria-controls="{{ $dialogId }}" aria-expanded="false" aria-haspopup="dialog">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
        @endif
        <ul class="meros-dynamic-mega-menu__groups">
            {!! $content !!}
        </ul>
        @if($mobile)
            <dialog id="{{ $dialogId }}" class="meros-dynamic-mega-menu__drawer" aria-label="{{ $label }}" data-direction="{{ $direction }}" style="--meros-menu-mobile-min-width:{{ $minimum }}px">
                <div class="meros-dynamic-mega-menu__drawer-body">
                    <div class="meros-dynamic-mega-menu__drawer-bar">
                        <button type="button" class="meros-dynamic-mega-menu__mobile-back" aria-label="{{ __('Back to menu groups', 'meros-blocks') }}" hidden>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg>
                        </button>
                        <button type="button" class="meros-dynamic-mega-menu__mobile-close" aria-label="{{ __('Close menu', 'meros-blocks') }}" autofocus>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M6 18 18 6"/></svg>
                        </button>
                    </div>
                </div>
            </dialog>
        @endif
    </nav>
@endif
