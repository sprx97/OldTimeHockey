import { useEffect } from 'react';

const TrophyBannerInitializer = () => {
  useEffect(() => {
    const updateBanners = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const banners = document.querySelectorAll('[data-division]');
      
      banners.forEach(banner => {
        const isDivision1 = banner.getAttribute('data-division') === '1';
        const content = banner.querySelector('[class*="bannerContent"]');

        console.log('isDivision1', isDivision1)

        if (isMobile) {
          if (isDivision1) {
            // Keep Division 1 open
            banner.classList.remove('collapsed');
            banner.classList.add('expanded');
            if (content) content.classList.remove('hidden');
          } else {
            // Collapse all others
            banner.classList.add('collapsed');
            banner.classList.remove('expanded');
            if (content) content.classList.add('hidden');
          }
        } else {
          // On desktop, open all banners
          banner.classList.remove('collapsed');
          banner.classList.add('expanded');
          if (content) content.classList.remove('hidden');
        }
      });
    };
  
    updateBanners();
    window.addEventListener('resize', updateBanners);
    
    return () => {
      window.removeEventListener('resize', updateBanners);
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default TrophyBannerInitializer;