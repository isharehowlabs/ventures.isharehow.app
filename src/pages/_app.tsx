import * as React from 'react';
import { ThemeProviderWrapper } from '../ThemeContext';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProviderWrapper>
      <Component {...pageProps} />
    </ThemeProviderWrapper>
  );
}
