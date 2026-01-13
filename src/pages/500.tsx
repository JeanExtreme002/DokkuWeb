import { ServerErrorPage } from '@/components';
import { I18nNamespaceBoundary } from '@/i18n/I18nNamespaceBoundary';
import { PageI18nProvider } from '@/i18n/PageI18nProvider';

import Header from './header';

export default function InternalServerErrorPage() {
  return (
    <I18nNamespaceBoundary ns='500'>
      <PageI18nProvider ns='500'>
        <Header />
        <ServerErrorPage />
      </PageI18nProvider>
    </I18nNamespaceBoundary>
  );
}
