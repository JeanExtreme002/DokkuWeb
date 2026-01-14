import { InfoCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Heading, Text, Tooltip } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../admin.module.css';

interface AdminUsersCardProps {
  adminUsers: string[];
  adminUsersLoading: boolean;
  adminUsersError: string | null;
  onRemoveAdmin: (email: string) => void;
}

export function AdminUsersCard({
  adminUsers,
  adminUsersLoading,
  adminUsersError,
  onRemoveAdmin,
}: AdminUsersCardProps) {
  const { t } = usePageTranslation();
  return (
    <Card
      style={{
        border: '1px solid var(--amber-6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginTop: '12px',
      }}
    >
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center'>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              {t('admin.users.admin_list.title')}
            </Heading>
            <Tooltip content={t('admin.users.admin_list.tooltip')}>
              <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
            </Tooltip>
          </Flex>
        </Flex>

        {adminUsersError && (
          <Text size='2' style={{ color: 'var(--red-11)' }}>
            {adminUsersError}
          </Text>
        )}

        {adminUsersLoading ? (
          <Text size='2' style={{ color: 'var(--gray-11)' }}>
            {t('admin.users.admin_list.loading')}
          </Text>
        ) : adminUsers.length === 0 ? (
          <Text size='2' style={{ color: 'var(--gray-11)' }}>
            {t('admin.users.admin_list.empty')}
          </Text>
        ) : (
          <Flex direction='column' gap='2'>
            {adminUsers.map((email) => (
              <Flex
                key={email}
                justify='between'
                align='center'
                style={{
                  border: '1px solid var(--gray-6)',
                  borderRadius: 8,
                  padding: 8,
                  backgroundColor: 'var(--gray-1)',
                }}
              >
                <Text
                  size='3'
                  style={{ color: 'var(--gray-12)' }}
                  className={styles.adminListItemEmail}
                >
                  {email}
                </Text>
                <Button
                  variant='surface'
                  color='red'
                  size='2'
                  className={styles.adminListItemButton}
                  onClick={() => onRemoveAdmin(email)}
                >
                  <TrashIcon />
                </Button>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
