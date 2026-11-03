const fs = require('fs');

const sharedConfigPath = '/home/jeremy/oth-shared/config.json';
const sharedConfig = JSON.parse(fs.readFileSync(sharedConfigPath, 'utf8'));
const enableLogin = sharedConfig.features && sharedConfig.features.enableLogin;
const year = sharedConfig.year;

if (typeof enableLogin !== 'boolean') {
  throw new Error(`Expected features.enableLogin boolean in ${sharedConfigPath}`);
}

if (year === undefined || year === null || year === '') {
  throw new Error(`Expected year in ${sharedConfigPath}`);
}

process.env.REACT_APP_ENABLE_LOGIN = String(enableLogin);
process.env.REACT_APP_YEAR = String(year);
