import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface SafeContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

const SafeContainer: React.FC<SafeContainerProps> = ({ 
  children, 
  style, 
  edges = ['top'],
  className 
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style
      ]}
      edges={edges}
      className={className}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeContainer;