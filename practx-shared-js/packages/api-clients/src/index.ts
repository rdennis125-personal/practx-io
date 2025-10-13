export interface ApiClientOptions {
  baseUrl: string;
}

export function createPlaceholderClient(options: ApiClientOptions) {
  return {
    getHealth: () => Promise.resolve({ status: 'healthy', baseUrl: options.baseUrl })
  };
}
