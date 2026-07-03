import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/block-editor';
import { 
    InspectorControls,
    ToolsPanel,
    ToolsPanelItem,
    TextControl,
    ToggleControl,
    HTMLEditorModal
} from '../../../assets/wordpress/src/components/Controls.js';

export default function Edit({ attributes, setAttributes }) {

    const { title, customHTML, grow } = attributes;

    const resetAttrs = () => {
        setAttributes({ title: 'Column Title', customHTML: '', grow: false });
    };

    const styles = {
        flexGrow: grow ? 1 : 'initial'
    };

    return (
        <>
            <InspectorControls>
                <ToolsPanel label={__('Settings', 'meros')} resetAll={resetAttrs}>
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

                    <ToolsPanelItem
                        label={__('Grow', 'meros')}
                        isShownByDefault={true}
                        hasValue={() => grow !== false}
                        onDeselect={() => setAttributes({ grow: false })}
                    >
                        <ToggleControl
                            label={__('Grow', 'meros')}
                            checked={grow}
                            onChange={(value) => {
                                setAttributes({ grow: value });
                            }}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Custom HTML', 'meros')}
                        isShownByDefault={true}
                        hasValue={() => customHTML !== ''}
                        onDeselect={() => setAttributes({ customHTML: '' })}
                    >
                        <HTMLEditorModal
                            label={__('Custom HTML', 'meros')}
                            value={customHTML}
                            onChange={(value) => {
                                setAttributes({ customHTML: value });
                            }}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>

            <div className="meros-mega-menu-column" style={styles}>
                <div className="meros-mega-menu-column-title">
                    <p>{title}</p>
                </div>
                <div className="meros-mega-menu-column-content">
                    <>
                        <InnerBlocks
                            allowedBlocks={['core/navigation-link']}
                        />

                        {customHTML && (
                            <div 
                                className="meros-mega-menu-column-custom-content"
                                dangerouslySetInnerHTML={{ __html: customHTML }}
                            />
                        )}
                    </>
                </div>
            </div>
        </>
    );
}