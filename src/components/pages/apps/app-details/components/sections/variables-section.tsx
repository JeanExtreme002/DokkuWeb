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
}

export function VariablesSection(props: VariablesSectionProps) {
  return (
    <Box>
      <Flex
        justify='between'
        align='center'
        className={styles.envHeader}
        style={{ marginBottom: '20px' }}
      >
        <Heading size='5'>Variáveis de Ambiente</Heading>
        <Flex align='center' gap='2' className={styles.envActions}>
          <Button
            className={styles.envExportButton}
            variant='outline'
            style={{ cursor: 'pointer' }}
            onClick={props.onOpenImport}
            disabled={props.envImportLoading}
            title='Importar variáveis de um arquivo (.env, .json, .yml)'
          >
            <UploadIcon />
            Importar
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={styles.envExportTrigger}>
              <Button
                className={`${styles.envExportButton} ${styles.envExportButtonOrange}`}
                variant='outline'
                disabled={props.configLoading}
                title='Exportar variáveis de ambiente'
              >
                <DownloadIcon />
                Exportar
                <ChevronDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Exportar como:</DropdownMenu.Label>
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
          <Text style={{ marginLeft: '12px' }}>Carregando variáveis...</Text>
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
                Chave
              </Text>
              <TextField.Root
                placeholder='NOME_VARIAVEL'
                value={props.newEnvKey}
                onChange={(e) => props.setNewEnvKey(e.target.value.replace(/\s/g, ''))}
                disabled={props.envSubmitting}
              />
            </Box>

            <Box style={{ flex: 1 }}>
              <Text size='2' style={{ marginBottom: '4px' }}>
                Valor
              </Text>
              <TextField.Root
                placeholder='valor_da_variavel'
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
                {props.envSubmitting ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </Box>
          </Box>

          {/* Environment Variables List */}
          <Box>
            {Object.keys(props.config).length === 0 ? (
              <Text color='gray'>Nenhuma variável de ambiente configurada.</Text>
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
                        aria-label={`Editar variável ${key}`}
                      >
                        <Pencil1Icon />
                        <span className={styles.editText}>editar</span>
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
                            onChange={(e) => props.setNewEnvValue(e.target.value)}
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
                            Cancelar
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
                              'Salvar'
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
