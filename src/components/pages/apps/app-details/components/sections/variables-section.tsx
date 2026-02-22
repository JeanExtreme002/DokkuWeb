import {
  ChevronDownIcon,
  DownloadIcon,
  Pencil1Icon,
  PlusIcon,
  ReloadIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import { Box, Button, Card, DropdownMenu, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

interface VariablesSectionProps {
  config: Record<string, string>;
  configLoading: boolean;
  errorsConfig: string | null;
  newEnvKey: string;
  newEnvValue: string;
  envSubmitting: boolean;
  envImportLoading: boolean;
  editingEnvKey: string | null;
  editingEnvValue: string;
  savingEnv: boolean;
  deletingEnv: string | null;
  addEnvironmentVariable: () => void;
  startEditEnvVar: (key: string, currentValue: string) => void;
  cancelEditEnvVar: () => void;
  saveEditedEnvironmentVariable: () => void;
  openDeleteEnvModal: (key: string) => void;
  exportEnvAsENV: () => void;
  exportEnvAsJSON: () => void;
  exportEnvAsYML: () => void;
  onOpenImport: () => void;
  setNewEnvKey: (val: string) => void;
  setNewEnvValue: (val: string) => void;
  setEditingEnvValue: (val: string) => void;
}

export function VariablesSection(props: VariablesSectionProps) {
  const { t } = usePageTranslation();
  return (
    <Box>
      <Flex
        justify='between'
        align='center'
        className={styles.envHeader}
        style={{ marginBottom: '20px' }}
      >
        <Heading size='5'>{t('envSection.title')}</Heading>
        <Flex align='center' gap='2' className={styles.envActions}>
          <Button
            className={styles.envExportButton}
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={props.onOpenImport}
            disabled={props.envImportLoading}
            title={t('envSection.importTooltip')}
          >
            <UploadIcon />
            {t('envSection.import')}
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={styles.envExportTrigger}>
              <Button
                className={`${styles.envExportButton} ${styles.envExportButtonOrange}`}
                variant='outline'
                disabled={props.configLoading}
                title={t('envSection.exportTooltip')}
              >
                <DownloadIcon />
                {t('envSection.export')}
                <ChevronDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>{t('envSection.exportAs')}</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.exportEnvAsENV}>
                .ENV
              </DropdownMenu.Item>
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.exportEnvAsJSON}>
                .JSON
              </DropdownMenu.Item>
              <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={props.exportEnvAsYML}>
                .YML
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      {props.configLoading ? (
        <Box className={styles.loadingSpinner}>
          <Box className={styles.spinner}></Box>
          <Text style={{ marginLeft: '12px' }}>{t('envSection.loading')}</Text>
        </Box>
      ) : props.errorsConfig ? (
        <Box className={styles.errorMessage}>
          <Text>{props.errorsConfig}</Text>
        </Box>
      ) : (
        <Box>
          {/* Add Environment Variable Form */}
          <Box className={styles.envVarForm}>
            <Box style={{ flex: 1 }}>
              <Text size='2' style={{ marginBottom: '4px' }}>
                {t('envSection.keyLabel')}
              </Text>
              <TextField.Root
                placeholder={t('envSection.keyPlaceholder')}
                value={props.newEnvKey}
                onChange={(e) => props.setNewEnvKey(e.target.value.replace(/\s/g, ''))}
                disabled={props.envSubmitting}
              />
            </Box>

            <Box style={{ flex: 1 }}>
              <Text size='2' style={{ marginBottom: '4px' }}>
                {t('envSection.valueLabel')}
              </Text>
              <TextField.Root
                placeholder={t('envSection.valuePlaceholder')}
                value={props.newEnvValue}
                onChange={(e) => props.setNewEnvValue(e.target.value)}
                disabled={props.envSubmitting}
              />
            </Box>

            <Box>
              <div style={{ marginBottom: '20px' }}></div>
              <Button
                className={styles.envVarButton}
                onClick={props.addEnvironmentVariable}
                disabled={
                  !props.newEnvKey.trim() || !props.newEnvValue.trim() || props.envSubmitting
                }
                style={{ background: 'var(--green-9)', border: 'none', color: 'white' }}
              >
                <PlusIcon />
                {props.envSubmitting ? t('envSection.adding') : t('envSection.add')}
              </Button>
            </Box>
          </Box>

          {/* Environment Variables List */}
          <Box>
            {Object.keys(props.config).length === 0 ? (
              <Text color='gray'>{t('envSection.empty')}</Text>
            ) : (
              Object.entries(props.config).map(([key, value]) => (
                <Card key={key} className={styles.envVarCard}>
                  <Flex align='center' className={styles.envVarContent} style={{ flex: 1 }}>
                    <Flex align='center' gap='2'>
                      <Text className={styles.envVarKey} style={{ marginRight: 0 }}>
                        {key}
                      </Text>
                      <Button
                        size='1'
                        variant='ghost'
                        style={{
                          background: 'transparent',
                          color: 'var(--gray-9)',
                          border: 'none',
                          boxShadow: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => props.startEditEnvVar(key, String(value))}
                        disabled={props.savingEnv && props.editingEnvKey === key}
                        aria-label={t('envSection.editAria', { key })}
                      >
                        <Pencil1Icon />
                        <span className={styles.editText}>{t('envSection.edit')}</span>
                      </Button>
                    </Flex>

                    {props.editingEnvKey === key ? (
                      <>
                        <Flex align='center' gap='1' style={{ width: '100%', marginTop: '8px' }}>
                          <Text size='2' color='gray'>
                            =
                          </Text>
                          <TextField.Root
                            value={props.editingEnvValue}
                            onChange={(e) => props.setEditingEnvValue(e.target.value)}
                            style={{ flex: 1 }}
                            disabled={props.savingEnv}
                          />
                        </Flex>
                        <Flex gap='2' style={{ marginTop: '10px' }}>
                          <Button
                            variant='soft'
                            color='gray'
                            style={{ cursor: 'pointer' }}
                            onClick={props.cancelEditEnvVar}
                            disabled={props.savingEnv}
                          >
                            {t('envSection.cancel')}
                          </Button>
                          <Button
                            onClick={props.saveEditedEnvironmentVariable}
                            disabled={!props.editingEnvValue.trim() || props.savingEnv}
                            style={{
                              background: 'var(--green-9)',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            {props.savingEnv ? (
                              <ReloadIcon className={styles.buttonSpinner} />
                            ) : (
                              t('envSection.save')
                            )}
                          </Button>
                        </Flex>
                      </>
                    ) : (
                      <Flex align='center' gap='1'>
                        <Text size='2' color='gray'>
                          =
                        </Text>
                        <Text className={styles.envVarValue}>{value as unknown as string}</Text>
                      </Flex>
                    )}
                  </Flex>
                  <Button
                    size='2'
                    color='red'
                    variant='ghost'
                    style={{ cursor: 'pointer' }}
                    onClick={() => props.openDeleteEnvModal(key)}
                    disabled={props.deletingEnv === key}
                  >
                    {props.deletingEnv === key ? (
                      <ReloadIcon className={styles.buttonSpinner} />
                    ) : (
                      <TrashIcon />
                    )}
                  </Button>
                </Card>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default VariablesSection;
