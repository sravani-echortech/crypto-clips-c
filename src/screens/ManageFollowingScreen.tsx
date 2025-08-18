import React from 'react';
import { View, Text } from 'react-native';
import { SafeContainer } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';

const ManageFollowingScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>
          Manage Following Screen - Coming Soon
        </Text>
      </View>
    </SafeContainer>
  );
};

export default ManageFollowingScreen;