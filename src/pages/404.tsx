import { NotFoundPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import Header from './header';

export default function NotFoundErrorPage() {
  return (
    <I18nNamespaceBoundary ns='404'>
      <PageI18nProvider ns='404'>
        <Header />
        <NotFoundPage />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}
