// Load polyfills before anything else
import './polyfills';

import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

// Import App
import App from './App';

// Apply a global polyfill for BackHandler before any navigation libraries load
const applyBackHandlerPolyfill = () => {
  try {
    const RN = require('react-native');
    const BackHandler = RN.BackHandler;
    
    if (BackHandler) {
      // Store original methods if they exist
      const originalAdd = BackHandler.add;
      const originalRemove = BackHandler.remove;
      
      // Add deprecated methods if they don't exist
      if (!BackHandler.addEventListener) {
        Object.defineProperty(BackHandler, 'addEventListener', {
          value: function(eventName, handler) {
            console.log('BackHandler polyfill: addEventListener called');
            if (originalAdd) {
              return originalAdd.call(this, handler);
            }
            // Fallback
            return { remove: () => {} };
          },
          writable: true,
          configurable: true
        });
      }
      
      if (!BackHandler.removeEventListener) {
        Object.defineProperty(BackHandler, 'removeEventListener', {
          value: function(eventName, handler) {
            console.log('BackHandler polyfill: removeEventListener called');
            if (originalRemove) {
              return originalRemove.call(this, handler);
            }
            // Fallback
            return false;
          },
          writable: true,
          configurable: true
        });
      }
      
      console.log('BackHandler polyfill applied successfully');
    }
  } catch (error) {
    console.warn('Failed to apply BackHandler polyfill:', error);
  }
};

// Apply the polyfill before registering the app
applyBackHandlerPolyfill();

// Also apply it to the global React Native module
const rnModule = require('react-native');
if (rnModule.BackHandler && !rnModule.BackHandler.addEventListener) {
  rnModule.BackHandler.addEventListener = function(eventName, handler) {
    return this.add ? this.add(handler) : { remove: () => {} };
  };
}
if (rnModule.BackHandler && !rnModule.BackHandler.removeEventListener) {
  rnModule.BackHandler.removeEventListener = function(eventName, handler) {
    return this.remove ? this.remove(handler) : false;
  };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);