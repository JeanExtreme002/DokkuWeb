import { ReactNode } from 'react';

import { PageI18nContext } from './PageI18nContext';

export function PageI18nProvider({ ns, children }: { ns: string; children: ReactNode }) {
  return <PageI18nContext.Provider value={ns}>{children}</PageI18nContext.Provider>;
}
