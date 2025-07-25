

import { createClient } from '@supabase/supabase-js';
import type { UserUpload, UserUploadInsert, UserUploadUpdate, ScheduledPost, ScheduledPostInsert, ScheduledPostUpdate, Json, PostableContent, QuranVerseType, HadithType, StoryType, GeneratedContent, ActiveView } from '../types';

// Manually define the database schema to provide type safety for the Supabase client.
export type Database = {
  public: {
    Tables: {
      quran_verses: {
        Row: {
          id: string;
          verse_arabic: string;
          verse_english: string;
          verse_urdu: string;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          verse_arabic: string;
          verse_english: string;
          verse_urdu: string;
          tags?: string[] | null;
        };
        Update: {
          verse_arabic?: string;
          verse_english?: string;
          verse_urdu?: string;
          tags?: string[] | null;
        };
        Relationships: [];
      };
      hadith: {
        Row: {
          id: string;
          text_english: string;
          text_urdu: string;
          narrator: string;
          source: string;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          text_english: string;
          text_urdu: string;
          narrator: string;
          source: string;
          tags?: string[] | null;
        };
        Update: {
          text_english?: string;
          text_urdu?: string;
          narrator?: string;
          source?: string;
          tags?: string[] | null;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          title: string;
          story: string;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          title: string;
          story: string;
          tags?: string[] | null;
        };
        Update: {
          title?: string;
          story?: string;
          tags?: string[] | null;
        };
        Relationships: [];
      };
      uploads: {
        Row: UserUpload;
        Insert: UserUploadInsert;
        Update: UserUploadUpdate;
        Relationships: [];
      };
      scheduled_posts: {
        Row: ScheduledPost;
        Insert: ScheduledPostInsert;
        Update: ScheduledPostUpdate;
        Relationships: [];
      }
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

const supabaseUrl = 'https://oliltjdegsuvlmblpvlp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saWx0amRlZ3N1dmxtYmxwdmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDA3NzQsImV4cCI6MjA2ODIxNjc3NH0.mgpLmJ1hDg0g3iI4Uue_TnYiKmNkN5u1bZBIpw9IQTE';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not set. Please check your configuration.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'uploads';

// Islamic Content Management
export const getQuranVerses = async (searchTerm?: string, limit: number = 5): Promise<QuranVerseType[]> => {
    let query = supabase
        .from('quran_verses')
        .select('verse_arabic, verse_english, verse_urdu');

    if (searchTerm && searchTerm.trim()) {
        // Search in multiple fields and tags
        query = query.or(`verse_english.ilike.%${searchTerm}%,verse_urdu.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching Quran verses:", error.message, error);
        throw error;
    }
    return data || [];
};

export const getHadith = async (searchTerm?: string, limit: number = 3): Promise<HadithType[]> => {
    let query = supabase
        .from('hadith')
        .select('text_english, text_urdu, narrator, source');

    if (searchTerm && searchTerm.trim()) {
        // Search in multiple fields and tags
        query = query.or(`text_english.ilike.%${searchTerm}%,text_urdu.ilike.%${searchTerm}%,narrator.ilike.%${searchTerm}%,source.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching Hadith:", error.message, error);
        throw error;
    }
    return data || [];
};

export const getStories = async (searchTerm?: string, limit: number = 3): Promise<StoryType[]> => {
    let query = supabase
        .from('stories')
        .select('title, story');

    if (searchTerm && searchTerm.trim()) {
        // Search in multiple fields and tags
        query = query.or(`title.ilike.%${searchTerm}%,story.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching Stories:", error.message, error);
        throw error;
    }
    return data || [];
};

export const getIslamicContentFromDatabase = async (searchTerm: string, view: ActiveView): Promise<GeneratedContent> => {
    const content: GeneratedContent = {};

    try {
        if (view === 'home' || view === 'quran') {
            content.quran = await getQuranVerses(searchTerm, view === 'quran' ? 5 : 3);
        }
        if (view === 'home' || view === 'hadith') {
            content.hadith = await getHadith(searchTerm, 3);
        }
        if (view === 'stories') {
            content.stories = await getStories(searchTerm, 3);
        }
    } catch (error) {
        console.error("Error fetching Islamic content from database:", error);
        throw error;
    }

    return content;
};

// User Uploads Management
export const getAllUploads = async (): Promise<UserUpload[]> => {
    const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching uploads:", error.message, error);
        throw error;
    }
    return data || [];
};

export const uploadFiles = async (files: File[]): Promise<UserUpload[]> => {
    const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error("Error uploading file:", uploadError.message, uploadError);
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            throw new Error("Could not get public URL for uploaded file. Upload has been rolled back.");
        }

        const newUploadRecord: UserUploadInsert = {
            filename: file.name,
            mimetype: file.type,
            type: file.type.startsWith('image') ? 'image' : 'video',
            public_url: publicUrlData.publicUrl,
        };
        
        const { data: dbData, error: dbError } = await supabase
            .from('uploads')
            .insert([newUploadRecord])
            .select()
            .single();

        if (dbError) {
            console.error("Error inserting upload record:", dbError.message, dbError);
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            throw dbError;
        }

        if (!dbData) {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            throw new Error("Failed to create database record for upload. Upload has been rolled back.");
        }

        return dbData;
    });

    return Promise.all(uploadPromises);
};

export const deleteUpload = async (upload: UserUpload): Promise<void> => {
    const filePath = upload.public_url.split(`/${BUCKET_NAME}/`).pop();
    if (!filePath) {
        throw new Error("Could not determine file path from public URL.");
    }
    
    const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
    
    if (storageError) {
        console.warn("Could not delete from storage, proceeding to delete from database:", storageError.message);
    }
    
    const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .match({ id: upload.id });

    if (dbError) {
        console.error("Error deleting from database:", dbError.message, dbError);
        throw dbError;
    }
};

// Scheduled Posts Management
export const getScheduledPosts = async (startDate: string, endDate: string): Promise<ScheduledPost[]> => {
    const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .gte('scheduled_at', startDate)
        .lte('scheduled_at', endDate)
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error("Error fetching scheduled posts:", error.message, error);
        throw error;
    }
    return (data as ScheduledPost[]) || [];
};

export const addScheduledPost = async (post: ScheduledPostInsert): Promise<ScheduledPost> => {
    const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([post])
        .select()
        .single();
    
    if (error) {
        console.error("Error adding scheduled post:", error.message, error);
        throw error;
    }
    return data as ScheduledPost;
};

export const updateScheduledPost = async (id: string, post: ScheduledPostUpdate): Promise<ScheduledPost> => {
    const { data, error } = await supabase
        .from('scheduled_posts')
        .update(post)
        .match({ id })
        .select()
        .single();
    
    if (error) {
        console.error("Error updating scheduled post:", error.message, error);
        throw error;
    }
    return data as ScheduledPost;
};

export const deleteScheduledPost = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .match({ id });

    if (error) {
        console.error("Error deleting scheduled post:", error.message, error);
        throw error;
    }
};