const fi = document.querySelector('input[type=file]');
if (fi) { console.log('FOUND: ' + fi.outerHTML.substring(0,200)); } else { console.log('NOT FOUND'); }
