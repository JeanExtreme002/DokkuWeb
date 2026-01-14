import { Box, Flex, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import searchStyles from '../../search.module.css';

interface HeaderSectionProps {
  query: string;
  itemsCount: number;
  loading: boolean;
  error: string | null;
  hasResult: boolean;
}

export function HeaderSection({
  query,
  itemsCount,
  loading,
  error,
  hasResult,
}: HeaderSectionProps) {
  const { t } = usePageTranslation();
  return (
    <Flex className={searchStyles.headerSection}>
      <Box>
        <Heading size='7' weight='medium' style={{ color: 'var(--gray-12)', marginBottom: '4px' }}>
          {t('search.header.title')}
        </Heading>
        <Text size='3' color='gray'>
          {`${t('search.header.subtitle.searching_for', { query })}${
            !loading && !error && hasResult
              ? ` ${
                  itemsCount === 1
                    ? t('search.header.subtitle.one_item_found')
                    : t('search.header.subtitle.items_found', { count: itemsCount })
                }`
              : ''
          }`}
        </Text>
      </Box>
    </Flex>
  );
}
