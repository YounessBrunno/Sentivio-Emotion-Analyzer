import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
  '^.+\\.ts$': [
    'ts-jest',
    {
      useESM: true,
      tsconfig: 'tsconfig.json',
      diagnostics: { ignoreCodes: [151002] },
    },
   ],
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testEnvironment: 'node',
  clearMocks: true,
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', 
  },
};

export default config;