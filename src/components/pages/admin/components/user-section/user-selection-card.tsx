import { ExclamationTriangleIcon, InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
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
import { useState } from 'react';

import { AppIcon, NetworkIcon, ServiceIcon } from '@/components';
import { TakeoverIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

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
  onOpenDeleteModal: () => void;
  onOwnershipAction: (action: 'link' | 'unlink', appName: string) => Promise<void>;
  ownershipError: string | null;
  onClearOwnershipError: () => void;
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
    onOpenDeleteModal,
    onOwnershipAction,
    ownershipError,
    onClearOwnershipError,
  } = props;
  const { t } = usePageTranslation();
  const [ownershipAppName, setOwnershipAppName] = useState('');
  const [ownershipAction, setOwnershipAction] = useState<'link' | 'unlink' | null>(null);

  const handleOwnershipAction = async (action: 'link' | 'unlink') => {
    const appName = ownershipAppName.trim();
    if (!userQuota?.email || !appName || ownershipAction) return;

    setOwnershipAction(action);
    try {
      await onOwnershipAction(action, appName);
    } catch (error) {
      console.error('Error updating app ownership:', error);
    } finally {
      setOwnershipAction(null);
    }
  };

  return (
    <Flex direction='column' gap='4' style={{ padding: '12px' }}>
      <Flex align='center' gap='3'>
        <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
          {t('admin.users.selection.title')}
        </Heading>
        <Tooltip content={t('admin.users.selection.tooltip')}>
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
            placeholder={
              usersListLoading
                ? t('admin.users.selection.select.placeholder_loading')
                : t('admin.users.selection.select.placeholder')
            }
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
          {userQuotaLoading
            ? t('admin.users.selection.search.button_searching')
            : t('admin.users.selection.search.button')}
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
                <Flex className={styles.criticalUserControls}>
                  <Flex align='center' gap='3' className={styles.adminSwitchRow}>
                    <Text size='2' style={{ color: 'var(--gray-11)' }}>
                      {t('admin.users.details.admin_label')}
                    </Text>
                    <Switch
                      style={{ cursor: 'pointer' }}
                      checked={!!selectedUserIsAdmin}
                      onCheckedChange={(checked) => onRequestAdminChange(!!checked)}
                      disabled={toggleAdminLoading || selectedUserIsAdmin === null}
                    />
                  </Flex>
                  <Flex>
                    <Button
                      size='1'
                      color='red'
                      variant='surface'
                      className={styles.mobileDeleteUserButton}
                      onClick={onOpenDeleteModal}
                      disabled={!userQuota?.email}
                    >
                      <ExclamationTriangleIcon />
                      {t('admin.users.details.delete.button')}
                    </Button>
                  </Flex>
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
                  {t('admin.users.details.takeover_button')}
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
                    {t('admin.users.details.apps_label')}
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
                    {t('admin.users.details.services_label')}
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
                    {t('admin.users.details.networks_label')}
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
            <Flex direction='column' gap='3' style={{ marginBlock: '8px' }}>
              <Flex align='center' gap='2'>
                <Heading size='2' weight='medium' style={{ color: 'var(--gray-12)' }}>
                  {t('admin.users.details.set_app_ownership.title')}
                </Heading>
                <Tooltip content={t('admin.users.details.set_app_ownership.description')}>
                  <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
                </Tooltip>
              </Flex>
              <Flex className={styles.ownershipInput} align='center' gap='2'>
                <Flex direction='column' style={{ flex: 1, minWidth: '190px' }}>
                  <TextField.Root
                    value={ownershipAppName}
                    onChange={(e) => {
                      if (ownershipError) onClearOwnershipError();
                      setOwnershipAppName(e.target.value);
                    }}
                    placeholder={t('admin.users.details.set_app_ownership.input_placeholder')}
                    disabled={!userQuota?.email}
                  />
                </Flex>
                <Flex gap='2' align='center'>
                  <Button
                    size='2'
                    variant='surface'
                    onClick={() => handleOwnershipAction('link')}
                    disabled={
                      !userQuota?.email || !ownershipAppName.trim() || ownershipAction !== null
                    }
                  >
                    {ownershipAction === 'link' && <ReloadIcon className={styles.buttonSpinner} />}
                    {ownershipAction === 'link'
                      ? t('admin.users.details.set_app_ownership.linking')
                      : t('admin.users.details.set_app_ownership.link')}
                  </Button>
                  <Button
                    size='2'
                    variant='surface'
                    color='red'
                    onClick={() => handleOwnershipAction('unlink')}
                    disabled={
                      !userQuota?.email || !ownershipAppName.trim() || ownershipAction !== null
                    }
                  >
                    {ownershipAction === 'unlink' && (
                      <ReloadIcon className={styles.buttonSpinner} />
                    )}
                    {ownershipAction === 'unlink'
                      ? t('admin.users.details.set_app_ownership.unlinking')
                      : t('admin.users.details.set_app_ownership.unlink')}
                  </Button>
                </Flex>
              </Flex>
              {ownershipError && (
                <Text size='2' style={{ color: 'var(--red-11)' }}>
                  {ownershipError}
                </Text>
              )}
            </Flex>
            <Flex className={styles.resourcesButtons}>
              <Button
                size='2'
                color='red'
                variant='surface'
                onClick={onOpenDeleteModal}
                className={styles.deleteUserButton}
                disabled={!userQuota?.email}
              >
                <ExclamationTriangleIcon />
                {t('admin.users.details.delete.button')}
              </Button>
              <Flex gap='2'>
                {!editMode ? (
                  <Button
                    variant='outline'
                    color='orange'
                    size='2'
                    style={{ cursor: 'pointer' }}
                    onClick={onStartEdit}
                  >
                    {t('admin.users.details.edit.button_edit')}
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
                      {t('admin.users.details.edit.button_cancel')}
                    </Button>
                    <Button
                      color='orange'
                      size='2'
                      style={{ cursor: 'pointer' }}
                      onClick={onSaveEdit}
                      disabled={updateLoading}
                    >
                      {updateLoading
                        ? t('admin.users.details.edit.button_save_saving')
                        : t('admin.users.details.edit.button_save')}
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Box>
      )}
    </Flex>
  );
}
