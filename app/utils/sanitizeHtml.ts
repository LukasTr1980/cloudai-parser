import sanitizeHtml from 'sanitize-html';

export function sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string')  {
        return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
    } else if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item))
    } else if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj: { [key: string]: unknown } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = (obj as { [key: string]: unknown })[key];
                sanitizedObj[key] = sanitizeObject(value);
            }
        }
        return sanitizedObj;
    } else {
        return obj;
    }
}