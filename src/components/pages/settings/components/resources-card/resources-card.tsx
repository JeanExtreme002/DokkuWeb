import { Link } from '@mui/material';
import { Badge, Box, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';

import { AppIcon, DotIcon, NetworkIcon, ServiceIcon } from '@/components';
import { config } from '@/lib';

import { QuotaInfo } from '../../types';

interface ResourcesCardProps {
  quota: QuotaInfo | null;
  loading: boolean;
  error: string | null;
}

export function ResourcesCard({ quota, loading, error }: ResourcesCardProps) {
  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, var(--gray-1) 0%, var(--gray-2) 100%)',
        border: '1px solid var(--gray-6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <Flex direction='column' gap='4' style={{ padding: '8px' }}>
        <Flex align='center' gap='3'>
          <Heading size='5' weight='bold' style={{ color: 'var(--gray-12)' }}>
            Limites de Recursos
          </Heading>
        </Flex>

        <Separator size='4' style={{ margin: '0' }} />

        {loading && (
          <Flex align='center' gap='3' style={{ padding: '20px 0' }}>
            <Text
              size='3'
              style={{
                color: 'var(--gray-11)',
                fontStyle: 'italic',
              }}
            >
              Carregando informações de recursos...
            </Text>
          </Flex>
        )}

        {error && (
          <Flex
            align='center'
            gap='3'
            style={{
              padding: '16px',
              backgroundColor: 'var(--red-2)',
              borderRadius: '8px',
              border: '1px solid var(--red-6)',
            }}
          >
            <Box
              style={{
                color: 'var(--red-11)',
                display: 'flex',
                alignItems: 'center',
                height: '24px',
              }}
            >
              <DotIcon />
            </Box>
            <Text size='3' style={{ color: 'var(--red-11)' }}>
              {error}
            </Text>
          </Flex>
        )}

        {quota && !loading && !error && (
          <Flex direction='column' gap='4'>
            <Box
              style={{
                padding: '16px',
                backgroundColor: 'var(--blue-2)',
                borderRadius: '12px',
                border: '1px solid var(--blue-6)',
              }}
            >
              <Flex justify='between' align='center'>
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--blue-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '24px',
                    }}
                  >
                    <AppIcon />
                  </Box>
                  <Text size='4' weight='medium' style={{ color: 'var(--blue-12)' }}>
                    Aplicativos
                  </Text>
                </Flex>
                <Badge
                  size='2'
                  style={{
                    backgroundColor: 'var(--blue-9)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                  }}
                >
                  {quota.apps_quota}
                </Badge>
              </Flex>
            </Box>

            <Box
              style={{
                padding: '16px',
                backgroundColor: 'var(--purple-2)',
                borderRadius: '12px',
                border: '1px solid var(--purple-6)',
              }}
            >
              <Flex justify='between' align='center'>
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--purple-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '24px',
                    }}
                  >
                    <ServiceIcon />
                  </Box>
                  <Text size='4' weight='medium' style={{ color: 'var(--purple-12)' }}>
                    Serviços
                  </Text>
                </Flex>
                <Badge
                  size='2'
                  style={{
                    backgroundColor: 'var(--purple-9)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                  }}
                >
                  {quota.services_quota}
                </Badge>
              </Flex>
            </Box>

            <Box
              style={{
                padding: '16px',
                backgroundColor: 'var(--green-2)',
                borderRadius: '12px',
                border: '1px solid var(--green-6)',
              }}
            >
              <Flex justify='between' align='center'>
                <Flex align='center' gap='3'>
                  <Box
                    style={{
                      color: 'var(--green-11)',
                      display: 'flex',
                      alignItems: 'center',
                      height: '24px',
                    }}
                  >
                    <NetworkIcon />
                  </Box>
                  <Text size='4' weight='medium' style={{ color: 'var(--green-12)' }}>
                    Redes
                  </Text>
                </Flex>
                <Badge
                  size='2'
                  style={{
                    backgroundColor: 'var(--green-9)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                  }}
                >
                  {quota.networks_quota}
                </Badge>
              </Flex>
            </Box>
          </Flex>
        )}

        <Box style={{ marginTop: '8px' }}>
          <Link
            href={config.support.url}
            underline='hover'
            sx={{ fontSize: '14px', color: 'var(--gray-11)' }}
          >
            Precisa aumentar o limite? Acesse o {config.support.name}.
          </Link>
        </Box>
      </Flex>
    </Card>
  );
}
