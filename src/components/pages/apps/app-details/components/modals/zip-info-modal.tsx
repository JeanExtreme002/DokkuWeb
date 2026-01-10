import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes';
import React from 'react';

interface ZipInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleZipFileSelection: () => void;
}

export default function ZipInfoModal(props: ZipInfoModalProps) {
  const { open, onOpenChange, handleZipFileSelection } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title>Deploy via Arquivo ZIP</Dialog.Title>
        <Dialog.Description style={{ marginBottom: '16px' }}>
          Para fazer deploy via arquivo ZIP, o arquivo deve conter:
        </Dialog.Description>

        <Box
          style={{
            padding: '16px',
            background: 'var(--blue-2)',
            border: '1px solid var(--blue-6)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <Flex direction='column' gap='3'>
            <Text size='3' weight='medium' style={{ color: 'var(--blue-12)' }}>
              📁 Estrutura necessária:
            </Text>
            <Box style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div>📦 seu-projeto.zip</div>
              <div>├── 📄 .deployment_token</div>
              <div>├── 📄 app.py (ou seus arquivos)</div>
              <div>├── 📄 requirements.txt</div>
              <div>└── 📁 ... (outros arquivos)</div>
            </Box>
          </Flex>
        </Box>

        <Box
          style={{
            padding: '12px',
            background: 'var(--amber-2)',
            border: '1px solid var(--amber-6)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <Flex align='start' gap='2'>
            <Text style={{ fontSize: '16px' }}>⚠️</Text>
            <Box>
              <Text size='3' weight='medium' style={{ color: 'var(--amber-11)' }}>
                Importante:{' '}
              </Text>
              <Text size='2' style={{ color: 'var(--amber-11)', marginTop: '4px' }}>
                O arquivo <strong>.deployment_token</strong> deve conter exatamente o token da
                aplicação (pode ser encontrado na aba &quot;Segurança&quot;), sem espaços ou quebras
                de linha adicionais.
              </Text>
            </Box>
          </Flex>
        </Box>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray' style={{ cursor: 'pointer' }}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button style={{ cursor: 'pointer' }} onClick={handleZipFileSelection}>
            Escolher arquivo ZIP
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
