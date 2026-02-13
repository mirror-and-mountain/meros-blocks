import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/block-editor';
import { 
    InspectorControls,
    ToolsPanel,
    ToolsPanelItem,
    TextControl
} from '../../../assets/src/editor/shared/components/Controls';

export default function Edit({ attributes, setAttributes }) {

    const { title } = attributes;

    const resetTitle = () => {
        setAttributes({ title: 'Column Title' });
    };

    return (
        <>
            <InspectorControls>
                <ToolsPanel label={__('Settings', 'meros')} resetAll={resetTitle}>
                    <ToolsPanelItem 
                        label={__('Column Title', 'meros')}
                        isShownByDefault={true}
                        hasValue={() => title !== 'Column Title'}
                        onDeselect={() => setAttributes({ title: 'Column Title' })}
                    >
                        <TextControl
                            label={__('Column Title', 'meros')}
                            value={title}
                            onChange={(value) => {
                                setAttributes({ title: value });
                            }}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>

            <div className="meros-mega-menu-column">
                <div className="meros-mega-menu-column-title">
                    <p>{title}</p>
                </div>
                <div className="meros-mega-menu-column-content">
                    <InnerBlocks
                        allowedBlocks={['core/navigation-link']}
                    />
                </div>
            </div>
        </>
    );
}