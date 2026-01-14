import { Button, Dialog, Flex } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

interface AdminPrivilegeConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmail?: string;
  pendingAdminValue: boolean | null;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}

export function AdminPrivilegeConfirmModal({
  open,
  onOpenChange,
  targetEmail,
  pendingAdminValue,
  onConfirm,
  loading,
}: AdminPrivilegeConfirmModalProps) {
  const { t } = usePageTranslation();
  const description = pendingAdminValue
    ? t('admin.users.admin_privilege.modal.description.grant', { email: targetEmail })
    : t('admin.users.admin_privilege.modal.description.revoke', { email: targetEmail });
  const descriptionParts = description.split('\n');

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const renderWithEmphasis = (part: string) => {
    if (targetEmail) {
      const email = String(targetEmail);
      const emailSplitRe = new RegExp(`(${escapeRegExp(email)})`, 'gi');
      const emailTestRe = new RegExp(escapeRegExp(email), 'i');
      const segments = part.split(emailSplitRe);
      return (
        <span>
          {segments.map((seg, i) =>
            emailTestRe.test(seg) ? <strong key={`em-${i}`}>{seg}</strong> : seg
          )}
        </span>
      );
    }
    return <span>{part}</span>;
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          {t('admin.users.admin_privilege.modal.title')}
        </Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {descriptionParts.map((part, idx) => (
            <span key={idx}>
              {renderWithEmphasis(part)}
              {idx < descriptionParts.length - 1 ? <br /> : null}
            </span>
          ))}
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('admin.users.admin_privilege.modal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={loading}
            style={{ backgroundColor: 'var(--red-9)', color: 'white', cursor: 'pointer' }}
          >
            {t('admin.users.admin_privilege.modal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
