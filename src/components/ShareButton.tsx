import React, { useContext } from 'react';
import { Share2 } from 'lucide-react';
import { Movie } from '../services/tmdb';
import { ShareModalContext } from '../App';

interface ShareButtonProps {
  movieData: Movie & {
    ratings?: {
      story: number;
      looks: number;
      feels: number;
      sounds: number;
    };
  };
}

export default function ShareButton({ movieData }: ShareButtonProps) {
  const { setShareModalData } = useContext(ShareModalContext);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalData({
      isOpen: true,
      movie: movieData,
      ratings: movieData.ratings || {
        story: 0,
        looks: 0,
        feels: 0,
        sounds: 0
      }
    });
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition-colors"
    >
      <Share2 className="h-5 w-5 text-white" />
    </button>
  );
}