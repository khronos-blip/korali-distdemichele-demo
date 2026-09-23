import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root,'qa'); const shots = path.join(out,'screenshots'); fs.mkdirSync(shots,{recursive:true});
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  let pathname = new URL(req.url,'http://127.0.0.1').pathname;
  const prefix = '/demos/de-michele';
  if(pathname === prefix){ res.writeHead(308,{Location:`${prefix}/`}); return res.end(); }
  if(pathname.startsWith(`${prefix}/`)) pathname = pathname.slice(prefix.length);
  if(pathname === '/') pathname = '/index.html';
  const file = path.resolve(root,`.${pathname}`);
  if(!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}); fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const port = server.address().port; const url = `http://127.0.0.1:${port}/demos/de-michele/`;
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({headless:true,executablePath});
const results = {status:'PASS',url:'/demos/de-michele/',checks:[],screenshots:[],consoleErrors:[],pageErrors:[],failedRequests:[],externalRequests:[],apiCalls:0};
function check(condition,name,detail=''){ results.checks.push({name,pass:Boolean(condition),detail}); if(!condition) results.status='FAIL'; }
async function screenshot(page,name,fullPage=false){ const file = path.join(shots,`${name}.png`); await page.screenshot({path:file,fullPage}); results.screenshots.push(path.relative(root,file)); }
try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page = await context.newPage();
  page.on('console',msg => { if(msg.type()==='error') results.consoleErrors.push(msg.text()); });
  page.on('pageerror',err => results.pageErrors.push(err.message));
  page.on('requestfailed',req => results.failedRequests.push(`${req.method()} ${req.url()}`));
  page.on('request',req => { const u = new URL(req.url()); if(!['127.0.0.1','localhost'].includes(u.hostname) && !req.url().startsWith('data:')) results.externalRequests.push(req.url()); if(['xhr','fetch'].includes(req.resourceType())) results.apiCalls++; });
  await page.goto(url,{waitUntil:'networkidle'});
  check(await page.locator('.product-card').count() === 6,'six products render');
  check(await page.getByText('Página web demo no oficial; cotización simulada.').isVisible(),'disclosure visible');
  check((await page.locator('body').innerText()).includes('COTIZAR'),'quote price language visible');
  await screenshot(page,'desktop-home');

  await page.locator('[data-category="Granito"]').click();
  check(await page.locator('.product-card').count() === 1,'category filter');
  await page.locator('[data-reset-filters]').count().catch(()=>0);
  await page.locator('[data-category="Todos"]').click();
  await page.locator('#search-input').fill('Sikadur');
  check(await page.locator('.product-card').count() === 1,'search filter');
  await page.locator('#search-input').fill('');

  await page.locator('[data-detail="encimeras"]').click();
  check(await page.locator('#product-dialog').getAttribute('open') !== null,'product detail opens');
  await screenshot(page,'desktop-detail');
  await page.locator('[data-close-detail]').click();
  await page.locator('[data-add="varillero"]').click();
  await page.locator('[data-add="pintakreto"]').click();
  check(await page.locator('[data-cart-count]').first().innerText() === '2','two items added');
  await page.reload({waitUntil:'networkidle'});
  check(await page.locator('[data-cart-count]').first().innerText() === '2','cart persists after reload');
  await page.locator('[data-open-basket]').first().click();
  await page.waitForTimeout(350);
  check(await page.locator('.quote-item').count() === 2,'basket renders persisted items');
  await screenshot(page,'desktop-basket');
  await page.locator('#continue-button').click();
  await page.locator('input[value="maracay"]').check();
  await page.locator('input[name="customer"]').fill('Proyecto demostración');
  await page.locator('input[name="ack"]').check();
  await page.locator('#quote-form button[type="submit"]').click();
  check(await page.locator('#confirmation').isVisible(),'local confirmation completes');
  check((await page.locator('#confirmation').innerText()).includes('Maracay'),'selected branch confirmed');
  check(await page.locator('#drawer-foot').isHidden(),'confirmation hides navigation footer');
  await screenshot(page,'desktop-confirmation');
  check(results.apiCalls === 0,'zero fetch/XHR calls',String(results.apiCalls));
  check(results.externalRequests.length === 0,'zero external requests',results.externalRequests.join(','));
  check(results.consoleErrors.length === 0,'zero console errors',results.consoleErrors.join(','));
  check(results.pageErrors.length === 0,'zero page errors',results.pageErrors.join(','));
  check(results.failedRequests.length === 0,'zero failed requests',results.failedRequests.join(','));
  await context.close();

  const mobile = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mpage = await mobile.newPage();
  mpage.on('console',msg => { if(msg.type()==='error') results.consoleErrors.push(`mobile: ${msg.text()}`); });
  mpage.on('pageerror',err => results.pageErrors.push(`mobile: ${err.message}`));
  mpage.on('requestfailed',req => results.failedRequests.push(`mobile: ${req.url()}`));
  await mpage.goto(url,{waitUntil:'networkidle'});
  const dims = await mpage.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  check(dims.scrollWidth <= dims.innerWidth + 1,'no mobile horizontal overflow',JSON.stringify(dims));
  check(await mpage.locator('.product-card').count() === 6,'mobile catalog renders');
  await screenshot(mpage,'mobile-home',true);
  await mpage.locator('[data-add="sikadur-32"]').scrollIntoViewIfNeeded(); await mpage.locator('[data-add="sikadur-32"]').click();
  await mpage.locator('[data-open-basket]').first().click();
  await mpage.waitForTimeout(350);
  check(await mpage.locator('.basket-drawer').isVisible(),'mobile basket opens');
  await screenshot(mpage,'mobile-basket');
  await mobile.close();
} finally { await browser.close(); server.close(); }
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
if(results.status !== 'PASS') process.exit(1);
