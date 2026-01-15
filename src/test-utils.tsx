import { Theme } from '@radix-ui/themes';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Custom render to wrap components in Radix Theme provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <Theme>{children}</Theme>;
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
