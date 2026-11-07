const fs = require('node:fs'), path = require('node:path');


const fixtures = process.env.INFANTPEDIA_CONTENT_FIXTURES || path.resolve(__dirname, '../docs/audits/2026-11-04/content');
async function prepare(context) {
  await context.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.host === '127.0.0.1:3223') return route.continue();
    const table = u.pathname.split('/').at(-1);
    if (u.host === '127.0.0.1:3228' && route.request().method() === 'GET' && ['months_info','activities','parenting_tips','wonder_weeks'].includes(table)) {
      let rows = JSON.parse(fs.readFileSync(path.join(fixtures, 'live-'+table+'.json'))).rows;
      for (const [k,v] of u.searchParams) if (v.startsWith('eq.')) rows = rows.filter(r => String(r[k]) === v.slice(3));
      return route.fulfill({status:200, contentType:'application/json', body:JSON.stringify(route.request().headers().accept?.includes('object') ? rows[0]??null : rows)});
    }
    return route.fulfill({status:401, contentType:'application/json', body:'{}'});
  });
  await context.addInitScript(() => {
    const p={id:'readability-qa',name:'테스트 아기',birthdate:'2026-08-29',gender:'female'};
    localStorage.setItem('baby-profile',JSON.stringify({state:{babies:[p],profile:p,activeBabyId:p.id,babyPhotos:{},legacyOwnerId:p.id,legacyOwnershipChecked:true},version:1}));
  });
}
module.exports = {prepare};
