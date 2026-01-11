import { Flex, Text } from '@radix-ui/themes';

export function UpdatingIndicator() {
  return (
    <Flex align='center' gap='3'>
      <div
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid var(--gray-6)',
          borderTop: '2px solid var(--gray-9)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <Text size='3' style={{ color: 'var(--gray-11)', fontWeight: '500' }}>
        Sincronizando informações com o servidor...
      </Text>
    </Flex>
  );
}
