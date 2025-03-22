module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Disable no-unused-vars for specific cases
    '@typescript-eslint/no-unused-vars': ['warn', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
    }],
    // Allow explicit any in specific cases where it's unavoidable
    '@typescript-eslint/no-explicit-any': ['warn', {
      'ignoreRestArgs': true,
    }],
    // Disable empty interface warning
    '@typescript-eslint/no-empty-interface': 'off',
    // React specific rules
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // Next.js specific rules
    '@next/next/no-img-element': 'warn',
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
  },
  overrides: [
    {
      // Disable certain rules for specific files or directories
      files: [
        'app/services/api/**/*.ts',
        'app/utils/**/*.ts',
        'app/types/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
    {
      // Special rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    '*.config.js',
  ],
}; 