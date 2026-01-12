import { Box, Heading, Text } from '@radix-ui/themes';

export function HeaderSection() {
  return (
    <Box>
      <Heading
        size='7'
        weight='medium'
        style={{
          color: 'var(--gray-12)',
          marginBottom: '4px',
        }}
      >
        Criar novo aplicativo
      </Heading>
      <Text size='3' color='gray'>
        Configure seu novo aplicativo Dokku
      </Text>
    </Box>
  );
}
