import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  <View style={[styles.toast, styles.successToast]}>
    <View style={styles.iconContainer}>
      <Ionicons name="checkmark-circle" size={24} color="#6B7280" />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.text1, styles.successText]}>{text1}</Text>
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

const CustomErrorToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  <View style={[styles.toast, styles.errorToast]}>
    <View style={styles.iconContainer}>
      <Ionicons name="close-circle" size={24} color="#EF4444" />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.text1, styles.errorText]}>{text1}</Text>
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

const CustomInfoToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  <View style={[styles.toast, styles.infoToast]}>
    <View style={styles.iconContainer}>
      <Ionicons name="information-circle" size={24} color="#0EA5E9" />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.text1, styles.infoText]}>{text1}</Text>
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

const WarningToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  <View style={[styles.toast, styles.warningToast]}>
    <View style={styles.iconContainer}>
      <Ionicons name="warning" size={24} color="#94A3B8" />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.text1, styles.warningText]}>{text1}</Text>
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <CustomErrorToast {...props} />,
  info: (props: any) => <CustomInfoToast {...props} />,
  warning: (props: any) => <WarningToast {...props} />,
};

const styles = StyleSheet.create({
  toast: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },
  successToast: {
    borderLeftColor: '#6B7280',
  },
  errorToast: {
    borderLeftColor: '#EF4444',
  },
  infoToast: {
    borderLeftColor: '#0EA5E9',
  },
  warningToast: {
    borderLeftColor: '#94A3B8',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    color: '#6B7280',
  },
  successText: {
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
  },
  infoText: {
    color: '#0EA5E9',
  },
  warningText: {
    color: '#94A3B8',
  },
});