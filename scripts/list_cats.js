const Database = require('better-sqlite3');
const db = new Database('../sheetgen/data/sheetgen.db', { readonly: true });
const rows = db.prepare('SELECT DISTINCT category FROM photos WHERE category IS NOT NULL').all();
console.log(JSON.stringify(rows.map(r => r.category), null, 2));
db.close();
