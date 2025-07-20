

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type ActiveView = 'home' | 'quran' | 'hadith' | 'stories' | 'calendar';

export interface QuranVerseType {
  verse_arabic: string;
  verse_english: string;
  verse_urdu: string;
  reference: string;
}

export interface HadithType {
  text_english: string;
  text_urdu: string;
  narrator: string;
  source: string;
}

export interface StoryType {
  title: string;
  story: string;
}

export type PostableContent = QuranVerseType | HadithType | StoryType;

export interface ScheduledPost {
  id: string; // Supabase uses UUIDs
  scheduled_at: string; // ISO 8601 string
  title: string;
  content: Json | null;
  content_type: 'quran' | 'hadith' | 'story' | 'custom';
  created_at: string;
}

export interface ScheduledPostInsert {
  scheduled_at: string;
  title: string;
  content: Json | null;
  content_type: 'quran' | 'hadith' | 'story' | 'custom';
}

export interface ScheduledPostUpdate {
  scheduled_at?: string;
  title?: string;
  content?: Json;
  content_type?: 'quran' | 'hadith' | 'story' | 'custom';
}


export interface GeneratedContent {
  quran?: QuranVerseType[];
  hadith?: HadithType[];
  stories?: StoryType[];
}

export interface UserUpload {
  id: string; // Supabase uses UUIDs
  filename: string;
  public_url: string;
  mimetype: string;
  type: 'image' | 'video';
  created_at: string;
}

export interface UserUploadInsert {
  filename: string;
  public_url: string;
  mimetype: string;
  type: 'image' | 'video';
}

export interface UserUploadUpdate {
  filename?: string;
  public_url?: string;
  mimetype?: string;
  type?: 'image' | 'video';
}
