export default function Spinner() {
    return (
        <div className="flex left-2">
            <div
            className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 border-t-transparent"
            role="status"
            aria-label="Loading"
            />
        </div>
    );
}