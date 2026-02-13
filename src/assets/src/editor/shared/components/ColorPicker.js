import { useSelect } from '@wordpress/data';
import {
    ColorPalette,
    Button,
    Dropdown,
    BaseControl,
    ColorIndicator
} from '@wordpress/components';

export function ColorPicker({ label, currentColor, onChange, margin = true }) {
    const themeColors = useSelect((select) =>
        select('core/block-editor').getSettings().colors || []
    , []);

    return (
        <div className="meros-color-picker" style={ { marginTop: margin ? '-10px' : '' } }>
            <Dropdown
                style={{ width: '100%' }}
                renderToggle={({ onToggle }) => (
                    <Button
                        onClick={onToggle}
                        variant="secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                        }}
                    >
                        <ColorIndicator colorValue={currentColor} />
                        {label}
                    </Button>
                )}
                renderContent={() => (
                    <div style={{ padding: '10px' }}>
                        <BaseControl label={label} __nextHasNoMarginBottom={true}>
                            <ColorPalette
                                colors={themeColors}
                                value={currentColor}
                                onChange={(color) => {
                                    onChange(color);
                                }}
                                disableCustomColors={false}
                                enableAlpha={true}
                                rgb
                            />
                        </BaseControl>
                    </div>
                )}
            />
        </div>
    );
}