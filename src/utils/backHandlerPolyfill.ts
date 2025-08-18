import { BackHandler } from 'react-native';

// Comprehensive polyfill for React Native BackHandler API changes
// This fixes: TypeError: _reactNative.BackHandler.removeEventListener is not a function

const originalBackHandler = BackHandler as any;

// Store the original methods
const originalRemove = originalBackHandler.remove;
const originalAdd = originalBackHandler.add;

// Create polyfill functions
const addEventListener = (eventType: string, handler: () => boolean) => {
  if (originalAdd && typeof originalAdd === 'function') {
    return originalAdd(handler);
  }
  return { remove: () => {} };
};

const removeEventListener = (eventType: string, handler: () => boolean) => {
  if (originalRemove && typeof originalRemove === 'function') {
    return originalRemove(handler);
  }
  return false;
};

// Apply the polyfill
if (!originalBackHandler.addEventListener) {
  originalBackHandler.addEventListener = addEventListener;
}

if (!originalBackHandler.removeEventListener) {
  originalBackHandler.removeEventListener = removeEventListener;
}

// Also make sure the methods are available on the default export
export const polyfillBackHandler = () => {
  if (typeof BackHandler !== 'undefined') {
    const bh = BackHandler as any;
    if (!bh.addEventListener && bh.add) {
      bh.addEventListener = addEventListener;
    }
    if (!bh.removeEventListener && bh.remove) {
      bh.removeEventListener = removeEventListener;
    }
  }
};

// Apply immediately
polyfillBackHandler();

export default BackHandler;