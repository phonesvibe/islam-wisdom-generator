

import React from 'react';
import type { GeneratedContent, PostableContent, ActiveView } from '../types';
import { QuranVerseCard } from './QuranVerseCard';
import { HadithCard } from './HadithCard';
import { StoryCard } from './StoryCard';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface ContentDisplayProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  activeView: ActiveView;
  onGeneratePost: (item: PostableContent) => void;
  onSchedule: (item: PostableContent) => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
    </div>
);

const InitialState: React.FC<{ view: ActiveView }> = ({ view }) => {
    let title = "Your spiritual journey starts here";
    let message = "Discover profound wisdom from the Quran and Hadith by searching for a topic above.";

    if (view === 'quran') {
        title = "The Holy Qur'an";
        message = "Displaying curated verses from the Quran. Use the search bar above to find specific verses.";
    } else if (view === 'hadith') {
        title = "The Sunnah of the Prophet (ﷺ)";
        message = "Displaying curated sayings and traditions. Use the search bar above to find specific hadith.";
    } else if (view === 'stories') {
        title = "Stories of the Prophets & Companions";
        message = "Displaying inspirational stories. Use the search bar above to find specific stories.";
    }
    
    return (
        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <BookOpenIcon className="mx-auto h-16 w-16 text-teal-500 dark:text-teal-400" />
            <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
                {message}
            </p>
        </div>
    );
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, activeView, onGeneratePost, onSchedule }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const hasContent = content && (content.quran?.length || content.hadith?.length || content.stories?.length);

  if (!hasContent) {
    if (activeView !== 'home') {
       return <InitialState view={activeView} />;
    }
    return <p className="text-center text-gray-500 dark:text-gray-400">No content found. The AI may be busy, please try again shortly.</p>;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'quran':
        return content?.quran?.map((verse, index) => (
          <QuranVerseCard key={index} verse={verse} onGeneratePost={onGeneratePost} onSchedule={onSchedule} />
        ));
      case 'hadith':
        return content?.hadith?.map((hadith, index) => (
          <HadithCard key={index} hadith={hadith} onGeneratePost={onGeneratePost} onSchedule={onSchedule} />
        ));
      case 'stories':
        return content?.stories?.map((story, index) => (
          <StoryCard key={index} story={story} onGeneratePost={onGeneratePost} onSchedule={onSchedule} />
        ));
      case 'home':
        return (
          <>
            {content?.quran && content.quran.length > 0 && (
              <section className="mb-12">
                <h3 className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-6 border-b-2 border-teal-200 dark:border-teal-700 pb-2">
                  From the Holy Qur'an
                </h3>
                <div className="space-y-6">
                  {content.quran.map((verse, index) => (
                    <QuranVerseCard key={`quran-${index}`} verse={verse} onGeneratePost={onGeneratePost} onSchedule={onSchedule} />
                  ))}
                </div>
              </section>
            )}
            {content?.hadith && content.hadith.length > 0 && (
              <section>
                <h3 className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-6 border-b-2 border-teal-200 dark:border-teal-700 pb-2">
                  From the Sunnah
                </h3>
                <div className="space-y-6">
                  {content.hadith.map((hadith, index) => (
                    <HadithCard key={`hadith-${index}`} hadith={hadith} onGeneratePost={onGeneratePost} onSchedule={onSchedule} />
                  ))}
                </div>
              </section>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};