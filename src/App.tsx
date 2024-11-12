import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MovieGrid from './components/MovieGrid';
import FriendsList from './components/FriendsList';
import Footer from './components/Footer';
import ShareModal from './components/ShareModal';
import { Movie } from './services/tmdb';

type View = 'movies' | 'friends';

export type ShareModalData = {
  isOpen: boolean;
  movie: Movie | null;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  } | null;
};

// Create a context for managing the share modal
export const ShareModalContext = React.createContext<{
  shareModalData: ShareModalData;
  setShareModalData: (data: ShareModalData) => void;
}>({
  shareModalData: { isOpen: false, movie: null, ratings: null },
  setShareModalData: () => {},
});

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<View>('movies');
  const [shareModalData, setShareModalData] = useState<ShareModalData>({
    isOpen: false,
    movie: null,
    ratings: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return null;
  }

  return (
    <ShareModalContext.Provider value={{ shareModalData, setShareModalData }}>
      <div className="min-h-screen bg-gray-800 flex flex-col">
        <Toaster position="top-center" />
        <Header />
        <div className="flex-grow flex">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {currentView === 'movies' ? <MovieGrid /> : <FriendsList />}
            </div>
          </main>
        </div>
        <Footer />

        {/* Render ShareModal at root level */}
        {shareModalData.isOpen && shareModalData.movie && shareModalData.ratings && (
          <ShareModal
            isOpen={shareModalData.isOpen}
            onClose={() => setShareModalData({ isOpen: false, movie: null, ratings: null })}
            movie={shareModalData.movie}
            ratings={shareModalData.ratings}
          />
        )}
      </div>
    </ShareModalContext.Provider>
  );
}

export default App;