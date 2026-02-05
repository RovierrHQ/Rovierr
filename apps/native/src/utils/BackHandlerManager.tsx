import { BackHandler } from 'react-native'

// A utility to safely manage back button handlers and ensure they're properly cleaned up
class BackHandlerManager {
  private static instance: BackHandlerManager
  private readonly handlers: Map<string, () => boolean> = new Map()
  private activeHandlerId: string | null = null
  private backHandlerSubscription: any = null

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): BackHandlerManager {
    if (!BackHandlerManager.instance) {
      BackHandlerManager.instance = new BackHandlerManager()
    }
    return BackHandlerManager.instance
  }

  // Register a new back handler with a unique ID
  public registerHandler(id: string, handler: () => boolean): () => void {
    console.log(`BackHandlerManager: Registering handler with ID: ${id}`)

    // Store the handler
    this.handlers.set(id, handler)

    // If there was no active handler, set this as active and add the event listener
    if (!this.activeHandlerId) {
      this.setActiveHandler(id)
    }

    // Return a cleanup function
    return () => this.unregisterHandler(id)
  }

  // Set a specific handler as the active one
  public setActiveHandler(id: string): void {
    if (!this.handlers.has(id)) {
      console.log(
        `BackHandlerManager: Cannot set active handler, ID not found: ${id}`
      )
      return
    }

    console.log(`BackHandlerManager: Setting active handler to ID: ${id}`)

    // Remove any existing global handler first
    this.removeCurrentSubscription()

    // Set this as the active handler
    this.activeHandlerId = id

    // Add the main handler function to the back button
    this.backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      this.mainHandler
    )
  }

  // Unregister a handler by ID
  public unregisterHandler(id: string): void {
    console.log(`BackHandlerManager: Unregistering handler with ID: ${id}`)

    if (!this.handlers.has(id)) {
      console.log(`BackHandlerManager: Handler not found with ID: ${id}`)
      return
    }

    // If this was the active handler, remove the global listener
    if (this.activeHandlerId === id) {
      console.log(`BackHandlerManager: Removing active handler: ${id}`)
      this.removeCurrentSubscription()
      this.activeHandlerId = null

      // Find another handler to make active, if any exist
      if (this.handlers.size > 1) {
        const nextId = Array.from(this.handlers.keys()).find(
          (key) => key !== id
        )
        if (nextId) {
          this.setActiveHandler(nextId)
        }
      }
    }

    // Remove the handler from our map
    this.handlers.delete(id)
  }

  // Reset all handlers (useful for cleanup)
  public resetAll(): void {
    console.log('BackHandlerManager: Resetting all handlers')

    // Remove the global listener
    this.removeCurrentSubscription()

    // Clear all handlers
    this.handlers.clear()
    this.activeHandlerId = null
  }

  // Helper to remove current subscription
  private removeCurrentSubscription(): void {
    if (this.backHandlerSubscription) {
      this.backHandlerSubscription.remove()
      this.backHandlerSubscription = null
    }
  }

  // The main handler function that gets attached to the back button
  private readonly mainHandler = (): boolean => {
    if (this.activeHandlerId && this.handlers.has(this.activeHandlerId)) {
      return this.handlers.get(this.activeHandlerId)?.() ?? false
    }
    return false // Let the default behavior happen
  }
}

export default BackHandlerManager
