import React, { useRef, useState } from 'react';
import { X, Twitter, Facebook, Link2, Loader2, Share2 } from 'lucide-react';
import { Movie } from '../services/tmdb';
import { uploadImage } from '../services/imageUpload';
import toast from 'react-hot-toast';
import * as htmlToImage from 'html-to-image';
import ShareableMovieCard from './ShareableMovieCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

export default function ShareModal({ isOpen, onClose, movie, ratings }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showNativeShare, setShowNativeShare] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    setShowNativeShare(!!navigator.share);
  }, []);

  const generateImage = async () => {
    if (!cardRef.current) {
      toast.error('Error generating share image');
      return null;
    }

    try {
      setIsGenerating(true);

      // Wait for images to load
      const images = cardRef.current.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map(
          img =>
            new Promise((resolve, reject) => {
              if (img.complete) resolve(null);
              else {
                img.onload = () => resolve(null);
                img.onerror = reject;
              }
            })
        )
      );

      // Add a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0f1116',
        cacheBust: true,
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      });

      setGeneratedImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate share image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadAndShare = async (platform: 'twitter' | 'facebook' | 'native') => {
    try {
      setIsSharing(true);
      
      const imageData = generatedImage || await generateImage();
      if (!imageData) return;

      // Only upload if we don't have a URL yet
      if (!imageUrl) {
        try {
          const uploadedUrl = await uploadImage(imageData);
          if (!uploadedUrl) {
            throw new Error('Failed to get image URL');
          }
          setImageUrl(uploadedUrl);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload image. Please try again.');
          return;
        }
      }

      const shareText = `Just watched ${movie.title} on FlipFilm! Check out my rating:\n\n${imageUrl}`;

      if (platform === 'native' && showNativeShare) {
        try {
          const shareData = {
            title: `FlipFilm - ${movie.title}`,
            text: shareText,
            url: imageUrl
          };

          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            toast.success('Shared successfully!');
          } else {
            throw new Error('Sharing not supported');
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Native share error:', error);
            toast.error('Failed to share. Try another method.');
          }
        }
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        toast.success('Opening Twitter...');
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank', 'width=550,height=420');
        toast.success('Opening Facebook...');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      setIsSharing(true);
      
      if (!imageUrl) {
        const imageData = generatedImage || await generateImage();
        if (!imageData) return;
        
        try {
          const uploadedUrl = await uploadImage(imageData);
          if (!uploadedUrl) {
            throw new Error('Failed to get image URL');
          }
          setImageUrl(uploadedUrl);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload image. Please try again.');
          return;
        }
      }

      const shareText = `Check out my rating for ${movie.title} on FlipFilm!\n${imageUrl}`;
      
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-[#0f1116] rounded-xl p-6 w-full max-w-[900px] mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share Movie Rating</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div ref={cardRef} className="transform-gpu">
            <ShareableMovieCard movie={movie} ratings={ratings} />
          </div>
        </div>

        <div className="space-y-4">
          {!generatedImage ? (
            <button
              onClick={generateImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-3 w-full p-3 bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Share2 className="h-5 w-5" />
                  <span>Generate Share Image</span>
                </>
              )}
            </button>
          ) : (
            <>
              {showNativeShare && (
                <button
                  onClick={() => uploadAndShare('native')}
                  disabled={isSharing}
                  className="flex items-center justify-center gap-3 w-full p-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Share2 className="h-5 w-5" />
                  <span>{isSharing ? 'Sharing...' : 'Share'}</span>
                </button>
              )}

              <button
                onClick={() => uploadAndShare('twitter')}
                disabled={isSharing}
                className="flex items-center justify-center gap-3 w-full p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors disabled:opacity-50"
              >
                <Twitter className="h-5 w-5" />
                <span>{isSharing ? 'Sharing...' : 'Share on Twitter'}</span>
              </button>

              <button
                onClick={() => uploadAndShare('facebook')}
                disabled={isSharing}
                className="flex items-center justify-center gap-3 w-full p-3 bg-[#4267B2]/10 hover:bg-[#4267B2]/20 text-[#4267B2] rounded-lg transition-colors disabled:opacity-50"
              >
                <Facebook className="h-5 w-5" />
                <span>{isSharing ? 'Sharing...' : 'Share on Facebook'}</span>
              </button>

              <button
                onClick={copyToClipboard}
                disabled={isSharing}
                className="flex items-center justify-center gap-3 w-full p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Link2 className="h-5 w-5" />
                <span>{isSharing ? 'Copying...' : 'Copy Link'}</span>
              </button>

              <a
                href={generatedImage}
                download={`${movie.title.toLowerCase().replace(/\s+/g, '-')}-rating.png`}
                className="flex items-center justify-center gap-3 w-full p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <span>Download Image</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}