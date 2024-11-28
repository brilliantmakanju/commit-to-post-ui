const config = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'refrence-empty': [1, 'never'],
		'footer-max-lines': [0, 'always'],
		'body-max-lines-length': [0, 'always'],
	},
};

module.exports = config;
