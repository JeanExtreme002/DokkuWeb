function getScopes() {
  return [
    'assets',
    'core',
    'i18n',
    'tools',
    'github',
    'app',
    'components',
    'lib',
    'pages',
    'types',
    'public',
    'public-images',
    'public-locales',
  ];
}

const scopes = getScopes();

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', scopes],
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always'],
  },
  scopes,
};
