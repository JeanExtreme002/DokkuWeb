// Removes ANSI escape codes from a string (shared helper)
export const processAnsiCodes = (text: string): string => {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
};
