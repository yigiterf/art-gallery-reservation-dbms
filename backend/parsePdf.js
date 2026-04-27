const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../odev.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('../odev_text.txt', data.text);
    console.log('PDF parsed successfully');
}).catch(function(err) {
    if (typeof pdf.default === 'function') {
        pdf.default(dataBuffer).then(function(data) {
            fs.writeFileSync('../odev_text.txt', data.text);
            console.log('PDF parsed successfully with .default');
        }).catch(console.error);
    } else {
        console.error(err);
    }
});
