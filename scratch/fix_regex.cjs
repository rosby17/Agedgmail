const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
content = content.split("replace(/^\\\\/+/, '')").join("replace(/^\\/+/, '')");
fs.writeFileSync('src/App.jsx', content);
