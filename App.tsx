import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ContentDisplay } from './components/ContentDisplay';
import { Footer } from './components/Footer';
import { NavigationMenu } from './components/NavigationMenu';
import { generateIslamicContent } from './services/geminiService';
import type { GeneratedContent, PostableContent, ActiveView, ScheduledPost } from './types';
import { PostGeneratorModal } from './components/PostGeneratorModal';
import { ScheduleModal } from './components/ScheduleModal';
import { CalendarView } from './components/CalendarView';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // State for Post Generator Modal
  const [selectedContent, setSelectedContent] = useState<PostableContent | null>(null);

  // State for Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [contentToSchedule, setContentToSchedule] = useState<PostableContent | null>(null);
  const [scheduleInitialDate, setScheduleInitialDate] = useState<Date | undefined>(undefined);
  const [postToEdit, setPostToEdit] = useState<ScheduledPost | null>(null);
  const [calendarUpdateKey, setCalendarUpdateKey] = useState(0); // Used to trigger calendar refresh

  const fetchContent = useCallback(async (currentView: ActiveView, searchTerm: string = '') => {
    setIsLoading(true);
    setError(null);
    
    const apiTopic = searchTerm || (currentView !== 'home' ? `a few popular and inspiring ${currentView}` : '');

    if (!apiTopic.trim()) {
      setError('Please enter a topic to search.');
      setIsLoading(false);
      return;
    }
    
    if(searchTerm) {
        setContent(null);
    }

    try {
      const result = await generateIslamicContent(apiTopic, currentView);
      setContent(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate content. Please check your API key and try again.');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchContent(activeView, topic);
  };

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    setIsMenuOpen(false);
    setTopic(''); 
    if (view !== 'home' && view !== 'calendar') {
      fetchContent(view);
    } else {
      setContent(null);
      setError(null);
    }
  };

  const handleOpenPostGenerator = (item: PostableContent) => {
    setSelectedContent(item);
  };

  const handleClosePostGenerator = () => {
    setSelectedContent(null);
  };
  
  const handleOpenScheduleModal = (item: PostableContent | null, date?: Date) => {
    setContentToSchedule(item);
    setScheduleInitialDate(date);
    setIsScheduleModalOpen(true);
  };

  const handleOpenScheduleModalForEdit = (post: ScheduledPost) => {
    setPostToEdit(post);
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = (didSave: boolean = false) => {
    setIsScheduleModalOpen(false);
    setContentToSchedule(null);
    setPostToEdit(null);
    setScheduleInitialDate(undefined);
    if (didSave) {
      setCalendarUpdateKey(prev => prev + 1); // Trigger refresh
    }
  };

  const renderMainContent = () => {
    if (activeView === 'calendar') {
      return <CalendarView key={calendarUpdateKey} onAddEvent={handleOpenScheduleModal} onEditEvent={handleOpenScheduleModalForEdit} />;
    }
    
    return (
      <div className="max-w-3xl mx-auto">
        <section id="search-section" className="mb-12">
           <h2 className="text-2xl font-bold text-center text-teal-700 dark:text-teal-400 mb-2">
              {activeView === 'home' 
                  ? 'Explore Islamic Teachings' 
                  : `Search for ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
               {activeView === 'home' 
                  ? 'Enter a topic like "Patience," "Charity," or "Family".' 
                  : `Enter a keyword to find specific ${activeView}.`}
            </p>
          <SearchBar
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onSubmit={handleSearch}
            isLoading={isLoading}
          />
        </section>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <section id="content-section">
          <ContentDisplay
            content={content}
            isLoading={isLoading}
            activeView={activeView}
            onGeneratePost={handleOpenPostGenerator}
            onSchedule={(item) => handleOpenScheduleModal(item)}
          />
        </section>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} onNavigate={handleNavigate} activeView={activeView} />
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} activeView={activeView} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </main>

      <Footer />

      {selectedContent && (
        <PostGeneratorModal content={selectedContent} onClose={handleClosePostGenerator} />
      )}
      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={handleCloseScheduleModal}
          contentToSchedule={contentToSchedule}
          initialDate={scheduleInitialDate}
          postToEdit={postToEdit}
        />
      )}
    </div>
  );
};

export default App;
