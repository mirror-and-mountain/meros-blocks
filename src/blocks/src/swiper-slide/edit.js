import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Edit({ attributes, setAttributes, context }) {
    const swiperHeight = context['meros-swiper/height'];
    const fixHeight = context['meros-swiper/fixHeight'];
    const height = fixHeight ? `${swiperHeight}px` : 'auto';

    setAttributes({ height: height });

    // Assign a default background color if none is set
    if (!attributes.backgroundColor || attributes.backgroundColor === '') {
        const defaultBackgrounds = [
            'light-green-cyan',
            'pale-cyan-blue',
            'pale-pink'
        ];

        const defaultBackgroundColor = defaultBackgrounds[
            Math.floor(Math.random() * defaultBackgrounds.length)
        ];

        setAttributes({ backgroundColor: defaultBackgroundColor });
    }

    return (
        <div
            {...useBlockProps({
                className: 'meros-swiper-slide swiper-slide',
                style: { height: height }
            })}
        >
            <InnerBlocks />
        </div>
    );
}
