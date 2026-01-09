export const config = {
  website: {
    title: 'DokkuWeb',
    subtitle: 'Hospedagem de aplicações na rede IC',
    emailDomain: process.env.EMAIL_DOMAIN || 'gmail.com',
  },
  support: {
    name: process.env.SUPPORT_NAME || 'SuporteIC',
    url: process.env.SUPPORT_URL || 'https://suporteic.ufba.br/',
  },
  server: {
    domain: process.env.SERVER_DOMAIN || 'domain.com',
  },
};
