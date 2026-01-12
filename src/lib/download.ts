export const downloadFile = (filename: string, content: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export const downloadTextFile = (content: string, filename: string): void => {
  downloadFile(filename, content, 'text/plain');
};
