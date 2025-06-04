import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions: string | {
    method?: string;
    data?: unknown;
  },
  data?: unknown
): Promise<Response> {
  let url: string;
  let method: string;
  let requestData: unknown;
  
  // Handle both call patterns:
  // 1. apiRequest('/api/endpoint', { method: 'POST', data: {...} })
  // 2. apiRequest('POST', '/api/endpoint', {...})
  if (typeof urlOrOptions === 'string') {
    // New pattern: apiRequest('POST', '/api/endpoint', {...})
    method = methodOrUrl;
    url = urlOrOptions;
    requestData = data;
  } else {
    // Original pattern: apiRequest('/api/endpoint', { method: 'POST', data: {...} })
    url = methodOrUrl;
    method = urlOrOptions.method || 'GET';
    requestData = urlOrOptions.data;
  }
  
  try {
    console.log(`Sending ${method} request to ${url}`, requestData);
    
    // Make sure method is correctly passed to fetch
    const res = await fetch(url, {
      method: method,
      headers: requestData ? { 
        "Content-Type": "application/json" 
      } : {},
      body: requestData ? JSON.stringify(requestData) : undefined,
      credentials: "include",
    });
    
    console.log(`Response status from ${method} to ${url}: ${res.status}`);

    if (!res.ok) {
      const text = await res.text();
      console.error(`API Error (${res.status}):`, text);
      throw new Error(text || res.statusText);
    }
    
    return res;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Fetching data from: ${url}`, queryKey);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
      });
      
      console.log(`Response status from ${url}: ${res.status}`);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Returning null for unauthorized request to ${url}`);
        return null;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error (${res.status}) from ${url}:`, text);
        throw new Error(text || res.statusText);
      }
      
      const data = await res.json();
      console.log(`Received data from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
