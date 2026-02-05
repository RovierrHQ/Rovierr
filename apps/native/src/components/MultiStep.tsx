import { Button } from '@rov/components/Button'
import Header from '@rov/components/Header'
import Icon from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import type React from 'react'
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'
import { Animated, Easing, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Step component that will be used as children
export type StepProps = {
  title: string
  optional?: boolean
  children: ReactNode
}

export const Step: React.FC<StepProps> = ({ children }) => {
  return <>{children}</> // Just render children, this is mainly for type safety
}

// Add this to help with type checking
const isStepComponent = (
  child: any
): child is React.ReactElement<StepProps> => {
  return (
    isValidElement(child) &&
    (child.type === Step ||
      (typeof child.type === 'function' && child.type.name === 'Step'))
  )
}

type StepData = {
  key: string
  title: string
  optional?: boolean
  component: ReactNode
}

type MultiStepProps = {
  children: ReactNode
  onComplete: () => void
  onClose?: () => void
  showHeader?: boolean
  showStepIndicator?: boolean
  className?: string
  onStepChange?: (nextStep: number) => boolean
}

export default function MultiStep({
  children,
  onComplete,
  onClose,
  showHeader = true,
  showStepIndicator = true,
  className = '',
  onStepChange
}: MultiStepProps) {
  // Filter and validate children to only include Step components
  const validChildren = Children.toArray(children).filter(isStepComponent)

  // Extract step data from children
  const steps: StepData[] = validChildren.map((child, index) => {
    const {
      title,
      optional,
      children: stepContent
    } = (child as React.ReactElement<StepProps>).props
    return {
      key: `step-${index}`,
      title: title || `Step ${index + 1}`,
      optional,
      component: stepContent
    }
  })

  // Ensure we have at least one step
  if (steps.length === 0) {
    steps.push({
      key: 'empty-step',
      title: 'Empty',
      component: (
        <View>
          <ThemedText>No steps provided</ThemedText>
        </View>
      )
    })
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const progressAnims = useRef(steps.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Reset and start fade/slide animations
    fadeAnim.setValue(0)
    slideAnim.setValue(50)

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0)
      })
    ]).start()

    // Animate progress indicators
    steps.forEach((_, index) => {
      Animated.timing(progressAnims[index], {
        toValue: index <= currentStepIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false
      }).start()
    })
  }, [
    currentStepIndex,
    progressAnims,
    fadeAnim,
    slideAnim, // Animate progress indicators
    steps.forEach
  ])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      const nextStep = currentStepIndex + 1
      const canProceed = onStepChange ? onStepChange(nextStep) : true

      if (canProceed) {
        setCurrentStepIndex(nextStep)
      }
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep.optional && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const insets = useSafeAreaInsets()

  return (
    <View
      className={`flex-1 bg-background ${className}`}
      style={{ paddingBottom: insets.bottom }}
    >
      {showHeader && (
        <Header
          leftComponent={[
            currentStep.optional && !isLastStep && (
              <Button
                key="skip"
                onPress={handleSkip}
                size="small"
                title="Skip"
                variant="ghost"
              />
            ),
            !isFirstStep && (
              <Icon
                className="text-light-text dark:text-dark-text"
                key="back"
                name="ArrowLeft"
                onPress={handleBack}
                size={24}
              />
            )
          ]}
          rightComponents={[
            onClose ? (
              <Pressable
                className="p-2 rounded-full active:bg-secondary"
                hitSlop={8}
                key="close"
                onPress={handleClose}
              >
                <Icon name="X" size={24} />
              </Pressable>
            ) : undefined
          ]}
        />
      )}

      {/* Step Indicators */}
      {showStepIndicator && (
        <View className="px-global mb-10 flex-row justify-center w-full">
          {steps.map((_, index) => (
            <Animated.View
              className="h-1 overflow-hidden bg-border flex-1"
              key={index}
              style={{
                opacity: index === currentStepIndex ? 1 : 1
              }}
            >
              <Animated.View
                className="h-full bg-highlight"
                style={{
                  width: progressAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Step Content */}
      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View className="flex-1">{currentStep.component}</View>
      </Animated.View>

      {/* Bottom Navigation */}
      <View className="px-4 py-3">
        <Pressable
          className="w-full bg-highlight flex items-center justify-center py-5 rounded-full"
          onPress={handleNext}
        >
          <Text className="text-black font-semibold text-base">
            {isLastStep ? 'Complete' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
