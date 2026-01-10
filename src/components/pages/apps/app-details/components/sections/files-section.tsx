import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import React from 'react';

import styles from '../../app-details.module.css';
import type { DirEntry } from '../../helpers';

interface FilesSectionProps {
  isInspectAvailable: boolean;
  dirLoading: boolean;
  dirError: string | null;
  dirEntries: DirEntry[];
  currentDir: string;
  isTinyScreen: boolean;
  isSmallScreen: boolean;
  onRefresh: () => void;
  onNavigateParent: () => void;
  isAtRoot: () => boolean;
  getWorkingDir: () => string;
  onSetCurrentDir: (path: string) => void;
  onEntryClick: (entry: DirEntry) => void;
  formatSize: (bytes: number) => string;
  pathJoin: (base: string, sub: string) => string;
}

export function FilesSection(props: FilesSectionProps) {
  return (
    <Box>
      <Flex
        justify='between'
        align='center'
        className={styles.filesHeader}
        style={{ marginBottom: '20px' }}
      >
        <Heading size='5' className={styles.filesHeaderTitle}>
          Árvore de Diretórios
        </Heading>
        <Button
          onClick={props.onRefresh}
          disabled={props.dirLoading}
          variant='outline'
          className={styles.filesRefreshButton}
        >
          <ReloadIcon className={props.dirLoading ? styles.buttonSpinner : ''} />
          {props.dirLoading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </Flex>

      {!props.isInspectAvailable ? (
        <Text size='3' style={{ color: 'var(--gray-11)' }}>
          Árvore de diretórios indisponível no momento.
        </Text>
      ) : (
        <Flex direction='column' gap='3'>
          <Flex gap='3' align='center'>
            <Button
              variant='outline'
              size='2'
              color='purple'
              className={styles.backButton}
              onClick={props.onNavigateParent}
              disabled={props.dirLoading || props.isAtRoot()}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M19 12 H5 M12 19 L5 12 L12 5' />
              </svg>
            </Button>
            {/* Clickable path segments (inline) */}
            <Flex align='center' gap='2' style={{ flexWrap: 'wrap' }}>
              <Text size='3' style={{ color: 'var(--gray-9)' }}>
                /
              </Text>
              {(() => {
                const wd = props.getWorkingDir();
                const baseLabel = wd || '.';
                const rel = props.currentDir.startsWith(wd)
                  ? props.currentDir.slice(wd.length)
                  : '';
                const segments = rel.split('/').filter((s) => s.length > 0);
                const crumbs = [baseLabel, ...segments];
                const buildTargetPath = (index: number) => {
                  if (index === 0) return wd || '/';
                  const upTo = segments.slice(0, index).join('/');
                  return props.pathJoin(wd || '/', upTo);
                };
                return crumbs.map((seg, idx) => {
                  const targetPath = buildTargetPath(idx);
                  const displaySeg = idx === 0 ? (wd || '').replace(/^\/+/, '') || '.' : seg;
                  return (
                    <Flex key={`path-inline-${seg}-${idx}`} align='center' gap='2'>
                      {idx > 0 && (
                        <Text size='3' style={{ color: 'var(--gray-9)' }}>
                          /
                        </Text>
                      )}
                      <Button
                        variant='ghost'
                        size='2'
                        className={styles.fileLinkButton}
                        onClick={() => props.onSetCurrentDir(targetPath)}
                        style={{ padding: '0 6px' }}
                      >
                        {displaySeg}
                      </Button>
                    </Flex>
                  );
                });
              })()}
            </Flex>
          </Flex>

          {props.dirError && (
            <Box
              className={styles.loadingSpinner}
              style={{
                backgroundColor: 'var(--red-2)',
                border: '1px solid var(--red-6)',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ color: 'var(--red-10)' }}
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='12' y1='8' x2='12' y2='12' />
                <circle cx='12' cy='16' r='1' />
              </svg>
              <Text size='3' style={{ marginLeft: '12px', color: 'var(--red-11)' }}>
                {props.dirError}
              </Text>
            </Box>
          )}

          {props.dirLoading ? (
            <Box className={styles.loadingSpinner}>
              <Box className={styles.spinner}></Box>
              <Text style={{ marginLeft: '12px' }}>Carregando informações do diretório...</Text>
            </Box>
          ) : (
            !props.dirError && (
              <Box
                style={{ border: '1px solid var(--gray-6)', borderRadius: '8px', padding: '8px' }}
              >
                <Flex direction='column' gap='2'>
                  {props.dirEntries.map((entry) => (
                    <Flex
                      key={`${props.currentDir}/${entry.name}`}
                      justify='between'
                      align='center'
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--gray-2)',
                      }}
                    >
                      <Flex align='center' gap='3' style={{ overflow: 'hidden' }}>
                        {/* Icon */}
                        {entry.name === '..' ? (
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M19 14l-7-7-7 7' />
                          </svg>
                        ) : entry.type === 'dir' ? (
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M3 7h5l2 2h11v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z' />
                          </svg>
                        ) : (
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                            <path d='M14 2v6h6' />
                          </svg>
                        )}
                        {/* Name */}
                        {entry.type === 'dir' || entry.name === '..' ? (
                          <Button
                            variant='ghost'
                            size='2'
                            className={styles.fileLinkButton}
                            onClick={() => props.onEntryClick(entry)}
                            style={{ padding: '0 8px' }}
                          >
                            {props.isTinyScreen && entry.name.length > 20
                              ? `${entry.name.slice(0, 17)}...`
                              : props.isSmallScreen && entry.name.length > 30
                                ? `${entry.name.slice(0, 27)}...`
                                : entry.name}
                          </Button>
                        ) : (
                          <Text
                            size='2'
                            className={styles.fileName}
                            style={{ color: 'var(--gray-12)' }}
                          >
                            {props.isTinyScreen && entry.name.length > 20
                              ? `${entry.name.slice(0, 17)}...`
                              : props.isSmallScreen && entry.name.length > 30
                                ? `${entry.name.slice(0, 27)}...`
                                : entry.name}
                          </Text>
                        )}
                      </Flex>
                      {/* Details */}
                      <Flex align='center' gap='3' style={{ flexShrink: 0 }}>
                        <Text
                          size='2'
                          className={styles.ownerGroup}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          {entry.owner}:{entry.group}
                        </Text>
                        <Text size='2' style={{ color: 'var(--gray-11)' }}>
                          <span className={styles.permissionsInfo}>{entry.permissions}</span>
                        </Text>
                        <Text
                          size='2'
                          className={styles.fileSize}
                          style={{ color: 'var(--gray-11)', minWidth: '80px', textAlign: 'right' }}
                        >
                          {props.formatSize(entry.size)}
                        </Text>
                        <Text
                          size='2'
                          className={styles.dateInfo}
                          style={{ color: 'var(--gray-11)' }}
                        >
                          {entry.date}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                  {props.dirEntries.length === 0 && !props.dirError && (
                    <Text size='3' style={{ color: 'var(--gray-11)' }}>
                      Diretório vazio.
                    </Text>
                  )}
                </Flex>
              </Box>
            )
          )}
        </Flex>
      )}
    </Box>
  );
}

export default FilesSection;
