import React from 'react';
import { View, Text } from 'react-native';
import { SafeContainer, ResponsiveAppHeader } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const RewardDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeContainer>
      <ResponsiveAppHeader 
        title="Reward Details"
        leftIcon="close"
        leftAction={() => navigation.goBack()}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>
          Reward Details - Coming Soon
        </Text>
      </View>
    </SafeContainer>
  );
};

export default RewardDetailsScreen;