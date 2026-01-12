import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Separator,
  Switch,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';

import { AppIcon, NetworkIcon, ServiceIcon } from '@/components';
import { TakeoverIcon } from '@/components/shared/icons';

import styles from '../../admin.module.css';

export interface QuotaInfo {
  apps_quota: number;
  networks_quota: number;
  services_quota: number;
}

export interface UserQuotaInfo extends QuotaInfo {
  email?: string;
}

interface UserSelectionCardProps {
  usersList: string[];
  usersListLoading: boolean;
  selectedUserEmail: string;
  onSelectUser: (email: string) => void;
  onSearch: () => void;
  userQuota: UserQuotaInfo | null;
  userQuotaError: string | null;
  userQuotaLoading: boolean;
  editMode: boolean;
  updateLoading: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  editQuota: QuotaInfo;
  onEditQuotaChange: (partial: Partial<QuotaInfo>) => void;
  selectedUserIsAdmin: boolean | null;
  toggleAdminLoading: boolean;
  onRequestAdminChange: (newVal: boolean) => void;
  onOpenTakeoverModal: () => void;
}

export function UserSelectionCard(props: UserSelectionCardProps) {
  const {
    usersList,
    usersListLoading,
    selectedUserEmail,
    onSelectUser,
    onSearch,
    userQuota,
    userQuotaError,
    userQuotaLoading,
    editMode,
    updateLoading,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    editQuota,
    onEditQuotaChange,
    selectedUserIsAdmin,
    toggleAdminLoading,
    onRequestAdminChange,
    onOpenTakeoverModal,
  } = props;

  return (
    <Flex direction='column' gap='4' style={{ padding: '12px' }}>
      <Flex align='center' gap='3'>
        <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
          Seleção de Usuário
        </Heading>
        <Tooltip content='Selecione o usuário para gerenciar'>
          <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
        </Tooltip>
      </Flex>

      <Flex gap='3' align='center'>
        <Select.Root
          value={selectedUserEmail}
          onValueChange={(value) => onSelectUser(value)}
          disabled={usersListLoading}
        >
          <Select.Trigger
            placeholder={usersListLoading ? 'Carregando usuários...' : 'Selecione um usuário'}
            style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          />
          <Select.Content>
            <Select.Group>
              {usersList.map((email) => (
                <Select.Item style={{ cursor: 'pointer' }} key={email} value={email}>
                  <span className={styles.selectItemEmail}>{email}</span>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
        <Button
          style={{ cursor: 'pointer' }}
          onClick={onSearch}
          disabled={userQuotaLoading || !selectedUserEmail.trim()}
        >
          {userQuotaLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </Flex>

      {userQuotaError && (
        <Flex
          align='center'
          gap='3'
          style={{
            padding: '12px',
            backgroundColor: 'var(--red-2)',
            borderRadius: '8px',
            border: '1px solid var(--red-6)',
          }}
        >
          <Text size='3' style={{ color: 'var(--red-11)' }}>
            {userQuotaError}
          </Text>
        </Flex>
      )}

      {userQuota && (
        <Box
          style={{
            padding: '16px',
            backgroundColor: 'var(--gray-2)',
            borderRadius: '12px',
            border: '1px solid var(--gray-6)',
          }}
        >
          <Flex direction='column' gap='4'>
            <Flex justify='between' align='center' className={styles.userHeader}>
              <Flex align='center' gap='3'>
                <Avatar
                  size='3'
                  className={styles.userAvatar}
                  fallback={userQuota.email?.charAt(0).toUpperCase() || 'U'}
                  radius='full'
                />
                <Text
                  size='3'
                  weight='bold'
                  style={{ color: 'var(--gray-12)' }}
                  className={styles.userEmailText}
                >
                  {userQuota.email}
                </Text>
              </Flex>
              <Separator size='4' className={styles.userControlsSeparator} />
              <Flex className={styles.userControls}>
                <Flex align='center' gap='3' className={styles.adminSwitchRow}>
                  <Text size='2' style={{ color: 'var(--gray-11)' }}>
                    Admin?
                  </Text>
                  <Switch
                    style={{ cursor: 'pointer' }}
                    checked={!!selectedUserIsAdmin}
                    onCheckedChange={(checked) => onRequestAdminChange(!!checked)}
                    disabled={toggleAdminLoading || selectedUserIsAdmin === null}
                  />
                </Flex>
                <Button
                  size='2'
                  color='red'
                  onClick={onOpenTakeoverModal}
                  className={styles.takeoverButton}
                  style={{
                    backgroundColor: 'var(--red-9)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <TakeoverIcon />
                  Takeover
                </Button>
              </Flex>
            </Flex>

            <Separator size='4' />

            <Flex direction='column' gap='3'>
              {/* Applications */}
              <Flex
                justify='between'
                align='center'
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--blue-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--blue-6)',
                }}
              >
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--blue-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '20px',
                    }}
                  >
                    <AppIcon />
                  </Box>
                  <Text
                    size='3'
                    weight='medium'
                    style={{ color: 'var(--blue-12)' }}
                    className={styles.quotaLabel}
                  >
                    Aplicativos
                  </Text>
                </Flex>
                {editMode ? (
                  <TextField.Root
                    type='number'
                    value={editQuota.apps_quota.toString()}
                    onChange={(e) =>
                      onEditQuotaChange({ apps_quota: parseInt(e.target.value) || 0 })
                    }
                    style={{ width: '50px' }}
                  />
                ) : (
                  <Badge
                    size='1'
                    className={styles.quotaValue}
                    style={{ backgroundColor: 'var(--blue-9)', color: 'white' }}
                  >
                    {userQuota.apps_quota}
                  </Badge>
                )}
              </Flex>

              {/* Services */}
              <Flex
                justify='between'
                align='center'
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--purple-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--purple-6)',
                }}
              >
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--purple-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '20px',
                    }}
                  >
                    <ServiceIcon />
                  </Box>
                  <Text
                    size='3'
                    weight='medium'
                    style={{ color: 'var(--purple-12)' }}
                    className={styles.quotaLabel}
                  >
                    Serviços
                  </Text>
                </Flex>
                {editMode ? (
                  <TextField.Root
                    type='number'
                    value={editQuota.services_quota.toString()}
                    onChange={(e) =>
                      onEditQuotaChange({ services_quota: parseInt(e.target.value) || 0 })
                    }
                    style={{ width: '50px' }}
                  />
                ) : (
                  <Badge
                    size='1'
                    className={styles.quotaValue}
                    style={{ backgroundColor: 'var(--purple-9)', color: 'white' }}
                  >
                    {userQuota.services_quota}
                  </Badge>
                )}
              </Flex>

              {/* Networks */}
              <Flex
                justify='between'
                align='center'
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--green-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--green-6)',
                }}
              >
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--green-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '20px',
                    }}
                  >
                    <NetworkIcon />
                  </Box>
                  <Text
                    size='3'
                    weight='medium'
                    style={{ color: 'var(--green-12)' }}
                    className={styles.quotaLabel}
                  >
                    Redes
                  </Text>
                </Flex>
                {editMode ? (
                  <TextField.Root
                    type='number'
                    value={editQuota.networks_quota.toString()}
                    onChange={(e) =>
                      onEditQuotaChange({ networks_quota: parseInt(e.target.value) || 0 })
                    }
                    style={{ width: '50px' }}
                  />
                ) : (
                  <Badge
                    size='1'
                    className={styles.quotaValue}
                    style={{ backgroundColor: 'var(--green-9)', color: 'white' }}
                  >
                    {userQuota.networks_quota}
                  </Badge>
                )}
              </Flex>
            </Flex>

            <Flex justify='end' gap='2'>
              {!editMode ? (
                <Button
                  variant='outline'
                  color='orange'
                  size='2'
                  style={{ cursor: 'pointer' }}
                  onClick={onStartEdit}
                >
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    color='gray'
                    size='2'
                    variant='soft'
                    style={{ cursor: 'pointer' }}
                    onClick={onCancelEdit}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color='orange'
                    size='2'
                    style={{ cursor: 'pointer' }}
                    onClick={onSaveEdit}
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Box>
      )}
    </Flex>
  );
}
