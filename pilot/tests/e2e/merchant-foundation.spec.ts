import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('.local/config.json','utf8'));
async function login(page:Page,username:string){
 await page.goto('/');
 await page.getByRole('link',{name:'Sign in'}).click();
 const user=config.users.find((u:any)=>u.username===username);
 await page.locator('#username').fill(user.username);
 await page.locator('#password').fill(user.password);
 await page.locator('#kc-login').click();
 await page.waitForURL(url=>url.origin===config.origin&&url.pathname==='/');
}
test('real owner login, discovery, create-shop and logout through Angular/API/PostgreSQL',async({page,context})=>{
 await login(page,'owner');
 await expect(page.getByRole('heading',{name:'Your shops'})).toBeVisible();
 await expect(page.getByLabel('Tenant')).toContainText('Tenant A');
 const cookie=(await context.cookies()).find(c=>c.name==='__Host-pilot-session');
 expect(Boolean(cookie?.secure&&cookie.httpOnly&&cookie.sameSite==='Lax')).toBe(true);
 const name='Browser shop '+Date.now();
 await page.getByLabel('Shop name').fill(name);
 await page.getByLabel('Shop slug').fill('browser-'+Date.now());
 await page.getByRole('button',{name:'Create shop'}).click();
 await expect(page.getByRole('list')).toContainText(name);
 await page.getByRole('button',{name:'Log out'}).click();
 await expect(page.getByRole('link',{name:'Sign in'})).toBeVisible();
 expect((await context.cookies()).some(c=>c.name==='__Host-pilot-session')).toBe(false);
});
test('real staff login only lists granted shop and cannot create',async({page})=>{
 await login(page,'staff');
 await expect(page.getByRole('list')).toContainText('Shop A1');
 await expect(page.getByRole('list')).not.toContainText('Shop A2');
 await expect(page.getByRole('button',{name:'Create shop'})).toHaveCount(0);
});
test('real no-membership principal sees empty discovery',async({page})=>{
 await login(page,'empty');await expect(page.getByText('No tenant memberships.')).toBeVisible();
});
