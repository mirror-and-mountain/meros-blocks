import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function Save({ attributes }) {    
    const blockProps = useBlockProps.save({
        className: 'meros-form-root-container'
    });
    
    return (
        <div {...blockProps} >
            <InnerBlocks.Content />
        </div>
    );
}