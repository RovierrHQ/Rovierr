import type { PropsWithChildren } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export const Container = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaProvider className="flex-1 bg-background">
      {/** biome-ignore lint/complexity/noUselessFragments: <wait for next version of safe-area-context package> */}
      <>{children}</>
    </SafeAreaProvider>
  )
}
