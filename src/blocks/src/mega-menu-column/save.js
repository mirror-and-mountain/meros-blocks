import { InnerBlocks } from '@wordpress/block-editor';


export default function save({ attributes }) {
    const { title, customHTML, grow } = attributes;

    const styles = {
        flexGrow: grow ? 1 : 'initial'
    };

    return (
        <div className="meros-mega-menu-column" style={styles}>
            <div className="meros-mega-menu-column-title">
                <p>{title}</p>
            </div>
            <ul className="meros-mega-menu-column-content">
                <InnerBlocks.Content />
                {customHTML && (
                    <div 
                        className="meros-mega-menu-column-custom-content"
                        dangerouslySetInnerHTML={{ __html: customHTML }}
                    />
                )}
            </ul>
        </div>
    );
}