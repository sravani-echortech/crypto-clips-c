import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

export default function useNetworkStatus(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return unsubscribe;
  }, []);

  return networkState;
}