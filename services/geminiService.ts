
import type { GeneratedContent, ActiveView } from '../types';

export const generateIslamicContent = async (topic: string, view: ActiveView): Promise<GeneratedContent> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, view }),
    });

    const responseData = await response.json();

    if (!response.ok) {
        // Use the error message from the API response if available, otherwise provide a generic one.
        const errorMessage = responseData.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }

    return responseData as GeneratedContent;
};
