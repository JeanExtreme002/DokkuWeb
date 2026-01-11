import { Box, Flex, Heading, Text } from '@radix-ui/themes';

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
  return (
    <Flex className={searchStyles.headerSection}>
      <Box>
        <Heading size='7' weight='medium' style={{ color: 'var(--gray-12)', marginBottom: '4px' }}>
          Resultados da Busca
        </Heading>
        <Text size='3' color='gray'>
          {`Buscando por "${query}"${!loading && !error && hasResult ? ` • ${itemsCount} items encontrados` : ''}`}
        </Text>
      </Box>
    </Flex>
  );
}
