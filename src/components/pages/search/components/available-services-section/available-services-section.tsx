import { Box, Heading } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import searchStyles from '../../search.module.css';
import type { UnifiedItem } from '../../types';
import { AvailableDatabaseCard } from '../cards';

interface AvailableServicesSectionProps {
  items: UnifiedItem[];
  isMobile: boolean;
}

export function AvailableServicesSection({ items, isMobile }: AvailableServicesSectionProps) {
  const { t } = usePageTranslation();
  const availableDbItems = items.filter((it) => it.kind === 'available_database');

  if (availableDbItems.length === 0) return null;

  return (
    <Box className={searchStyles.availableSection}>
      <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)', margin: '12px 0' }}>
        {t('search.available.title')}
      </Heading>
      <div className={searchStyles.availableGrid}>
        {availableDbItems.map((it) => (
          <AvailableDatabaseCard key={`db-${it.name}`} name={it.name} isMobile={isMobile} />
        ))}
      </div>
    </Box>
  );
}
