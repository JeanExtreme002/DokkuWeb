import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Heading, Select, Switch, Tabs, Text, Tooltip } from '@radix-ui/themes';

import styles from '../../admin.module.css';
import { ResourceItem, ResourcesTable } from './resources-table';

interface ResourcesCardProps {
  resourcesTab: 'apps' | 'services' | 'networks';
  resourcesList: ResourceItem[];
  resourcesLoading: boolean;
  resourcesError: string | null;
  resourcesLimit: number;
  resourcesOffset: number;
  resourcesAscCreatedAt: boolean;
  onChangeTab: (tab: 'apps' | 'services' | 'networks') => void;
  onChangeLimit: (limit: number) => void;
  onChangeOrder: (asc: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
}

export function ResourcesCard(props: ResourcesCardProps) {
  const {
    resourcesTab,
    resourcesList,
    resourcesLoading,
    resourcesError,
    resourcesLimit,
    resourcesAscCreatedAt,
    onChangeTab,
    onChangeLimit,
    onChangeOrder,
    onBack,
    onNext,
    backDisabled,
    nextDisabled,
  } = props;

  return (
    <Card
      style={{
        border: '1px solid var(--amber-6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Flex direction='column' gap='3' style={{ padding: '12px' }}>
        <Flex justify='between' align='center' className={styles.resourcesHeader}>
          <Flex align='center' gap='3'>
            <Heading size='5' weight='medium' style={{ color: 'var(--gray-12)' }}>
              Recursos
            </Heading>
            <Tooltip content='Visualize todos os recursos ativos no sistema'>
              <InfoCircledIcon style={{ color: 'var(--gray-9)' }} />
            </Tooltip>
          </Flex>
          <Flex align='center' gap='2' className={styles.resourcesControlsRow}>
            <Flex align='center' gap='2' className={styles.resourcesFiltersRow}>
              <Text
                size='2'
                style={{ color: 'var(--gray-11)' }}
                className={styles.resourcesLimitLabel}
              >
                Limite:
              </Text>
              <Select.Root
                value={String(resourcesLimit)}
                onValueChange={(value) => {
                  const lim = parseInt(value) || 20;
                  onChangeLimit(lim);
                }}
              >
                <Select.Trigger
                  style={{ width: '70px', cursor: 'pointer' }}
                  className={styles.resourcesLimitSelect}
                />
                <Select.Content>
                  <Select.Group>
                    {[10, 20, 30, 50, 100].map((val) => (
                      <Select.Item key={val} value={String(val)} style={{ cursor: 'pointer' }}>
                        {val}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              <Flex align='center' gap='2' className={styles.resourcesOrderRow}>
                <Switch
                  checked={resourcesAscCreatedAt}
                  onCheckedChange={(checked) => onChangeOrder(!!checked)}
                  className={styles.resourcesOrderSwitch}
                />
                <Text
                  size='2'
                  style={{ color: 'var(--gray-11)' }}
                  className={styles.resourcesOrderLabel}
                >
                  {resourcesAscCreatedAt ? 'Mais recente' : 'Mais antigo'}
                </Text>
              </Flex>
            </Flex>
            <Flex align='center' gap='2' className={styles.resourcesButtonsRow}>
              <Button
                variant='outline'
                onClick={onBack}
                disabled={resourcesLoading || backDisabled}
                style={{ cursor: 'pointer' }}
                className={styles.resourcesNavButton}
              >
                Back
              </Button>
              <Button
                variant='outline'
                onClick={onNext}
                disabled={resourcesLoading || nextDisabled}
                style={{ cursor: 'pointer' }}
                className={styles.resourcesNavButton}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <Tabs.Root
          value={resourcesTab}
          onValueChange={(val) => onChangeTab(val as 'apps' | 'services' | 'networks')}
        >
          <Tabs.List color='orange' className={styles.tabsList}>
            <Tabs.Trigger style={{ cursor: 'pointer' }} value='apps'>
              Aplicativos
            </Tabs.Trigger>
            <Tabs.Trigger style={{ cursor: 'pointer' }} value='services'>
              Serviços
            </Tabs.Trigger>
            <Tabs.Trigger style={{ cursor: 'pointer' }} value='networks'>
              Redes
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value='apps'>
            <ResourcesTable
              typeLabel='Aplicativo'
              resources={resourcesList}
              loading={resourcesLoading}
              error={resourcesError}
            />
          </Tabs.Content>

          <Tabs.Content value='services'>
            <ResourcesTable
              typeLabel='Serviço'
              resources={resourcesList}
              loading={resourcesLoading}
              error={resourcesError}
            />
          </Tabs.Content>

          <Tabs.Content value='networks'>
            <ResourcesTable
              typeLabel='Rede'
              resources={resourcesList}
              loading={resourcesLoading}
              error={resourcesError}
            />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Card>
  );
}
