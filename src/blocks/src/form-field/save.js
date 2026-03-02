import { useBlockProps } from "@wordpress/block-editor";
import { FormField } from './components/FieldTypes';

export default function Save({ attributes }) {
    const blockProps = useBlockProps.save({
        className: "meros-form-field",
    });

    return (
        <div { ...blockProps }>
            <FormField.Save
                attributes={attributes} 
            />
        </div>
    );
}