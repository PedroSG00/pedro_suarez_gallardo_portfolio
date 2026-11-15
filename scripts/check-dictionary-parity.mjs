import { readFileSync } from 'node:fs';

const en = JSON.parse(readFileSync('./app/i18n/dictionaries/en.json', 'utf8'));
const es = JSON.parse(readFileSync('./app/i18n/dictionaries/es.json', 'utf8'));

let failures = 0;

function checkKeys(enObj, esObj, path) {
  if (typeof esObj === 'object' && esObj !== null && !Array.isArray(esObj)) {
    for (const key of Object.keys(esObj)) {
      const fullPath = `${path}${path ? '.' : ''}${key}`;
      if (!(key in enObj)) {
        console.error(`❌ Missing key in en.json: ${fullPath}`);
        failures += 1;
      } else {
        checkKeys(enObj[key], esObj[key], fullPath);
      }
    }
  }
  if (typeof enObj === 'object' && enObj !== null && !Array.isArray(enObj)) {
    for (const key of Object.keys(enObj)) {
      const fullPath = `${path}${path ? '.' : ''}${key}`;
      if (!(key in esObj)) {
        console.error(`❌ Extra key in en.json / missing in es.json: ${fullPath}`);
        failures += 1;
      } else {
        checkKeys(enObj[key], esObj[key], fullPath);
      }
    }
  }
}

checkKeys(en, es, '');

const reserved = ['themeSelect', 'common.notFound', 'common.back'];
for (const key of reserved) {
  const [top, nested] = key.split('.');
  if (!(top in en)) {
    console.error(`❌ Reserved key missing in en.json: ${key}`);
    failures += 1;
  } else if (nested && !(nested in en[top])) {
    console.error(`❌ Reserved key missing in en.json: ${key}`);
    failures += 1;
  }
  if (!(top in es)) {
    console.error(`❌ Reserved key missing in es.json: ${key}`);
    failures += 1;
  } else if (nested && !(nested in es[top])) {
    console.error(`❌ Reserved key missing in es.json: ${key}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\n❌ Dictionary parity failed: ${failures} issue(s)`);
  process.exit(1);
}

console.log('✅ Dictionary parity OK');
process.exit(0);
