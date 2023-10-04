export function isOneCharString (v: any) { return (typeof v == "string" && v.length === 1)};
export function isNotEmptyString (v: any) { return (typeof v == "string" && v.length > 0)};
export function isNotEmptyEmptyArray (v: any) { return (Array.isArray(v) && v.length > 0)};
export function contains<T>(
    haystack: Array<T>,
    needle: Array<T>,
): boolean {
    if (needle.length === 0) {
        return (true);
    }
    if (haystack.includes(needle[0])) {
        return (contains(haystack, needle.slice(1)));
    } else {
        return (false);
    }
}
