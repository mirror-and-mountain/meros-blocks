import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save({ attributes }) {
    return (
        <div 
            {...useBlockProps.save({ 
                className: 'meros-swiper-slide swiper-slide',
                style: { height: attributes.height }
            })}
        >
            <InnerBlocks.Content />
        </div>
    );
}