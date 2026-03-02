import { useBlockProps, InnerBlocks, useInnerBlocksProps } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

export default function Edit({ attributes, setAttributes }) {
    const { post } = useSelect((select) => {
        const { getCurrentPost } = select("core/editor");
        return {
            post: getCurrentPost(),
        };
    });

    const { allowedBlocks } = attributes;

    const isFormCPT = post?.type === "meros_form";
    useEffect(() => {
        if (!attributes.style) {
            setAttributes({
                style: {
                    spacing: {
                        padding: {
                            top: '1.5rem',
                            right: '1.5rem',
                            bottom: '1.5rem',
                            left: '1.5rem',
                        },
                    },
                },
            });
        }
    }, []);

    useEffect(() => {
        if (isFormCPT) return;
        // Unlock in the editor.
        setAttributes({
            lock: {
                move: false,
                remove: false,
            }
        });

    }, []); // Run once on mount

    const blockProps = useBlockProps({
        className: 'meros-form-root-container'
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks,
        renderAppender: isFormCPT ? InnerBlocks.ButtonBlockAppender : false,
    });

    return (
        <>
            {!isFormCPT && (
                <div {...blockProps}>
                    <p>
                        The Form block can only be used within the Meros Form custom post type.
                    </p>
                </div>
            )}

            {isFormCPT && (
                <div {...innerBlocksProps} />
            )}
        </>
    );
}