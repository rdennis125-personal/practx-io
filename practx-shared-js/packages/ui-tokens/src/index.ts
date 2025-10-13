import type { Properties as CSSProperties } from 'csstype';

export const colors = {
  primary: '#0F62FE',
  secondary: '#6F2CFF',
  neutral: '#1F1F1F'
} as const;

export const typography = {
  heading: {
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    lineHeight: 1.1
  } satisfies CSSProperties,
  body: {
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 400,
    lineHeight: 1.5
  } satisfies CSSProperties
};

export function resolveEnvironmentBaseUrl(env: string | undefined, fallback: string): string {
  if (!env) {
    return fallback;
  }

  switch (env.toLowerCase()) {
    case 'dev':
      return 'https://dev.api.practx.io';
    case 'qa':
      return 'https://qa.api.practx.io';
    case 'prod':
    case 'production':
      return 'https://api.practx.io';
    default:
      return fallback;
  }
}
