import React from 'react';
import { View, Text } from 'react-native';
import { SafeContainer, AppHeader, Button } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const FilterSheet: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeContainer>
      <AppHeader 
        title="Filters"
        leftIcon="close"
        leftAction={() => navigation.goBack()}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 20 }}>
          Filter Sheet - Coming Soon
        </Text>
        <Button
          title="Close"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    </SafeContainer>
  );
};

export default FilterSheet;