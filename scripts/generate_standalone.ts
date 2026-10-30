import fs from 'node:fs';
import { generateStandaloneSingleHtml } from '../src/services/singleFileGenerator';

const html = generateStandaloneSingleHtml();
fs.writeFileSync('public/pocket_developer_index.html', html, 'utf-8');
fs.writeFileSync('pocket_developer_index.html', html, 'utf-8');
console.log('Successfully wrote standalone Pocket Developer single HTML files!');
