export const extractPortFromEnv = (envVars: string[]): string | null => {
  const portEnv = envVars.find((env) => env.startsWith('PORT='));
  const proxyPortEnv = envVars.find((env) => env.startsWith('DOKKU_PROXY_PORT='));
  if (portEnv) return portEnv.split('=')[1];
  if (proxyPortEnv) return proxyPortEnv.split('=')[1];
  return null;
};
