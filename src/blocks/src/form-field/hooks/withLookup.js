import { useEffect } from "@wordpress/element";
import { useSelect } from "@wordpress/data";

export function withLookup(attributes, fieldRef, options, setOptions) {
    const { lookupQuery } = attributes;
    const {
        postType,
        fields,
        taxonomies,
        metaQuery,
        search,
        perPage,
    } = lookupQuery;

    const { queryResults, queryResolved } = useSelect((select) => {
        const { getEntityRecords, hasFinishedResolution } = select('core');
        const query = {};
        return {
            queryResults: getEntityRecords('postType', postType, query) || [],
            queryResolved: hasFinishedResolution('getEntityRecords', ['postType', postType, query]),
        };
    }, [postType, fields, taxonomies, metaQuery, search, perPage]);

    useEffect(() => {
        if (!fieldRef.current) return;
        if (!queryResolved) return;

        if (!Array.isArray(queryResults) || queryResults.length === 0) return;

        setOptions(queryResults.map(result => ({
            value: result.id,
            label: result.title.rendered || `ID ${result.id}`
        })));

    }, [queryResults, queryResolved]);

    return options;
}