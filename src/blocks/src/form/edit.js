import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

export default function Edit({ attributes, setAttributes }) {
    const { post } = useSelect((select) => {
        const { getCurrentPost } = select("core/editor");
        return {
            post: getCurrentPost(),
        };
    });

    const isFormCPT = post?.type === "meros_form";

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
                <div {...blockProps}>
                    <InnerBlocks
                        renderAppender={InnerBlocks.DefaultBlockAppender}
                    />
                </div>
            )}
        </>
    );
}