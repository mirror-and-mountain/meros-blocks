import { InnerBlocks } from '@wordpress/block-editor';


export default function save({ attributes }) {
    const { title } = attributes;

    return (
        <div className="meros-mega-menu-column">
            <div className="meros-mega-menu-column-title">
                <p>{title}</p>
            </div>
            <ul className="meros-mega-menu-column-content">
                <InnerBlocks.Content />
            </ul>
        </div>
    );
}