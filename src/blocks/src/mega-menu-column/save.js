import { InnerBlocks } from '@wordpress/block-editor';


export default function save() {
    return (
        <div className="meros-mega-menu-column">
            <InnerBlocks.Content />
        </div>
    );
}