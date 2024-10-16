'use client';

declare global {
    interface Window {
        API_TOKEN: string,
    }
}

export async function logEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
        const screenSize = {
            width: window.innerWidth || null,
            height: window.innerHeight || null,
        };

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language || navigator.language?.[0] || 'unknown';

        const extendedEventData = {
            ...eventData,
            screenSize,
            userAgent: navigator.userAgent || null,
            referrer: document.referrer || null,
            timeZone,
            language,
        };

        const body = JSON.stringify({
            eventType,
            eventData: extendedEventData,
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