import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function Edit({ attributes, setAttributes, clientId }) {
    const blockProps = useBlockProps({
        className: 'meros-form-row'
    });
    
    return (
        <div {...blockProps}>
            <InnerBlocks 
                orientation="horizontal"
                renderAppender={ InnerBlocks.DefaultBlockAppender }
            />
        </div>
    );
}