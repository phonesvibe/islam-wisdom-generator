

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { PostableContent, UserUpload, QuranVerseType, HadithType, StoryType } from '../types';
import { imageBackgrounds, videoBackgrounds } from '../lib/backgrounds';
import { getAllUploads, uploadFiles, deleteUpload } from '../services/supabaseService';
import { logoDataURL } from './assets/logo';
import { CloseIcon } from './icons/CloseIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ClearIcon } from './icons/ClearIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TiktokIcon } from './icons/TiktokIcon';

interface PostGeneratorModalProps {
  content: PostableContent;
  onClose: () => void;
}

type Tab = 'post' | 'reel';
type BackgroundSourceTab = 'library' | 'uploads';
type BackgroundType = 'image' | 'video' | null;

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

const isQuran = (content: PostableContent): content is QuranVerseType => 'verse_arabic' in content;
const isHadith = (content: PostableContent): content is HadithType => 'narrator' in content;
const isStory = (content: PostableContent): content is StoryType => 'story' in content;

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
    if (typeof error === 'string') return error;
    if (error instanceof Event && error.type === 'error') return `Asset could not be loaded. Please check the asset source and network connection.`;
    return "An unknown error occurred.";
};

export const PostGeneratorModal: React.FC<PostGeneratorModalProps> = ({ content, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('post');
  const [backgroundSourceTab, setBackgroundSourceTab] = useState<BackgroundSourceTab>('library');
  const [backgroundSource, setBackgroundSource] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [userUploads, setUserUploads] = useState<UserUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  
  const notificationTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    loadImage(logoDataURL)
      .then(img => {
        if (isMounted) setLogoImage(img);
      })
      .catch(err => {
        console.error("Failed to load logo asset:", getErrorMessage(err));
        showNotification("Could not load branding logo.", 4000);
      });
    return () => { isMounted = false; };
  }, []);

  const fetchUserUploads = useCallback(async () => {
    try {
        const data = await getAllUploads();
        setUserUploads(data);
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Failed to load user uploads:", message, error);
        showNotification(`Could not load media: ${message}`, 5000);
    }
  }, []);

  useEffect(() => {
    fetchUserUploads();
  }, [fetchUserUploads]);

  // This effect ensures the video background plays reliably when selected.
  useEffect(() => {
    if (backgroundType === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.play().catch(error => {
            console.warn("Video autoplay was prevented by the browser:", error);
        });
    }
  }, [backgroundType, backgroundSource]); // Re-run when the video source or type changes.


  const showNotification = (message: string, duration: number = 4000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(message);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const handleFormatTabChange = (tab: Tab) => {
      setActiveTab(tab);
      setBackgroundSource(null);
      setBackgroundType(null);
  }

  const handleBackgroundSelect = (source: string, type: BackgroundType) => {
      setBackgroundSource(source);
      setBackgroundType(type);
  };

  const clearBackground = () => {
      setBackgroundSource(null);
      setBackgroundType(null);
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    showNotification(`Uploading ${files.length} file(s)...`, 60000);

    try {
        const newUploads = await uploadFiles(Array.from(files));
        setUserUploads(prev => [...newUploads, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        showNotification(`Successfully added ${newUploads.length} item(s) to your uploads!`, 4000);
    } catch (error) {
        const message = getErrorMessage(error);
        console.error("Error processing files:", message, error);
        showNotification(`Upload failed: ${message}`, 5000);
    } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteUpload = async (uploadToDelete: UserUpload) => {
    if (!uploadToDelete) return;

    if (backgroundSource === uploadToDelete.public_url) {
        clearBackground();
    }
    
    setUserUploads(prev => prev.filter(upload => upload.id !== uploadToDelete.id));
    
    try {
        await deleteUpload(uploadToDelete);
        showNotification("Item removed from your uploads.", 3000);
    } catch (error) {
        const message = getErrorMessage(error);
        console.error('Failed to delete upload:', message, error);
        showNotification(`Failed to remove item: ${message}`, 4000);
        fetchUserUploads(); // Refetch to restore state if delete failed
    }
  };

  const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, currentY);
    return currentY - y + lineHeight;
  };

  const handleDownload = useCallback(async () => {
    const isVideo = backgroundType === 'video';
    const canvas = document.createElement('canvas');
    canvas.width = activeTab === 'post' ? 1080 : 1080;
    canvas.height = activeTab === 'post' ? 1080 : 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isVideo) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTextOnCanvas(ctx, canvas.width, canvas.height, true);
        downloadCanvas(canvas);
        return;
    }
    
    if (!backgroundSource) {
        showNotification("Please select a background to download.", 4000);
        return;
    }

    try {
        const bgImage = await loadImage(backgroundSource);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        drawTextOnCanvas(ctx, canvas.width, canvas.height, false);
        downloadCanvas(canvas);
    } catch (e) {
        const message = getErrorMessage(e);
        console.error("Error loading image for download:", message, e);
        showNotification(`Failed to load background: ${message}`, 5000);
    }

  }, [backgroundSource, backgroundType, content, activeTab, logoImage]);
  
  const drawTextOnCanvas = (
    ctx: CanvasRenderingContext2D, width: number, height: number, isTransparent: boolean = false
  ) => {
        if (!isTransparent) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(0, 0, width, height);
        }
        
        const padding = width * 0.08;
        
        const contentWidth = width - (padding * 2);
        const mainContentTop = padding * 1.5;
        const mainContentBottom = height - padding;
        const availableHeight = mainContentBottom - mainContentTop;

        const getTextBlockHeight = (text: string, font: string, maxWidth: number, lineHeight: number): number => {
            if (!text) return 0;
            const tempCtx = document.createElement('canvas').getContext('2d')!;
            tempCtx.font = font;
            let lineCount = 0;
            const words = text.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line + word + ' ';
                if (tempCtx.measureText(testLine).width > maxWidth && line.length > 0) {
                    lineCount++;
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            if (line.trim().length > 0) lineCount++;
            return lineCount * lineHeight;
        };
        
        const arabicText = isQuran(content) ? content.verse_arabic : '';
        const englishText = isStory(content) ? `"${content.story}"` : (isQuran(content) ? `"${content.verse_english}"` : `"${content.text_english}"`);
        const urduText = isHadith(content) ? content.text_urdu : (isQuran(content) ? content.verse_urdu : '');
        const referenceText = isStory(content) ? content.title : (isQuran(content) ? content.reference : content.source);

        const arabicFontSize = Math.round(width / 22);
        const englishFontSize = isStory(content) ? Math.round(width / 38) : Math.round(width / 34);
        const urduFontSize = Math.round(width / 30);
        const refFontSize = Math.round(width / 50);

        const arabicLineHeight = arabicFontSize * 1.5;
        const englishLineHeight = englishFontSize * 1.4;
        const urduLineHeight = urduFontSize * 1.4;
        const refLineHeight = refFontSize * 1.4;
        
        const spacing = englishFontSize * 1.5;

        const arabicBlockHeight = getTextBlockHeight(arabicText, `${arabicFontSize}px 'Noto Naskh Arabic', serif`, contentWidth, arabicLineHeight);
        const englishBlockHeight = getTextBlockHeight(englishText, `italic ${englishFontSize}px 'Lato', sans-serif`, contentWidth, englishLineHeight);
        const urduBlockHeight = getTextBlockHeight(urduText, `${urduFontSize}px 'Noto Naskh Arabic', serif`, contentWidth, urduLineHeight);
        const refBlockHeight = getTextBlockHeight(referenceText, `bold ${refFontSize}px 'Lato', sans-serif`, contentWidth, refLineHeight);

        const totalHeight = arabicBlockHeight + englishBlockHeight + urduBlockHeight + refBlockHeight + (spacing * 3);
        let currentY = mainContentTop + (availableHeight - totalHeight) / 2;

        ctx.textAlign = 'center';
        
        if (isStory(content)) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${refFontSize}px 'Lato', sans-serif`;
            currentY += wrapText(ctx, referenceText, width / 2, currentY, contentWidth, refLineHeight);
            currentY += spacing;
        }

        if (arabicText) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${arabicFontSize}px 'Noto Naskh Arabic', serif`;
            currentY += wrapText(ctx, arabicText, width / 2, currentY, contentWidth, arabicLineHeight);
            currentY += spacing;
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `italic ${englishFontSize}px 'Lato', sans-serif`;
        currentY += wrapText(ctx, englishText, width / 2, currentY, contentWidth, englishLineHeight);
        currentY += spacing;

        if (urduText) {
             ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
             ctx.font = `${urduFontSize}px 'Noto Naskh Arabic', serif`;
             currentY += wrapText(ctx, urduText, width / 2, currentY, contentWidth, urduLineHeight);
             currentY += spacing;
        }
        
        if(!isStory(content)) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = `${refFontSize}px 'Lato', sans-serif`;
            wrapText(ctx, referenceText, width / 2, currentY, contentWidth, refLineHeight);
        }

        if (logoImage) {
            const logoPadding = width * 0.05;
            const logoWidth = width * 0.20;
            const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
            const logoX = width - logoWidth - logoPadding;
            const logoY = logoPadding;
            ctx.globalAlpha = 0.9;
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            ctx.globalAlpha = 1.0;
        }
  };
  
  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const fileName = isStory(content) ? content.title : (isQuran(content) ? 'quran_verse' : content.source);
    const link = document.createElement('a');
    link.download = `islamic_wisdom_${fileName.replace(/[ :]/g, '_')}${backgroundType === 'video' ? '_overlay' : ''}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyText = useCallback(() => {
    const textToCopy = isStory(content)
      ? `${content.title}\n\n${content.story}`
      : (isQuran(content)
        ? `${content.verse_arabic}\n\n"${content.verse_english}"\n${content.verse_urdu}`
        : `"${content.text_english}"\n${content.text_urdu}\n- ${content.narrator}, ${content.source}`);
    navigator.clipboard.writeText(textToCopy).then(() => {
      showNotification("Content copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      showNotification("Failed to copy text.");
    });
  }, [content]);

  const handleShare = (platform: 'facebook' | 'instagram' | 'tiktok') => {
    if (!backgroundSource) {
      showNotification("Please select a background first.");
      return;
    }
    handleDownload();
    handleCopyText();
    showNotification("Content prepared! Now create your post.");

    let url: string;
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com/';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/';
        break;
      case 'tiktok':
        url = 'https://www.tiktok.com/';
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentBuiltInGallery = activeTab === 'post' ? imageBackgrounds : videoBackgrounds;
  const currentUserGallery = userUploads.filter(u => activeTab === 'post' ? u.type === 'image' : u.type === 'video');

  const getReferenceText = () => isStory(content) ? content.title : (isQuran(content) ? content.verse_english.substring(0, 50) + '...' : content.source);
  const getMainText = () => isStory(content) ? `"${content.story}"` : (isQuran(content) ? `"${content.verse_english}"` : `"${content.text_english}"`);
  const getArabicText = () => isQuran(content) ? content.verse_arabic : '';
  const getUrduText = () => isStory(content) ? '' : (isQuran(content) ? content.verse_urdu : content.text_urdu);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="post-generator-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="post-generator-title" className="text-xl font-bold text-gray-900 dark:text-white">Post Generator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close modal">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/3 lg:w-1/4 p-6 border-r-0 md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-700 flex flex-col space-y-6 overflow-y-auto">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">1. Select Format</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleFormatTabChange('post')} className={`flex items-center justify-center space-x-2 p-3 rounded-md transition-colors text-sm font-medium ${activeTab === 'post' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        <ImageIcon className="h-5 w-5"/>
                        <span>Image (1:1)</span>
                    </button>
                    <button onClick={() => handleFormatTabChange('reel')} className={`flex items-center justify-center space-x-2 p-3 rounded-md transition-colors text-sm font-medium ${activeTab === 'reel' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        <VideoIcon className="h-5 w-5"/>
                        <span>Reel/Story (9:16)</span>
                    </button>
                </div>
            </div>
            
            <div className="space-y-3 flex-grow flex flex-col">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">2. Choose Background</h3>
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                    <button onClick={() => setBackgroundSourceTab('library')} className={`px-4 py-2 text-sm font-medium ${backgroundSourceTab === 'library' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>Library</button>
                    <button onClick={() => setBackgroundSourceTab('uploads')} className={`px-4 py-2 text-sm font-medium ${backgroundSourceTab === 'uploads' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>My Uploads</button>
                </div>
                <div className="flex-grow overflow-y-auto pt-2 pr-1">
                    {backgroundSourceTab === 'library' && (
                        <div className="grid grid-cols-3 gap-2">
                            {currentBuiltInGallery.map(bg => (
                                <button key={bg.id} onClick={() => handleBackgroundSelect(bg.url, bg.type)} className={`relative aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 ring-offset-2 dark:ring-offset-gray-800 ${backgroundSource === bg.url ? 'ring-2 ring-teal-500' : ''}`}>
                                    <img src={bg.thumbnail} alt={`background ${bg.id}`} className="w-full h-full object-cover"/>
                                    {bg.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"><VideoIcon className="h-6 w-6 text-white"/></div>}
                                </button>
                            ))}
                        </div>
                    )}
                    {backgroundSourceTab === 'uploads' && (
                        <div className="space-y-3">
                             <button onClick={handleUploadClick} disabled={isProcessing} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <UploadIcon className="h-5 w-5"/>
                                <span>{isProcessing ? 'Uploading...' : 'Upload Files'}</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" multiple/>
                            <div className="grid grid-cols-3 gap-2">
                                {currentUserGallery.map(upload => {
                                    const url = upload.public_url;
                                    return (
                                        <div key={upload.id} className="relative group">
                                            <button onClick={() => handleBackgroundSelect(url, upload.type)} className={`w-full relative aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 ring-offset-2 dark:ring-offset-gray-800 ${backgroundSource === url ? 'ring-2 ring-teal-500' : ''}`}>
                                                {upload.type === 'image' ? (
                                                     <img src={url} alt={upload.filename} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                                        <VideoIcon className="h-8 w-8 text-white"/>
                                                    </div>
                                                )}
                                            </button>
                                            <button onClick={() => handleDeleteUpload(upload)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete item">
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                            {currentUserGallery.length === 0 && !isProcessing && (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-4">Your uploaded media will appear here.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">3. Export & Share</h3>
                 <button onClick={handleDownload} disabled={!backgroundSource} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <DownloadIcon className="h-5 w-5"/>
                    <span>{backgroundType === 'video' ? 'Download Text Overlay' : 'Download Image'}</span>
                </button>
                <button onClick={handleCopyText} className="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300">
                    Copy Content Text
                </button>
                <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => handleShare('facebook')} disabled={!backgroundSource} className="flex items-center justify-center space-x-2 p-2 rounded-md transition-colors text-sm font-medium bg-[#1877F2] text-white hover:bg-[#166eeb] disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <FacebookIcon className="h-5 w-5"/>
                        <span>Share</span>
                    </button>
                     <button onClick={() => handleShare('instagram')} disabled={!backgroundSource} className="flex items-center justify-center space-x-2 p-2 rounded-md transition-colors text-sm font-medium bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                        <InstagramIcon className="h-5 w-5"/>
                        <span>Share</span>
                    </button>
                     <button onClick={() => handleShare('tiktok')} disabled={!backgroundSource} className="flex items-center justify-center space-x-2 p-2 rounded-md transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <TiktokIcon className="h-5 w-5"/>
                        <span>Share</span>
                    </button>
                </div>
            </div>
          </div>

          <div className="flex-grow bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative">
             {notification && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300 animate-fade-in-down">
                    {notification}
                </div>
            )}
            <div
                id="preview-container"
                className={`bg-gray-300 dark:bg-gray-700 shadow-lg rounded-md overflow-hidden transition-all duration-300 relative
                    ${activeTab === 'post' ? 'w-full aspect-square max-w-[55vh] md:max-w-full' : 'w-auto h-full aspect-[9/16]'}
                    ${!backgroundSource ? 'flex items-center justify-center' : ''}`}
                >
                {!backgroundSource ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center p-4">
                        <ImageIcon className="h-16 w-16 mx-auto mb-4"/>
                        <p>Select a background to see a preview</p>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
                        {backgroundType === 'image' && (
                             <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundSource})` }}></div>
                        )}
                        {backgroundType === 'video' && (
                            <video ref={videoPreviewRef} src={backgroundSource} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover"></video>
                        )}

                        <div className="relative z-20 flex flex-col justify-center items-center h-full p-4 md:p-8 text-white text-center">
                            {isStory(content) && <h3 className={`font-lato font-bold break-words ${activeTab === 'post' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} text-gray-100 mb-4`} style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>{getReferenceText()}</h3>}
                            {getArabicText() && (
                                <p dir="rtl" className={`font-arabic break-words ${activeTab === 'post' ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl'}`} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                    {getArabicText()}
                                </p>
                            )}
                            <p className={`italic font-lato break-words ${getArabicText() ? (activeTab === 'post' ? 'text-xl md:text-2xl mt-6' : 'text-lg md:text-xl mt-4') : (activeTab === 'post' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl')} text-gray-200`} style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>
                                {getMainText()}
                            </p>
                            {getUrduText() && (
                                <p dir="rtl" className={`font-arabic break-words ${activeTab === 'post' ? 'text-xl md:text-2xl mt-4' : 'text-lg md:text-xl mt-3'} text-gray-300`} style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>
                                    {getUrduText()}
                                </p>
                            )}
                             {!isStory(content) && <p className={`font-lato mt-4 text-sm md:text-base text-gray-400`} style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                - {getReferenceText()} -
                            </p>}
                        </div>
                        
                        {logoImage && (
                          <img 
                            src={logoImage.src} 
                            alt="Quran Online School" 
                            className="absolute top-4 right-4 z-30 w-[20%] max-w-[120px] opacity-90"
                          />
                        )}

                        <button onClick={clearBackground} className="absolute top-2 left-2 z-30 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75" aria-label="Clear background">
                            <ClearIcon className="h-5 w-5"/>
                        </button>
                    </>
                )}
            </div>
          </div>
        </div>
      </div>
       <style>{`
            @keyframes keyframes-fade-in-down {
                from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                to { opacity: 1; transform: translateY(0) translateX(-50%); }
            }
            .animate-fade-in-down { animation: keyframes-fade-in-down 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};