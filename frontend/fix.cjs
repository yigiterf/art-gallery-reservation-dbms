const fs = require('fs');
const replace = (file, search, replacement) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replacement);
  fs.writeFileSync(file, content);
};

replace('src/App.tsx', /import React, \{/, 'import {');
replace('src/pages/admin/Users.tsx', /Trash2, Edit2, Check, X, /, '');
replace('src/pages/client/ArtistProfile.tsx', /LogOut, Heart, /, '');
replace('src/pages/client/ArtistProfile.tsx', /const user = JSON\.parse\(localStorage\.getItem\('user'\) \|\| '\{\}'\);\r?\n/, '');
replace('src/pages/client/ComparePage.tsx', /Star, /, '');
replace('src/pages/client/EventDetail.tsx', /Clock, /, '');
replace('src/pages/client/ProfilePage.tsx', /const res = await axios\.put\(/g, 'await axios.put(');
