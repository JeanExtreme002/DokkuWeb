import { PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';

export interface ListHeaderProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onCreate: () => void;
  containerClassName?: string;
  buttonClassName?: string;
}

export function ListHeader({
  title,
  subtitle,
  buttonLabel,
  onCreate,
  containerClassName,
  buttonClassName,
}: ListHeaderProps) {
  return (
    <Flex className={containerClassName}>
      <Box>
        <Heading
          size='7'
          weight='medium'
          style={{
            color: 'var(--gray-12)',
            marginBottom: '4px',
          }}
        >
          {title}
        </Heading>
        <Text size='3' color='gray'>
          {subtitle}
        </Text>
      </Box>

      <Button
        size='3'
        onClick={onCreate}
        className={buttonClassName}
        style={{
          background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-10) 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '500',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
        }}
      >
        <PlusIcon />
        {buttonLabel}
      </Button>
    </Flex>
  );
}
