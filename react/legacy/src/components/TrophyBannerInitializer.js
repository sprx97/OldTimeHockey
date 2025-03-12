import { useEffect, useContext, createContext, useState, useCallback } from 'react';
export const BannerContext = createContext();
export const useBannerContext = () => useContext(BannerContext);
export const BannerProvider = ({ children }) => {
  const [expandedBanners, setExpandedBanners] = useState({});

  const toggleBanner = useCallback((bannerId, isExpanded) => {
    setExpandedBanners(prev => {
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
    });
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
      const bannerElements = document.querySelectorAll('[data-banner-id]');
      const bannerElementsArray = Array.from(bannerElements);
      
      bannerElementsArray.forEach((bannerElement) => {
        const bannerId = bannerElement.getAttribute('data-banner-id');
        if (!bannerId) return;
        
        toggleBanner(bannerId, false);
      });
      
      if (bannerElementsArray.length > 0) {
        const firstBannerId = bannerElementsArray[0].getAttribute('data-banner-id');
        if (firstBannerId) {
          toggleBanner(firstBannerId, true);
        }
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
