const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'src/assets/logo.jpg');
const base64 = fs.readFileSync(logoPath).toString('base64');
const dataUrl = 'data:image/jpeg;base64,' + base64;

const content = `import logoFile from './logo.jpg';

export const companyLogoBase64 = "${dataUrl}";
export const companyLogo = logoFile;
export default companyLogo;
`;

fs.writeFileSync(path.join(__dirname, 'src/assets/companyLogo.js'), content);
console.log('companyLogo.js generated successfully! Base64 length:', dataUrl.length);
