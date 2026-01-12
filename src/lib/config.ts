export const config = {
  website: {
    title: 'DokkuWeb',
    subtitle: 'Application hosting on Dokku',
    emailDomain: process.env.EMAIL_DOMAIN || 'email-domain.com',
  },
  support: {
    name: process.env.SUPPORT_NAME || 'Support-Name',
    url: process.env.SUPPORT_URL || 'https://support-name.domain.com/',
  },
  server: {
    domain: process.env.SERVER_DOMAIN || 'domain.com',
  },
};
