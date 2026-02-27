import { FormField } from "./components/FieldTypes";

export default function Edit({ attributes, setAttributes, clientId }) {    
    return (
        <FormField.Edit
            attributes={attributes}
            setAttributes={setAttributes}
            clientId={clientId}
        />
    );
}