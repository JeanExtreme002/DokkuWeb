import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import React from 'react';

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
        Informações do Aplicativo
      </Heading>

      {appInfo.info_origin === 'inspect'
        ? (() => {
            const containers = appInfo.data as AppContainer[];
            const c = containers[0];
            return (
              <Flex direction='column' gap='4'>
                {renderRow('Container ID', c?.Id?.substring(0, 12) || 'N/A')}
                {renderRow('Imagem', c?.Config?.Image || 'N/A')}
                {renderRow('Status', c?.State?.Status || 'N/A')}
                {renderRow('IP Address', c?.NetworkSettings?.Networks?.bridge?.IPAddress || 'N/A')}
                {renderRow('Gateway', c?.NetworkSettings?.Networks?.bridge?.Gateway || 'N/A')}
                {renderRow(
                  'MAC Address',
                  c?.NetworkSettings?.Networks?.bridge?.MacAddress || 'N/A'
                )}
                {renderRow('PID', c?.State?.Pid ?? 'N/A')}

                {/* Deploy info (compact) */}
                {deployInfo && (
                  <>
                    {renderRow('Git Branch', deployInfo['Git deploy branch'] || 'N/A')}
                    {renderRow('Git SHA', deployInfo['Git sha'] || 'N/A')}
                  </>
                )}

                {/* Builder info (compact) */}
                {builderInfo && (
                  <>
                    {renderRow('Builder', builderInfo.builder_computed_selected || 'Padrão')}
                    {builderInfo.builder_computed_build_dir &&
                      renderRow('Build Directory', builderInfo.builder_computed_build_dir)}
                  </>
                )}
              </Flex>
            );
          })()
        : (() => {
            const report = appInfo.data as AppReportData;
            return (
              <Flex direction='column' gap='4'>
                {renderRow('Implantado', report.deployed === 'true' ? 'Sim' : 'Não')}
                {renderRow('Processos', report.processes)}
                {renderRow('Em execução', report.running === 'true' ? 'Sim' : 'Não')}
                {renderRow('Política de Restart', report.ps_restart_policy)}
                {renderRow('Pode Escalar', report.ps_can_scale === 'true' ? 'Sim' : 'Não')}
                {renderRow('Procfile Path', report.ps_procfile_path || 'N/A')}
              </Flex>
            );
          })()}
    </Box>
  );
}
