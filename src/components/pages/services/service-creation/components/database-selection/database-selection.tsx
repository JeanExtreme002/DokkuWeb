import { Box, Card, Flex, Select, Text } from '@radix-ui/themes';
import Image from 'next/image';
import React from 'react';

export interface DatabaseType {
  name: string;
  displayName: string;
  icon: string;
}

interface DatabaseSelectionProps {
  databases: DatabaseType[];
  databasesLoading: boolean;
  selectedDatabase: string;
  creating: boolean;
  isMobile: boolean;
  onSelect: (name: string) => void;
  gridClassName: string;
  cardClassName: string;
}

export function DatabaseSelection(props: DatabaseSelectionProps) {
  const {
    databases,
    databasesLoading,
    selectedDatabase,
    creating,
    isMobile,
    onSelect,
    gridClassName,
    cardClassName,
  } = props;

  return (
    <>
      <Text size='3' weight='medium' style={{ color: 'var(--gray-12)' }}>
        Tipo de Serviço
      </Text>
      {databasesLoading ? (
        <Box style={{ padding: '12px' }}>
          <Text size='2' color='gray' style={{ fontStyle: 'italic' }}>
            Carregando serviços...
          </Text>
        </Box>
      ) : (
        <>
          {/* Grid for desktop */}
          {!isMobile && (
            <div className={gridClassName}>
              {databases.map((database) => (
                <Card
                  key={database.name}
                  style={{
                    border: `2px solid ${
                      selectedDatabase === database.name ? 'var(--green-8)' : 'var(--gray-6)'
                    }`,
                    backgroundColor:
                      selectedDatabase === database.name
                        ? 'var(--green-2)'
                        : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: '8px',
                  }}
                  className={cardClassName}
                  onClick={() => onSelect(database.name)}
                  onMouseEnter={(e) => {
                    if (selectedDatabase !== database.name) {
                      e.currentTarget.style.borderColor = 'var(--gray-8)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDatabase !== database.name) {
                      e.currentTarget.style.borderColor = 'var(--gray-6)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Flex direction='column' align='center' gap='1'>
                    <Image
                      src={database.icon}
                      alt={`${database.displayName} logo`}
                      width={28}
                      height={28}
                      style={{
                        filter: selectedDatabase === database.name ? 'none' : 'grayscale(0.3)',
                        transition: 'filter 0.2s ease',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/database-logos/generic.svg';
                      }}
                    />
                    <Text
                      size='2'
                      weight='medium'
                      style={{
                        color:
                          selectedDatabase === database.name ? 'var(--green-11)' : 'var(--gray-11)',
                        textAlign: 'center',
                      }}
                    >
                      {database.displayName}
                    </Text>
                  </Flex>
                </Card>
              ))}
            </div>
          )}

          {/* Select for mobile */}
          {isMobile && (
            <Select.Root value={selectedDatabase} onValueChange={onSelect} disabled={creating}>
              <Select.Trigger
                placeholder='Selecione o tipo de banco de dados'
                style={{ maxWidth: '100%' }}
              />
              <Select.Content>
                {databases.map((database) => (
                  <Select.Item key={database.name} value={database.name}>
                    <Flex align='center' gap='2'>
                      <Image
                        src={database.icon}
                        alt={`${database.displayName} logo`}
                        width={16}
                        height={16}
                        onError={(e) => {
                          e.currentTarget.src = '/images/database-logos/generic.svg';
                        }}
                      />
                      {database.displayName}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
        </>
      )}
    </>
  );
}
