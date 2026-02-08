import useThemeColors from '@rov/contexts/ThemeColors'
import type React from 'react'
import { useState } from 'react'
import {
  type StyleProp,
  TouchableOpacity,
  View,
  type ViewStyle
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import Icon from './Icon'
import ThemedText from './ThemedText'

type ThemedCalendarProps = {
  onDateChange: (date: Date) => void
  className?: string
  style?: StyleProp<ViewStyle>
  initialDate?: Date
  maxDate?: string
  minDate?: string
}

export const ThemedCalendar: React.FC<ThemedCalendarProps> = ({
  onDateChange,
  className = '',
  style,
  initialDate = new Date('1990-01-01'),
  maxDate = new Date().toISOString().split('T')[0],
  minDate = '1900-01-01'
}) => {
  const colors = useThemeColors()
  const [selectedDate, setSelectedDate] = useState(
    initialDate.toISOString().split('T')[0]
  )
  const [currentMonth, setCurrentMonth] = useState(
    initialDate.toISOString().split('T')[0]
  )

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString)
    onDateChange(new Date(day.dateString))
  }

  const handleMonthChange = (month: any) => {
    setCurrentMonth(month.dateString)
  }

  // Generate years for quick selection
  const _currentYear = new Date().getFullYear()
  const selectedYear = new Date(currentMonth).getFullYear()
  const selectedMonthIndex = new Date(currentMonth).getMonth()

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const jumpToYear = (yearDelta: number) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(selectedYear + yearDelta)
    setCurrentMonth(newDate.toISOString().split('T')[0])
  }

  const _jumpToMonth = (monthDelta: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(selectedMonthIndex + monthDelta)
    setCurrentMonth(newDate.toISOString().split('T')[0])
  }

  return (
    <View className={`rounded-2xl overflow-hidden ${className}`} style={style}>
      {/* Year Navigation */}
      <View
        className="flex-row justify-between items-center px-4 py-3"
        style={{
          backgroundColor: colors.secondary,
          borderBottomColor: colors.border,
          borderBottomWidth: 1
        }}
      >
        <TouchableOpacity className="p-2" onPress={() => jumpToYear(-1)}>
          <Icon color={colors.text} name="ChevronLeft" size={20} />
        </TouchableOpacity>

        <ThemedText className="text-lg font-semibold">
          {selectedYear}
        </ThemedText>

        <TouchableOpacity className="p-2" onPress={() => jumpToYear(1)}>
          <Icon color={colors.text} name="ChevronRight" size={20} />
        </TouchableOpacity>
      </View>

      {/* Month Quick Navigation */}
      <View className="px-4 py-2" style={{ backgroundColor: colors.secondary }}>
        <View className="flex-row justify-between">
          {months.map((month, index) => (
            <TouchableOpacity
              className={`px-2 py-1 rounded ${
                index === selectedMonthIndex ? 'opacity-100' : 'opacity-60'
              }`}
              key={month}
              onPress={() => {
                const newDate = new Date(currentMonth)
                newDate.setMonth(index)
                setCurrentMonth(newDate.toISOString().split('T')[0])
              }}
              style={{
                backgroundColor:
                  index === selectedMonthIndex
                    ? colors.highlight
                    : 'transparent'
              }}
            >
              <ThemedText
                className="text-xs font-medium"
                style={{
                  color:
                    index === selectedMonthIndex ? colors.invert : colors.text
                }}
              >
                {month}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        current={currentMonth}
        enableSwipeMonths={true}
        firstDay={1}
        hideExtraDays={true}
        markedDates={{
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
            selectedColor: colors.highlight,
            selectedTextColor: colors.invert
          }
        }}
        maxDate={maxDate}
        minDate={minDate}
        monthFormat={'MMMM yyyy'}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        showWeekNumbers={false}
        style={{
          backgroundColor: colors.secondary,
          paddingBottom: 10
        }}
        theme={{
          backgroundColor: colors.secondary,
          calendarBackground: colors.secondary,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.highlight,
          selectedDayTextColor: colors.invert,
          todayTextColor: colors.highlight,
          dayTextColor: colors.text,
          textDisabledColor: colors.placeholder,
          dotColor: colors.highlight,
          selectedDotColor: colors.invert,
          arrowColor: colors.text,
          monthTextColor: colors.text,
          indicatorColor: colors.highlight,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '400',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
      />
    </View>
  )
}

export default ThemedCalendar
