import React from 'react';
import { Movie } from '../services/tmdb';
import { Film, Star } from 'lucide-react';

interface ShareableMovieCardProps {
  movie: Movie;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

export default function ShareableMovieCard({ movie, ratings }: ShareableMovieCardProps) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800';

  const renderRating = (count: number) => {
    return Array(count).fill('🐕').join(' ');
  };

  return (
    <div className="w-[800px] bg-[#0f1116] rounded-lg overflow-hidden shadow-2xl">
      <div className="flex">
        {/* Left side - Movie Poster */}
        <div className="w-[300px] h-[450px] flex-shrink-0">
          <img 
            src={posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            loading="eager"
          />
        </div>

        {/* Right side - Movie Details */}
        <div className="flex-1 p-8 flex flex-col min-w-0">
          {/* Header with Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-1.5 rounded">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FlipFilm</span>
          </div>

          {/* Movie Title */}
          <h2 className="text-2xl font-bold text-white mb-2 truncate">
            {movie.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{movie.vote_average?.toFixed(1)}</span>
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Ratings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-400">Story</span>
                  <div className="text-lg text-yellow-400">{renderRating(ratings.story)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Looks</span>
                  <div className="text-lg text-yellow-400">{renderRating(ratings.looks)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-400">Feels</span>
                  <div className="text-lg text-yellow-400">{renderRating(ratings.feels)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Sounds</span>
                  <div className="text-lg text-yellow-400">{renderRating(ratings.sounds)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="flex-1 min-h-0">
            <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {movie.overview}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              flipfilm.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}