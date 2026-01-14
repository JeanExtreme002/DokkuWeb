import { render } from '@testing-library/react';

import { usePageNamespace } from '../PageI18nContext';
import { PageI18nProvider } from '../PageI18nProvider';

function TestComponent() {
  const ns = usePageNamespace();
  return <span>provided-{ns}</span>;
}

describe('PageI18nProvider', () => {
  it('provides namespace to children', () => {
    const { getByText } = render(
      <PageI18nProvider ns='test-ns'>
        <TestComponent />
      </PageI18nProvider>
    );
    expect(getByText('provided-test-ns')).toBeInTheDocument();
  });

  it('throws error if usePageNamespace is used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    spy.mockRestore();
  });
});
