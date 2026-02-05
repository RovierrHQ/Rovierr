import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icon } from '../ui/icon'

declare const __DEV__: boolean

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

type ErrorBoundaryProps = {
  children: React.ReactNode
  onRetry?: () => void
}

export class ProfileErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProfileErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-8 bg-[#F5F5F5] dark:bg-black">
          <View className="w-20 h-20 rounded-full bg-[#F2F3F5] dark:bg-[#1F2937] justify-center items-center mb-6">
            <Icon
              color="#8E9297"
              materialCommunityIcon={{ name: 'code-tags' }}
              sfSymbol={{ name: 'chevron.left.forwardslash.chevron.right' }}
              size={48}
            />
          </View>

          <Text className="text-xl font-semibold text-[#060607] dark:text-white mb-2 text-center">
            {'Something went wrong'}
          </Text>
          <Text className="text-base text-[#8E9297] text-center leading-6 mb-6">
            We encountered an error while loading your profile. Please try
            again.
          </Text>

          {this.state.error && __DEV__ && (
            <Text className="text-xs text-[#DC3545] text-center mb-6 font-mono">
              {this.state.error.message}
            </Text>
          )}

          <TouchableOpacity
            accessibilityLabel="Retry"
            accessibilityRole="button"
            className="flex-row items-center bg-[#5865F2] px-6 py-3 rounded-lg"
            onPress={this.handleRetry}
          >
            <Icon
              color="#FFFFFF"
              materialIcon={{ name: 'add-circle' }}
              sfSymbol={{ name: 'plus.circle.fill' }}
              size={20}
            />
            <Text className="text-base font-semibold text-white ml-2">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}
