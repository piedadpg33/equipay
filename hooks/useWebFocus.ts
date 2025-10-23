import { useEffect } from 'react';
import { Platform } from 'react-native';

export const useWebFocus = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Blur active element on component mount
      const handleBlur = () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      };

      // Add event listeners for modals and overlays
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'aria-hidden') {
            handleBlur();
          }
        });
      });

      // Observe the document body for aria-hidden changes
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-hidden']
      });

      // Cleanup
      return () => {
        observer.disconnect();
      };
    }
  }, []);
};
