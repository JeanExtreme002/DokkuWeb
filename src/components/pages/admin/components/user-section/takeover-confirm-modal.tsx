import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { usePageTranslation } from '@/i18n/utils';

interface TakeoverConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmail?: string;
  onConfirm: () => void;
  loading: boolean;
}

export function TakeoverConfirmModal({
  open,
  onOpenChange,
  targetEmail,
  onConfirm,
  loading,
}: TakeoverConfirmModalProps) {
  const { t } = usePageTranslation();
  const description = t('admin.users.takeover.modal.description', { email: targetEmail });
  const descriptionParts = description.split('\n');
  const boldPhrase = t('admin.users.takeover.modal.description.bold_phrase');

  const [confirmText, setConfirmText] = useState('');
  const expectedConfirm = 'takeover';

  useEffect(() => {
    if (!open) setConfirmText('');
  }, [open]);

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderWithEmphasis = (part: string) => {
    const phrase = boldPhrase || '';
    const phraseSplitRe = phrase ? new RegExp(`(${escapeRegExp(phrase)})`, 'gi') : null;
    const phraseTestRe = phrase ? new RegExp(escapeRegExp(phrase), 'i') : null;

    const highlightPhrase = (text: string) => {
      if (!phraseSplitRe || !phraseTestRe) return text;
      const segments = text.split(phraseSplitRe);
      return segments.map((seg, i) =>
        phraseTestRe.test(seg) ? <strong key={`bp-${i}`}>{seg}</strong> : seg
      );
    };

    if (targetEmail) {
      const email = String(targetEmail);
      const emailSplitRe = new RegExp(`(${escapeRegExp(email)})`, 'gi');
      const emailTestRe = new RegExp(escapeRegExp(email), 'i');
      const segments = part.split(emailSplitRe);
      return (
        <span>
          {segments.map((seg, i) =>
            emailTestRe.test(seg) ? (
              <strong key={`em-${i}`}>{seg}</strong>
            ) : (
              <span key={`tx-${i}`}>{highlightPhrase(seg)}</span>
            )
          )}
        </span>
      );
    }

    return <span>{highlightPhrase(part)}</span>;
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth='450px' style={{ padding: '24px' }}>
        <Dialog.Title style={{ marginBottom: '12px' }}>
          {t('admin.users.takeover.modal.title')}
        </Dialog.Title>
        <Dialog.Description size='2' mb='4' style={{ color: 'var(--gray-11)' }}>
          {descriptionParts.map((part, idx) => (
            <span key={idx}>
              {renderWithEmphasis(part)}
              {idx < descriptionParts.length - 1 ? <br /> : null}
            </span>
          ))}
        </Dialog.Description>

        <Box style={{ marginTop: '8px' }}>
          <Text size='2' style={{ color: 'var(--gray-11)' }}>
            <Trans
              t={t}
              size='1'
              i18nKey='admin.users.takeover.modal.confirmInstruction'
              values={{ email: expectedConfirm }}
              components={{ strong: <strong /> }}
            />
          </Text>
          <TextField.Root
            placeholder={t('admin.users.takeover.modal.confirmInputPlaceholder')}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              {t('admin.users.takeover.modal.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            color='red'
            onClick={onConfirm}
            disabled={loading || confirmText.trim() !== expectedConfirm}
            style={{ cursor: 'pointer' }}
          >
            {loading
              ? t('admin.users.takeover.modal.confirm_loading')
              : t('admin.users.takeover.modal.confirm')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
