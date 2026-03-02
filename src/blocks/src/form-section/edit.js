import { useBlockProps, InnerBlocks, useInnerBlocksProps } from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";

export default function Edit({ attributes, setAttributes }) {
    const { allowedBlocks } = attributes;

    const blockProps = useBlockProps({
        className: 'meros-form-section'
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks,
        renderAppender: InnerBlocks.ButtonBlockAppender
    });

    useEffect(() => {
        if (!attributes.style) {
            setAttributes({
                style: {
                    spacing: {
                        padding: {
                            top: '1rem',
                            right: '1rem',
                            bottom: '1rem',
                            left: '1rem',
                        },
                    },
                },
            });
        }
    }, []);

    return (
        <div {...innerBlocksProps} />
    );
}