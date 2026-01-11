import { Flex } from '@radix-ui/themes';

import type { UnifiedItem } from '../../types';
import { AppCard } from '../cards/app-card';
import { NetworkCard } from '../cards/network-card';
import { ServiceCard } from '../cards/service-card';

interface ResultsSectionProps {
  items: UnifiedItem[];
  isMobile: boolean;
}

export function ResultsSection({ items, isMobile }: ResultsSectionProps) {
  const mainItems = items.filter((it) => it.kind !== 'available_database');

  if (mainItems.length === 0) return null;

  return (
    <Flex direction='column' gap='3'>
      {mainItems.map((it) => {
        if (it.kind === 'app')
          return (
            <AppCard key={`app-${it.name}`} name={it.name} app={it.value} isMobile={isMobile} />
          );
        if (it.kind === 'service')
          return (
            <ServiceCard key={`svc-${it.name}`} name={it.name} svc={it.value} isMobile={isMobile} />
          );
        return <NetworkCard key={`net-${it.name}`} name={it.name} isMobile={isMobile} />;
      })}
    </Flex>
  );
}
