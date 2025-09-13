import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryClassProps extends ErrorBoundaryProps {
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    warning: string;
    danger: string;
    primary: string;
  };
}

class ErrorBoundaryClass extends Component<ErrorBoundaryClassProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryClassProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('🚨 ErrorBoundary: Error detected', { error: error.message });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary: Caught error with details:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    console.log('🔄 ErrorBoundary: User retrying after error');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  renderErrorUI = () => {
    const { colors } = this.props;
    const { error, errorInfo } = this.state;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <Ionicons 
            name="warning" 
            size={64} 
            color={colors.warning} 
            style={styles.icon}
          />
          
          <Text style={[styles.title, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            We encountered an unexpected error. Please try again or restart the app.
          </Text>
          
          {__DEV__ && error && (
            <View style={styles.errorDetails}>
              <Text style={[styles.errorTitle, { color: colors.danger }]}>
                Error Details (Development):
              </Text>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {error.toString()}
              </Text>
              {errorInfo && (
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                  {errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={this.handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorUI();
    }

    return this.props.children;
  }
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const { colors } = useTheme();
  
  return (
    <ErrorBoundaryClass colors={colors} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    width: '100%',
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;

