@php
    $label = trim($attributes['group_label'] ?? '') ?: __('Menu group', 'meros-blocks');
    $url = esc_url($attributes['group_link'] ?? '');
    $newTab = ($attributes['group_link_new_tab'] ?? false) === true;
    $hideChevron = ($attributes['group_hide_link_chevron'] ?? false) === true;
@endphp

@if($block === null)
    @if($url !== '' && !$hideChevron)
        <a class="meros-dynamic-mega-menu__trigger meros-dynamic-mega-menu__group-preview">{{ $label }}</a>
    @else
        <p class="meros-dynamic-mega-menu__trigger meros-dynamic-mega-menu__group-preview{{ $hideChevron ? ' meros-dynamic-mega-menu__trigger--no-chevron' : '' }}">{{ $label }}</p>
    @endif
@elseif(trim($content) !== '')
    <li {!! \MM\Meros\Blocks\Support\MegaMenuStyles::wrapper('meros-dynamic-mega-menu__group', $attributes) !!}>
        @if($url !== '' && !$hideChevron)
            <a class="meros-dynamic-mega-menu__group-link meros-dynamic-mega-menu__trigger" href="{!! $url !!}" @if($newTab) target="_blank" rel="noopener" @endif>{{ $label }}</a>
        @endif
        <details class="meros-dynamic-mega-menu__disclosure">
            <summary class="meros-dynamic-mega-menu__trigger{{ $hideChevron ? ' meros-dynamic-mega-menu__trigger--no-chevron' : '' }}" @if($url !== '' && !$hideChevron) aria-label="{{ sprintf(__('Toggle %s submenu', 'meros-blocks'), $label) }}" @endif>
                <span class="meros-dynamic-mega-menu__summary-label">{{ $label }}</span>
            </summary>
            <div class="meros-dynamic-mega-menu__slide">
                <div class="meros-dynamic-mega-menu__clip">
                    <div class="meros-dynamic-mega-menu__panel">
                        {{-- @if($url !== '')
                            <a class="meros-dynamic-mega-menu__overview{{ $hideChevron ? ' meros-dynamic-mega-menu__overview--always' : '' }}" href="{!! $url !!}" @if($newTab) target="_blank" rel="noopener" @endif>{{ sprintf(__('Visit %s', 'meros-blocks'), $label) }}</a>
                        @endif --}}
                        <div class="meros-dynamic-mega-menu__columns">
                            {!! $content !!}
                        </div>
                    </div>
                </div>
            </div>
        </details>
    </li>
@else
    <li {!! \MM\Meros\Blocks\Support\MegaMenuStyles::wrapper('meros-dynamic-mega-menu__group', $attributes) !!}>
        @if($url !== '')
            <a class="meros-dynamic-mega-menu__trigger" href="{!! $url !!}" @if($newTab) target="_blank" rel="noopener" @endif>{{ $label }}</a>
        @else
            <span class="meros-dynamic-mega-menu__trigger meros-dynamic-mega-menu__summary-label">{{ $label }}</span>
        @endif
    </li>
@endif
