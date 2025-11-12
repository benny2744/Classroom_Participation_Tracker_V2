// Utility function to get API URL with basePath
export function getApiUrl(path: string): string {
  // In production, basePath should be '/participation' to match nginx
  // Check if we're in the browser and can access window.location
  if (typeof window !== 'undefined') {
    // If the current path includes /participation, use it
    if (window.location.pathname.startsWith('/participation')) {
      const basePath = '/participation';
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${basePath}/${cleanPath}`;
    }
  }
  
  // Fallback: use environment variable or default
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/participation';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  
  return `${cleanBasePath}/${cleanPath}`;
}

// Helper for fetch with basePath
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(path), options);
}

