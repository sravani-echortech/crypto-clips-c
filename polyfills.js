// Polyfills for React Native compatibility issues
// This file must be imported at the very beginning of index.js

// Fix for BackHandler.removeEventListener is not a function
// This is due to React Native 0.79.5 removing deprecated methods
(function() {
  'use strict';
  
  // We need to patch the BackHandler before any other module loads
  // Use a getter to lazily patch when BackHandler is first accessed
  let patched = false;
  
  const patchBackHandler = () => {
    if (patched) return;
    
    try {
      const ReactNative = require('react-native');
      const BackHandler = ReactNative.BackHandler;
      
      if (BackHandler) {
        // Check if deprecated methods exist, if not add them
        if (!BackHandler.addEventListener) {
          BackHandler.addEventListener = function(eventName, handler) {
            // The new API just uses 'add' without event name
            if (this.add && typeof handler === 'function') {
              return this.add(handler);
            }
            return { remove: () => {} };
          };
        }
        
        if (!BackHandler.removeEventListener) {
          BackHandler.removeEventListener = function(eventName, handler) {
            // The new API just uses 'remove' without event name
            if (this.remove && typeof handler === 'function') {
              return this.remove(handler);
            }
            return false;
          };
        }
        
        patched = true;
        console.log('[Polyfill] BackHandler compatibility methods added');
      }
    } catch (error) {
      console.warn('[Polyfill] Failed to patch BackHandler:', error);
    }
  };
  
  // Patch immediately
  patchBackHandler();
  
  // Also patch when modules are required
  const originalRequire = global.require;
  if (originalRequire) {
    global.require = function(id) {
      const module = originalRequire.apply(this, arguments);
      
      // If react-native is being required, ensure it's patched
      if (id === 'react-native' && module.BackHandler) {
        patchBackHandler();
      }
      
      return module;
    };
  }
})();