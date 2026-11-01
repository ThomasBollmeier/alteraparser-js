import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
const versionFilePath = fileURLToPath(new URL('../src/version.js', import.meta.url));

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const nextContent = `export const VERSION = '${packageJson.version}';\n`;

writeFileSync(versionFilePath, nextContent, 'utf8');
