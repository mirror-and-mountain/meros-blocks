@php
    $title = trim($attributes['column_title'] ?? '');
    $columnLinks = $attributes['column_links'] ?? [];
    $links = [];

    foreach (is_array($columnLinks) ? $columnLinks : [] as $link) {
        if (!is_array($link) || !is_string($link['url'] ?? null)) {
            continue;
        }

        $url = esc_url($link['url']);
        if ($url === '') {
            continue;
        }

        $label = is_string($link['label'] ?? null) ? trim($link['label']) : '';
        if ($label === '') {
            $postId = url_to_postid($link['url']);
            $linkedPost = $postId ? get_post($postId) : null;
            if ($linkedPost && is_post_publicly_viewable($linkedPost)) {
                $label = trim($linkedPost->post_title);
            }
        }

        $links[] = [
            'url' => $url,
            'label' => $label !== '' ? $label : $link['url'],
            'newTab' => ($link['new_tab'] ?? false) === true,
        ];
    }
@endphp

@if($block === null)
    @if($title !== '')
        <p class="meros-dynamic-mega-menu__column-title">{{ $title }}</p>
    @endif
    @if($links !== [])
        <ul class="meros-dynamic-mega-menu__links">
            @foreach($links as $link)
                <li><a>{{ $link['label'] }}</a></li>
            @endforeach
        </ul>
    @endif
@elseif($title !== '' || $links !== [] || trim($content) !== '')
    <div {!! get_block_wrapper_attributes(['class' => 'meros-dynamic-mega-menu__column']) !!}>
        @if($title !== '')
            <p class="meros-dynamic-mega-menu__column-title">{{ $title }}</p>
        @endif
        @if($links !== [])
            <ul class="meros-dynamic-mega-menu__links">
                @foreach($links as $link)
                    <li><a href="{!! $link['url'] !!}" @if($link['newTab']) target="_blank" rel="noopener" @endif>{{ $link['label'] }}</a></li>
                @endforeach
            </ul>
        @endif
        {!! $content !!}
    </div>
@endif
