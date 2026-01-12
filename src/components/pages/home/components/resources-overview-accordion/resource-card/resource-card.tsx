import { ArrowRightIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { Badge, Box, Flex, Text } from '@radix-ui/themes';

import styles from '../../../home.module.css';

type ResourceType = 'apps' | 'services' | 'networks';

interface Item {
  name: string;
  type?: string;
}

interface ResourceCardProps {
  type: ResourceType;
  title: string;
  count: number;
  icon: React.ReactNode;
  detailIcon: React.ReactNode;
  items: Item[];
  onClick: () => void;
}

export function ResourceCard(props: ResourceCardProps) {
  const { type, title, count, icon, detailIcon, items, onClick } = props;

  const emptyMessage =
    type === 'apps'
      ? 'Nenhum aplicativo criado ainda'
      : type === 'services'
        ? 'Nenhum serviço criado ainda'
        : 'Nenhuma rede criada ainda';

  return (
    <Box className={styles.resourceCard} onClick={onClick}>
      <Flex align='center' justify='between' mb='3'>
        <Flex align='center' gap='3'>
          <div className={styles.resourceIcon} data-type={type}>
            {icon}
          </div>
          <Box>
            <Flex align='center' gap='2' mb='1'>
              <Text size='3' weight='bold' className={styles.resourceTitle}>
                {title}
              </Text>
            </Flex>
            <Flex align='center' gap='2'>
              {detailIcon}
              <Text size='1' className={styles.resourceCount}>
                {count} total
              </Text>
            </Flex>
          </Box>
        </Flex>
        <ArrowRightIcon width='16' height='16' style={{ color: 'var(--gray-9)' }} />
      </Flex>

      <Box className={styles.resourceList}>
        {items.length > 0 ? (
          <>
            {items.slice(0, 3).map((item, idx) => (
              <Flex key={idx} align='center' gap='2' className={styles.resourceListItem}>
                <div className={styles.statusIndicator} data-status='active' />
                <Text size='2' className={styles.resourceName}>
                  {item.name}
                </Text>
                {type === 'services' && item.type && (
                  <Badge color='purple' variant='soft' size='1' className={styles.serviceTypeBadge}>
                    {item.type}
                  </Badge>
                )}
              </Flex>
            ))}
            {items.length > 3 && (
              <Text size='1' className={styles.moreItems}>
                +{items.length - 3} mais
              </Text>
            )}
          </>
        ) : (
          <Flex
            direction='column'
            align='center'
            justify='center'
            gap='2'
            py='4'
            style={{ opacity: 0.6 }}
          >
            <Box
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'var(--gray-3)',
              }}
            >
              <CrossCircledIcon width='24' height='24' style={{ color: 'var(--gray-8)' }} />
            </Box>
            <Text size='2' weight='medium' style={{ color: 'var(--gray-10)', textAlign: 'center' }}>
              {emptyMessage}
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
