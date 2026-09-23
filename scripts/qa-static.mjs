import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const html = read('index.html');
const css = read('assets/styles.css');
const js = read('assets/app.js');
const worker = read('worker.js');
const wrangler = read('wrangler.toml');
const failures = [];
const pass = (condition,message) => { if(!condition) failures.push(message); };

pass(/^<!doctype html>/i.test(html.trim()), 'Missing HTML5 doctype');
pass(/<html lang="es">/.test(html), 'Missing Spanish language declaration');
pass(/<meta name="viewport"/.test(html), 'Missing viewport meta');
pass(/Página web demo no oficial; cotización simulada\./.test(html), 'Required disclosure missing');
pass((js.match(/id:'[^']+'/g) || []).length === 6, 'Catalog must contain exactly 6 products');
pass((js.match(/assets\/images\/product-0[1-6]\.jpg/g) || []).length === 6, 'Each official image must be mapped exactly once');
pass(!/[€$£]\s?\d|\d[,.]\d{2}\s?(USD|VES|Bs)/i.test(html + js), 'Numeric price/currency found');
pass(/COTIZAR/.test(html) && /COTIZAR/.test(js), 'Quote-only price label missing');
pass(!/\b(fetch|XMLHttpRequest)\s*\(/.test(js), 'Storefront code contains a network API call');
pass(/localStorage/.test(js), 'Persistence is not implemented');
pass(/koralidigital\.com\/demos\/de-michele\/\*/.test(wrangler), 'Apex route missing');
pass(/www\.koralidigital\.com\/demos\/de-michele\/\*/.test(wrangler), 'WWW route missing');
pass(/const PREFIX = '\/demos\/de-michele'/.test(worker), 'Worker path-prefix handling missing');
pass(!/(https?:)?\/\//.test(html + css + js), 'External URL/dependency detected');

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(ref => !ref.startsWith('#') && !ref.startsWith('data:'));
for(const ref of refs) pass(fs.existsSync(path.join(root,ref.replace(/^\.\//,''))), `Missing referenced asset: ${ref}`);
for(let i=1;i<=6;i++) pass(fs.existsSync(path.join(root,`assets/images/product-0${i}.jpg`)), `Missing official product image ${i}`);

const opens = (html.match(/<(section|article|aside|header|footer|main|nav|form|dialog)\b/g) || []).length;
const closes = (html.match(/<\/(section|article|aside|header|footer|main|nav|form|dialog)>/g) || []).length;
pass(opens === closes, `Structural container mismatch (${opens} open / ${closes} close)`);

if(failures.length){ console.error(`STATIC QA FAILED (${failures.length})\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log(JSON.stringify({status:'PASS',checks:15,products:6,assets:refs.length + 6,externalDependencies:0,numericPrices:0},null,2));
