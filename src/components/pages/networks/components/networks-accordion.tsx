import * as Accordion from '@radix-ui/react-accordion';
import { Box, Heading, Text } from '@radix-ui/themes';

import {
  AppIcon,
  ChevronDownIcon,
  EyeIcon,
  LinkIcon,
  NetworkIcon,
  TrashIcon,
} from '@/components/shared/icons';

import styles from '../networks.module.css';

interface NetworksAccordionProps {
  networksList: string[];
  linkedApps: Record<string, string[]>;
  expandedNetwork: string | null;
  onExpandedChange: (value: string | null) => void;
  newAppName: Record<string, string>;
  setNewAppName: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  actionLoading: Record<string, boolean>;
  onLinkApp: (networkName: string) => void;
  onViewApp: (appName: string) => void;
  onOpenUnlink: (networkName: string, appName: string) => void;
  onOpenDelete: (networkName: string) => void;
}

export function NetworksAccordion({
  networksList,
  linkedApps,
  expandedNetwork,
  onExpandedChange,
  newAppName,
  setNewAppName,
  actionLoading,
  onLinkApp,
  onViewApp,
  onOpenUnlink,
  onOpenDelete,
}: NetworksAccordionProps) {
  return (
    <Accordion.Root
      type='single'
      collapsible
      className={styles.networksAccordion}
      value={expandedNetwork || ''}
      onValueChange={(value) => onExpandedChange(value || null)}
    >
      {networksList.map((networkName) => {
        const apps = linkedApps[networkName] || [];

        return (
          <Accordion.Item key={networkName} value={networkName} className={styles.networkItem}>
            <Accordion.Trigger className={styles.networkTrigger}>
              <Box className={styles.networkIcon}>
                <NetworkIcon />
              </Box>

              <div className={styles.networkInfo}>
                <Heading
                  size='4'
                  weight='bold'
                  className={styles.networkName}
                  style={{ color: 'var(--gray-12)', marginBottom: '4px' }}
                >
                  {networkName}
                </Heading>
                <Text
                  size='2'
                  className={styles.networkAppsCount}
                  style={{ color: 'var(--gray-10)' }}
                >
                  {apps.length} {apps.length === 1 ? 'app vinculado' : 'apps vinculados'}
                </Text>
              </div>

              <Box className={styles.chevronIcon}>
                <ChevronDownIcon />
              </Box>
            </Accordion.Trigger>

            <Accordion.Content className={styles.networkContent}>
              {/* Link application section */}
              <div className={styles.linkAppSection}>
                <Heading size='3' style={{ marginBottom: '8px', color: 'var(--gray-12)' }}>
                  Vincular Aplicativo
                </Heading>
                <Text
                  size='2'
                  style={{ marginBottom: '16px', color: 'var(--gray-10)', lineHeight: '1.4' }}
                >
                  Aplicativos vinculados à mesma rede podem se comunicar entre si.
                </Text>
                <div className={styles.linkAppForm}>
                  <input
                    type='text'
                    placeholder='Nome do aplicativo'
                    value={newAppName[networkName] || ''}
                    onChange={(e) =>
                      setNewAppName((prev) => ({
                        ...prev,
                        [networkName]: e.target.value,
                      }))
                    }
                    className={styles.linkAppInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onLinkApp(networkName);
                      }
                    }}
                  />
                  <button
                    className={styles.linkButton}
                    onClick={() => onLinkApp(networkName)}
                    disabled={!newAppName[networkName]?.trim() || actionLoading[networkName]}
                  >
                    <LinkIcon />
                    Vincular
                  </button>
                </div>
              </div>

              {/* Linked apps list */}
              <div>
                <Heading size='3' style={{ marginBottom: '12px', color: 'var(--gray-12)' }}>
                  Apps Vinculados ({apps.length})
                </Heading>

                {apps.length === 0 ? (
                  <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
                    Nenhum aplicativo vinculado
                  </Text>
                ) : (
                  <div className={styles.linkedAppsList}>
                    {apps.map((appName) => (
                      <div key={appName} className={styles.linkedAppItem}>
                        <div className={styles.linkedAppIcon}>
                          <AppIcon />
                        </div>
                        <Text size='2' style={{ flex: 1, color: 'var(--gray-12)' }}>
                          {appName}
                        </Text>
                        <button
                          className={styles.viewButton}
                          onClick={() => onViewApp(appName)}
                          title='Ver aplicativo'
                        >
                          <EyeIcon />
                        </button>
                        <button
                          className={styles.unlinkButton}
                          onClick={() => onOpenUnlink(networkName, appName)}
                          title='Desvincular aplicativo'
                        >
                          <TrashIcon />
                          <span>Desvincular</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className={styles.deleteNetworkSection}>
                <Heading size='3' style={{ marginBottom: '12px', color: 'var(--red-11)' }}>
                  Zona de Perigo
                </Heading>
                <button
                  className={styles.deleteNetworkButton}
                  onClick={() => onOpenDelete(networkName)}
                  title='Excluir rede'
                >
                  <TrashIcon />
                  Excluir Rede
                </button>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
