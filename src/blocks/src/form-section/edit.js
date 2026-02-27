import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
        className: 'meros-form-section'
    });
    
    return (
        <div {...blockProps}>
            <InnerBlocks 
                renderAppender={ InnerBlocks.DefaultBlockAppender }
            />
        </div>
    );
}