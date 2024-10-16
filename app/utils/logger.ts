'use client';

declare global {
    interface Window {
        API_TOKEN: string,
    }
}

export async function logEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
        const body = JSON.stringify({
            eventType,
            eventData,
        });

        await fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Token': window.API_TOKEN,
            },
            body,
            credentials: 'include',
        });
    } catch (error) {
        console.error('Failed to send log:', error);
    }
}