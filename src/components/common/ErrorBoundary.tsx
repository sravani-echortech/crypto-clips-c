import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props & { colors: any }, State> {
  constructor(props: Props & { colors: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('🚨 [SENTRY] ErrorBoundary: Error detected', { error: error.message });
    Sentry.addBreadcrumb({
      message: 'Error boundary detected error',
      category: 'error',
      level: 'error',
      data: {
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
      },
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [SENTRY] ErrorBoundary: Caught error with details:', error, errorInfo);
    
    // Capture the error in Sentry with full context
    Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
        errorBoundary: true,
      },
      extra: {
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        timestamp: new Date().toISOString(),
      },
    });
    
    Sentry.addBreadcrumb({
      message: 'Error boundary caught error with component stack',
      category: 'error',
      level: 'error',
      data: {
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      },
    });
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    console.log('🔄 [SENTRY] ErrorBoundary: User retrying after error');
    Sentry.addBreadcrumb({
      message: 'User retried after error boundary',
      category: 'error',
      level: 'info',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={[styles.container, { backgroundColor: this.props.colors.background }]}>
          <View style={[styles.content, { backgroundColor: this.props.colors.surface }]}>
            <Ionicons 
              name="warning" 
              size={64} 
              color={this.props.colors.warning} 
              style={styles.icon}
            />
            
            <Text style={[styles.title, { color: this.props.colors.text }]}>
              Oops! Something went wrong
            </Text>
            
            <Text style={[styles.message, { color: this.props.colors.textSecondary }]}>
              We encountered an unexpected error. Please try again or restart the app.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={[styles.errorTitle, { color: this.props.colors.danger }]}>
                  Error Details (Development):
                </Text>
                <Text style={[styles.errorText, { color: this.props.colors.textSecondary }]}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={[styles.errorText, { color: this.props.colors.textSecondary }]}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: this.props.colors.primary }]}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;

