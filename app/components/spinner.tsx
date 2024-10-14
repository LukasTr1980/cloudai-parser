export default function Spinner({ className = '' }) {
    return (
        <div className="flex">
            <div
            className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 border-t-transparent ${className}`}
            role="status"
            aria-label="Loading"
            />
        </div>
    );
}