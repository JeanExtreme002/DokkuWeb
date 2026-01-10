import { ReloadIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading } from '@radix-ui/themes';
import React from 'react';

import styles from '../../app-details.module.css';

interface ShellSectionProps {
  terminalBusy: boolean;
  terminalOutputs: string[];
  getPrompt: () => string;
  getPromptLabel: () => string;
  terminalInputRef: React.RefObject<HTMLInputElement>;
  terminalEndRef: React.RefObject<HTMLDivElement>;
  terminalInput: string;
  onSetTerminalInput: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function ShellSection(props: ShellSectionProps) {
  const {
    terminalBusy,
    terminalOutputs,
    getPrompt,
    getPromptLabel,
    terminalInputRef,
    terminalEndRef,
    terminalInput,
    onSetTerminalInput,
    onKeyDown,
  } = props;

  return (
    <>
      <Flex align='center' justify='between' style={{ marginBottom: '12px' }}>
        <Heading size='5' style={{ color: 'var(--gray-12)' }}>
          Shell
        </Heading>
        {terminalBusy && (
          <ReloadIcon className={styles.buttonSpinner} style={{ color: 'var(--gray-10)' }} />
        )}
      </Flex>
      <Box
        onClick={() => {
          try {
            const sel =
              typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
            const hasSelection = !!sel && sel.toString().length > 0;
            if (!hasSelection) terminalInputRef.current?.focus();
          } catch {
            terminalInputRef.current?.focus();
          }
        }}
        style={{
          background: '#0B1220',
          color: '#E5E7EB',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '12.5px',
          lineHeight: 1.5,
          border: '1px solid var(--gray-6)',
          borderRadius: 6,
          padding: '16px',
          minHeight: '240px',
          maxHeight: '420px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          cursor: 'text',
        }}
      >
        {terminalOutputs.length === 0 ? (
          <div style={{ color: 'var(--gray-11)' }}>Digite um comando e pressione Enter.</div>
        ) : (
          terminalOutputs.map((line, idx) => {
            const promptPrefix = `${getPrompt()} `;
            if (line.startsWith(promptPrefix)) {
              const cmdText = line.slice(promptPrefix.length);
              return (
                <div key={idx} style={{ marginBottom: 6 }}>
                  <span style={{ color: '#93C5FD', marginRight: 8 }}>{getPrompt()}</span>
                  <span>{cmdText}</span>
                </div>
              );
            }
            return (
              <div key={idx} style={{ marginBottom: 6 }}>
                {line}
              </div>
            );
          })
        )}
        {/* Active prompt line: only show when not executing */}
        {!terminalBusy && (
          <div>
            {/* Label line for very small screens (<450px) */}
            <div className={styles.terminalPromptLabel}>
              <span style={{ color: '#93C5FD' }}>{getPromptLabel()}</span>
            </div>

            {/* Single input row: show full prompt on large screens, only % on small screens */}
            <div className={styles.terminalPromptRow}>
              <span className={styles.terminalPromptFull}>{getPrompt()}</span>
              <span className={styles.terminalPromptSymbol}>%</span>
              <input
                ref={terminalInputRef}
                type='text'
                value={terminalInput}
                onChange={(e) => onSetTerminalInput(e.target.value)}
                onKeyDown={onKeyDown}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#E5E7EB',
                  font: 'inherit',
                  padding: 0,
                  margin: 0,
                }}
                placeholder=''
              />
            </div>
          </div>
        )}
        <div ref={terminalEndRef} />
      </Box>
    </>
  );
}
