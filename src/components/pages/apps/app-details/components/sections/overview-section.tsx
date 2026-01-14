import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import React from 'react';

import { usePageTranslation } from '@/i18n/utils';

import type {
  AppContainer,
  AppInfo,
  AppReportData,
  BuilderData,
  DeployInfoData,
} from '../../types';

interface OverviewSectionProps {
  appInfo: AppInfo | null;
  deployInfo: DeployInfoData | null;
  builderInfo: BuilderData | null;
}

export default function OverviewSection({
  appInfo,
  deployInfo,
  builderInfo,
}: OverviewSectionProps) {
  const { t } = usePageTranslation();
  if (!appInfo) return null;

  const renderRow = (label: string, value: React.ReactNode) => (
    <Box style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}>
      <Flex
        direction={{ initial: 'column', sm: 'row' }}
        justify={{ sm: 'between' }}
        align={{ sm: 'center' }}
        gap='1'
      >
        <Text size='3' weight='medium' style={{ color: 'var(--gray-11)' }}>
          {label}
        </Text>
        <Text size='3' style={{ color: 'var(--gray-12)', fontFamily: 'monospace' }}>
          {value}
        </Text>
      </Flex>
    </Box>
  );

  return (
    <Box>
      <Heading size='5' style={{ marginBottom: '20px' }}>
        {t('overview.title')}
      </Heading>

      {appInfo.info_origin === 'inspect'
        ? (() => {
            const containers = appInfo.data as AppContainer[];
            const c = containers[0];
            return (
              <Flex direction='column' gap='4'>
                {renderRow(t('overview.labels.containerId'), c?.Id?.substring(0, 12) || 'N/A')}
                {renderRow(t('overview.labels.image'), c?.Config?.Image || 'N/A')}
                {renderRow(t('overview.labels.status'), c?.State?.Status || 'N/A')}
                {renderRow(
                  t('overview.labels.ipAddress'),
                  c?.NetworkSettings?.Networks?.bridge?.IPAddress || 'N/A'
                )}
                {renderRow(
                  t('overview.labels.gateway'),
                  c?.NetworkSettings?.Networks?.bridge?.Gateway || 'N/A'
                )}
                {renderRow(
                  t('overview.labels.macAddress'),
                  c?.NetworkSettings?.Networks?.bridge?.MacAddress || 'N/A'
                )}
                {renderRow(t('overview.labels.pid'), c?.State?.Pid ?? 'N/A')}

                {/* Deploy info (compact) */}
                {deployInfo && (
                  <>
                    {renderRow(
                      t('overview.labels.gitBranch'),
                      deployInfo['Git deploy branch'] || 'N/A'
                    )}
                    {renderRow(t('overview.labels.gitSha'), deployInfo['Git sha'] || 'N/A')}
                  </>
                )}

                {/* Builder info (compact) */}
                {builderInfo && (
                  <>
                    {renderRow(
                      t('overview.labels.builder'),
                      builderInfo.builder_computed_selected || t('overview.values.default')
                    )}
                    {builderInfo.builder_computed_build_dir &&
                      renderRow(
                        t('overview.labels.buildDirectory'),
                        builderInfo.builder_computed_build_dir
                      )}
                  </>
                )}
              </Flex>
            );
          })()
        : (() => {
            const report = appInfo.data as AppReportData;
            return (
              <Flex direction='column' gap='4'>
                {renderRow(
                  t('overview.labels.deployed'),
                  report.deployed === 'true' ? t('overview.values.yes') : t('overview.values.no')
                )}
                {renderRow(t('overview.labels.processes'), report.processes)}
                {renderRow(
                  t('overview.labels.running'),
                  report.running === 'true' ? t('overview.values.yes') : t('overview.values.no')
                )}
                {renderRow(t('overview.labels.restartPolicy'), report.ps_restart_policy)}
                {renderRow(
                  t('overview.labels.canScale'),
                  report.ps_can_scale === 'true'
                    ? t('overview.values.yes')
                    : t('overview.values.no')
                )}
                {renderRow(t('overview.labels.procfilePath'), report.ps_procfile_path || 'N/A')}
              </Flex>
            );
          })()}
    </Box>
  );
}
