import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RootErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  renderErrorUI = () => {
    const { error, errorInfo } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons 
            name="warning" 
            size={64} 
            color="#F59E0B" 
            style={styles.icon}
          />
          
          <Text style={styles.title}>
            Oops! Something went wrong
          </Text>
          
          <Text style={styles.message}>
            We encountered an unexpected error. Please try again or restart the app.
          </Text>
          
          {__DEV__ && error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>
                Error Details (Development):
              </Text>
              <Text style={styles.errorText}>
                {error.toString()}
              </Text>
              {errorInfo && (
                <Text style={styles.errorText}>
                  {errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.retryButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    backgroundColor: '#1A1F3A',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    color: '#9CA3AF',
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
    color: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
    color: '#9CA3AF',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    backgroundColor: '#F59E0B',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});