import { useBlockProps, InnerBlocks, useInnerBlocksProps } from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";

export default function Edit({ attributes, setAttributes, clientId }) {
    const { allowedBlocks } = attributes;

    const blockProps = useBlockProps({
        className: 'meros-form-row'
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks,
        orientation: "horizontal",
        renderAppender: InnerBlocks.DefaultBlockAppender
    });

    useEffect(() => {
        if (!attributes.style) {
            setAttributes({
                style: {
                    spacing: {
                        padding: {
                            top: '0.67rem',
                            right: '0.67rem',
                            bottom: '0.67rem',
                            left: '0.67rem',
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