const emailDomains = (process.env.EMAIL_DOMAINS || 'email-domain.com')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

export const config = {
  website: {
    title: process.env.WEBSITE_TITLE || 'DokkuWeb',
    subtitle: process.env.WEBSITE_SUBTITLE || 'Application hosting on Dokku',
    companyName: process.env.COMPANY_NAME || '<Company Name>',
    emailDomains,
  },
  support: {
    name: process.env.SUPPORT_NAME || '<Support Name>',
    url: process.env.SUPPORT_URL || 'https://supportWebsite.com/',
  },
  server: {
    domain: process.env.SERVER_DOMAIN || 'domain.com',
  },
};
