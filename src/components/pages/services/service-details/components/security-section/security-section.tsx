import { CopyIcon, EyeClosedIcon, EyeOpenIcon, TrashIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Flex, Heading, Text, TextArea } from '@radix-ui/themes';

import { DotIcon } from '@/components/shared/icons';
import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

interface SecuritySectionProps {
  errorMessage: string | null;
  serviceUri: string | null;
  showUri: boolean;
  toggleShowUri: () => void;
  copyUri: () => void;
  isXsScreen: boolean;
  isSmScreen: boolean;
  openDeleteModal: () => void;
}

export function SecuritySection({
  errorMessage,
  serviceUri,
  showUri,
  toggleShowUri,
  copyUri,
  isXsScreen,
  isSmScreen,
  openDeleteModal,
}: SecuritySectionProps) {
  const { t } = usePageTranslation();
  return (
    <Flex direction='column' gap='4'>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        {t('services.s.security.uri.title')}
      </Heading>

      {errorMessage ? (
        <Card
          style={{
            border: '1px solid var(--red-6)',
            backgroundColor: 'var(--red-2)',
            padding: '20px',
          }}
        >
          <Flex align='center' gap='3'>
            <Box style={{ color: 'var(--red-11)' }}>
              <DotIcon />
            </Box>
            <Text size='3' style={{ color: 'var(--red-11)' }}>
              {errorMessage}
            </Text>
          </Flex>
        </Card>
      ) : (
        <Card
          style={{
            border: '1px solid var(--amber-6)',
            backgroundColor: 'var(--amber-2)',
            padding: '20px',
          }}
        >
          <Flex direction='column' gap='4'>
            <Text size='2' className={styles.uriWarningText} style={{ color: 'var(--amber-11)' }}>
              {t('services.s.security.uri.warning')}
            </Text>

            <Flex gap='3' align='center'>
              <TextArea
                value={
                  showUri
                    ? serviceUri || ''
                    : isXsScreen
                      ? '••••••••••••••••••••••••••'
                      : isSmScreen
                        ? '•••••••••••••••••••••••••••••••••••••'
                        : '••••••••••••••••••••••••••••••••••••••••••••'
                }
                readOnly
                className={styles.uriTextArea}
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  minHeight: '60px',
                  backgroundColor: 'var(--gray-1)',
                  border: 'none',
                  resize: 'none',
                }}
              />

              <Flex direction='column' gap='2' className={styles.uriButtons}>
                <Button
                  size='2'
                  variant='soft'
                  className={styles.uriButton}
                  onClick={toggleShowUri}
                >
                  {showUri ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </Button>
                <Button
                  size='2'
                  variant='soft'
                  className={styles.uriButton}
                  onClick={copyUri}
                  disabled={!serviceUri}
                >
                  <CopyIcon />
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Danger Zone */}
      <Box style={{ marginTop: '45px' }}>
        <Heading size='5' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
          {t('services.s.security.danger.title')}
        </Heading>
        <Card
          style={{
            border: '1px solid var(--red-6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '16px',
            background: 'var(--red-2)',
          }}
        >
          <Flex align='center' justify='between' gap='4' className={styles.dangerZoneHeader}>
            <Flex direction='column' gap='1'>
              <Text size='3' weight='bold' style={{ color: 'var(--gray-12)', display: 'block' }}>
                {t('services.s.security.danger.deleteTitle')}
              </Text>
              <Text size='2' style={{ color: 'var(--gray-11)', display: 'block' }}>
                {t('services.s.security.danger.deleteDescription')}
              </Text>
            </Flex>
            <Button
              size='2'
              onClick={openDeleteModal}
              style={{
                background: 'var(--gray-4)',
                color: 'var(--red-9)',
                border: '1px solid var(--gray-7)',
              }}
              className={styles.dangerZoneButton}
            >
              <TrashIcon />
              {t('services.s.security.danger.deleteButton')}
            </Button>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}
