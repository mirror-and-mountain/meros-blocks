import { useBlockProps } from "@wordpress/block-editor";
import { FormField } from "./components/FieldTypes";
import { FieldTypeControls } from "./components/FieldTypeControls";

export default function Edit({ attributes, setAttributes, clientId }) {

    const blockProps = useBlockProps({
        className: "meros-form-field-editor",
    });

    return (
        <>
            <FieldTypeControls
                attributes={attributes}
                setAttributes={setAttributes}
            />

            <div { ...blockProps }>
                <FormField.Edit
                    attributes={attributes}
                    setAttributes={setAttributes}
                    clientId={clientId}
                />
            </div>
        </>
    );
}