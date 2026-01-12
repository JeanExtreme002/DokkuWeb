import { Flex } from '@radix-ui/themes';

import { AppListItem } from '../../types';
import { AppCard } from '../app-card';
import { AppCardSkeleton } from '../app-card-skeleton';

export function AppsList({ appsList, isMobile }: { appsList: AppListItem[]; isMobile: boolean }) {
  return (
    <Flex direction='column' gap='4'>
      {appsList.map((appItem) =>
        appItem.loading || appItem.error || !appItem.info ? (
          <AppCardSkeleton key={appItem.name} appName={appItem.name} isMobile={isMobile} />
        ) : (
          <AppCard key={appItem.name} appItem={appItem} isMobile={isMobile} />
        )
      )}
    </Flex>
  );
}
