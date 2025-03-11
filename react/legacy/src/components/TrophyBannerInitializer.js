import { useEffect, useContext, createContext, useState, useCallback } from 'react';

// Create a context to share banner state across components
export const BannerContext = createContext();

export const useBannerContext = () => useContext(BannerContext);

export const BannerProvider = ({ children }) => {
  const [expandedBanners, setExpandedBanners] = useState({});
  
  // Memoize the toggleBanner function to prevent it from being recreated on each render
  const toggleBanner = useCallback((bannerId, isExpanded) => {
    setExpandedBanners(prev => ({
      ...prev,
      [bannerId]: isExpanded
    }));
  }, []);
  
  return (
    <BannerContext.Provider value={{ expandedBanners, toggleBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

const TrophyBannerInitializer = () => {
  const { toggleBanner } = useBannerContext();
  
  useEffect(() => {
    const updateBanners = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const bannerElements = document.querySelectorAll('[data-banner-id]');
      const bannerElementsArray = Array.from(bannerElements);
      
      // Update each banner's expanded state based on mobile/desktop view
      bannerElementsArray.forEach((bannerElement, index) => {
        const bannerId = bannerElement.getAttribute('data-banner-id');
        if (!bannerId) return;
        
        const isFirstBanner = index === 0;
        
        if (isMobile) {
          // On mobile: keep first banner open, collapse others
          toggleBanner(bannerId, isFirstBanner);
        } else {
          // On desktop: expand all banners
          toggleBanner(bannerId, true);
        }
      });
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
