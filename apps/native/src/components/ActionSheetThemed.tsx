import useThemeColors from '@rov/contexts/ThemeColors'
import { forwardRef } from 'react'
import { View } from 'react-native'
import ActionSheet, {
  type ActionSheetProps,
  type ActionSheetRef
} from 'react-native-actions-sheet'

interface ActionSheetThemedProps extends ActionSheetProps {}

const ActionSheetThemed = forwardRef<ActionSheetRef, ActionSheetThemedProps>(
  ({ containerStyle, id, ...props }, ref) => {
    const colors = useThemeColors()
    return (
      <View className="flex-1 absolute top-0 left-0 right-0 bottom-0 h-full w-full">
        <ActionSheet
          {...props}
          containerStyle={{
            backgroundColor: colors.secondary,
            paddingTop: 5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            ...(containerStyle && typeof containerStyle === 'object'
              ? containerStyle
              : {})
          }}
          id={id}
          ref={ref}
        />
      </View>
    )
  }
)

export default ActionSheetThemed
