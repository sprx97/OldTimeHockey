import { useEffect, useContext, createContext, useState, useCallback, useRef } from 'react';
export const BannerContext = createContext();
export const useBannerContext = () => useContext(BannerContext);
export const BannerProvider = ({ children }) => {
  const [expandedBanners, setExpandedBanners] = useState({});
  const [isDesktop, setIsDesktop] = useState(!window.matchMedia('(max-width: 768px)').matches);

  /* Specifically for window resize */
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(!window.matchMedia('(max-width: 768px)').matches);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleBanner = useCallback((bannerId, isExpanded, forceDesktopMode = false) => {
    setExpandedBanners(prev => {
      // In desktop mode or when forceDesktopMode is true, we can have multiple expanded banners
      if (isDesktop || forceDesktopMode) {
        return {
          ...prev,
          [bannerId]: isExpanded
        };
      } else {
        // In mobile mode, only one banner can be expanded at a time
        if (isExpanded) {
          const newState = {};
          Object.keys(prev).forEach(id => {
            newState[id] = false;
          });
          return {
            ...newState,
            [bannerId]: true
          };
        } else {
          return {
            ...prev,
            [bannerId]: false
          };
        }
      }
    });
  }, [isDesktop]);
  
  return (
    <BannerContext.Provider value={{ expandedBanners, toggleBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

const TrophyBannerInitializer = () => {
  const { toggleBanner } = useBannerContext();
  const fontLoadedRef = useRef(false);
  
  useEffect(() => {
    if (fontLoadedRef.current) return;
    
    // Use the Font Loading API to detect when Anton is loaded
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.fonts.forEach(font => {
          if (font.family.toLowerCase() === 'anton' && font.status === 'loaded') {
            fontLoadedRef.current = true;
            // Remove the font-fallback class from all elements
            document.querySelectorAll('.font-fallback').forEach(el => {
              el.classList.remove('font-fallback');
            });
          }
        });
      });
    } else {
      // Fallback for browsers that don't support Font Loading API
      setTimeout(() => {
        document.querySelectorAll('.font-fallback').forEach(el => {
          el.classList.remove('font-fallback');
        });
      }, 1000); 
    }
  }, []);
  
  useEffect(() => {
    const updateBanners = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const bannerElements = document.querySelectorAll('[data-banner-id]');
      const bannerElementsArray = Array.from(bannerElements);
      
      if (isMobile) {
        // On mobile, collapse all banners except the first one
        bannerElementsArray.forEach((bannerElement) => {
          const bannerId = bannerElement.getAttribute('data-banner-id');
          if (!bannerId) {
            return;
          }
          toggleBanner(bannerId, false);
        });
        
        if (bannerElementsArray.length > 0) {
          const firstBannerId = bannerElementsArray[0].getAttribute('data-banner-id');
          if (firstBannerId) {
            toggleBanner(firstBannerId, true);
          }
        }
      } else {
        // On desktop, expand all banners
        bannerElementsArray.forEach((bannerElement) => {
          const bannerId = bannerElement.getAttribute('data-banner-id');
          if (!bannerId) {
            return;
          }
          toggleBanner(bannerId, true, true); // Force desktop mode to allow multiple expanded banners
        });
      }
    };
  
    // Init
    updateBanners();
    window.addEventListener('resize', updateBanners);
    
    return () => {
      window.removeEventListener('resize', updateBanners);
    };
  }, [toggleBanner]);
  
  return null;
};

export default TrophyBannerInitializer;
