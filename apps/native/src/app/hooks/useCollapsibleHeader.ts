import { useCallback, useRef, useState } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

/**
 * Hook to manage collapsible header state based on scroll position.
 * Uses a ref-based approach to minimize re-renders.
 *
 * For a complete implementation, use with a Header component that has
 * 'collapsible' and 'visible' props, and a ScrollView/FlatList with
 * the handleScroll function connected to onScroll.
 *
 * @example
 * ```
 * // In your screen component:
 * const { headerVisible, scrollHandler } = useCollapsibleHeader();
 *
 * return (
 *   <>
 *     <Header
 *       collapsible
 *       visible={headerVisible}
 *       title="My Screen"
 *     />
 *     <ScrollView
 *       onScroll={scrollHandler}
 *       scrollEventThrottle={16}
 *     >
 *       // Your content
 *     </ScrollView>
 *   </>
 * );
 * ```
 *
 * @param options Configuration options
 * @param options.initialState Initial visibility state (default: true)
 * @param options.threshold Scroll distance threshold to trigger header visibility change (default: 5)
 * @returns Object containing the visibility state and scroll handler
 */
export function useCollapsibleHeader({
  initialState = true,
  threshold = 5
} = {}) {
  // Store visibility state in a ref to avoid re-rendering content
  const headerVisibleRef = useRef(initialState)

  // Use React.useState directly and only update it when absolutely necessary
  // This state should ONLY be used by the Header component
  const [headerVisible, setHeaderVisibleState] = useState(initialState)

  // Throttle state updates to prevent rapid re-renders
  const lastUpdateTime = useRef(0)
  const lastScrollY = useRef(0)
  const isPending = useRef(false)

  // Controlled state setter that throttles updates
  const setHeaderVisible = useCallback((visible: boolean) => {
    // Only update if the value actually changed
    if (headerVisibleRef.current !== visible) {
      headerVisibleRef.current = visible

      // Apply throttling to state updates (max once per 100ms)
      const now = Date.now()
      if (now - lastUpdateTime.current > 100) {
        setHeaderVisibleState(visible)
        lastUpdateTime.current = now
        isPending.current = false
      } else if (!isPending.current) {
        // Schedule update for later
        isPending.current = true
        setTimeout(() => {
          if (isPending.current) {
            setHeaderVisibleState(headerVisibleRef.current)
            lastUpdateTime.current = Date.now()
            isPending.current = false
          }
        }, 100)
      }
    }
  }, [])

  // Create a memoized scroll handler to avoid recreating on every render
  const scrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y
      const scrollDelta = currentScrollY - lastScrollY.current

      // Only trigger change if we've scrolled more than the threshold
      if (Math.abs(scrollDelta) >= threshold) {
        if (scrollDelta > 0) {
          // Scrolling down - hide header
          if (headerVisibleRef.current) {
            setHeaderVisible(false)
          }
        }
        // Scrolling up - show header
        else if (!headerVisibleRef.current) {
          setHeaderVisible(true)
        }
      }

      lastScrollY.current = currentScrollY
    },
    [threshold, setHeaderVisible]
  )

  return {
    headerVisible,
    scrollHandler,
    // For manual control
    setHeaderVisible
  }
}

export default useCollapsibleHeader
