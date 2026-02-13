import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/block-editor';

export default function Edit({ attributes }) {

    const { title } = attributes;

    return (
        <div className="meros-mega-menu-column">
            <div className="meros-mega-menu-column-title">
                <p>{title}</p>
            </div>
            <InnerBlocks
                allowedBlocks={['core/navigation-link']}
            />
        </div>
    );
}