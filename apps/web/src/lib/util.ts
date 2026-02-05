export const extractRedirectURL = (redirectUri?: string, pathOnly = false) => {
  if (!redirectUri || redirectUri.length === 0) {
    return pathOnly
      ? '/'
      : `${import.meta.env.VITE_APP_URL || window.location.origin}/`
  }

  try {
    // Try to parse as a full URL
    const url = new URL(redirectUri)
    // Valid URL with protocol and hostname
    if (url.protocol && url.hostname) {
      return pathOnly ? url.pathname : redirectUri
    }
  } catch {
    // Not a valid full URL, check if it's a relative path
    if (redirectUri.startsWith('/')) {
      if (pathOnly) {
        return redirectUri
      }
      // Use URL constructor to properly join base and path (handles trailing slashes)
      const baseURL = import.meta.env.VITE_APP_URL || window.location.origin
      return new URL(redirectUri, baseURL).href
    }
    // If it doesn't start with /, it's invalid, use default
  }

  return pathOnly
    ? '/'
    : `${import.meta.env.VITE_APP_URL || window.location.origin}/`
}
