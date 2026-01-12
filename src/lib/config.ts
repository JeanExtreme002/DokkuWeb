const emailDomains = (process.env.EMAIL_DOMAINS || 'email-domain.com')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

export const config = {
  website: {
    title: 'DokkuWeb',
    subtitle: 'Application hosting on Dokku',
    emailDomains,
  },
  support: {
    name: process.env.SUPPORT_NAME || 'Support-Name',
    url: process.env.SUPPORT_URL || 'https://supportWebsite.com/',
  },
  server: {
    domain: process.env.SERVER_DOMAIN || 'domain.com',
  },
};
