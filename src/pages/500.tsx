import { ServerErrorPage } from '@/components';

import Header from './header';

export default function InternalServerErrorPage() {
  return (
    <>
      <Header />
      <ServerErrorPage />
    </>
  );
}
