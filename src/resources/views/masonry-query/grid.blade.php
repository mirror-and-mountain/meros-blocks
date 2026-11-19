@if($block !== null)
    <div {!! \MM\Meros\Blocks\Support\MasonryQuery::wrapper($attributes) !!}>
        {!! $content !!}
    </div>
@endif
