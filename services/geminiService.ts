
import type { GeneratedContent, ActiveView } from '../types';
import { getIslamicContentFromDatabase } from './supabaseService';

export const generateIslamicContent = async (topic: string, view: ActiveView, useDatabase: boolean = true): Promise<GeneratedContent> => {
    // First try to get content from database
    if (useDatabase) {
        try {
            const databaseContent = await getIslamicContentFromDatabase(topic, view);
            
            // Check if we got meaningful content from database
            const hasContent = (databaseContent.quran && databaseContent.quran.length > 0) ||
                             (databaseContent.hadith && databaseContent.hadith.length > 0) ||
                             (databaseContent.stories && databaseContent.stories.length > 0);
            
            if (hasContent) {
                return databaseContent;
            }
        } catch (error) {
            console.warn("Failed to fetch from database, falling back to API:", error);
        }
    }

    // Fallback to Gemini API if database doesn't have content or useDatabase is false
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
