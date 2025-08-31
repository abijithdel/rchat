const fs = require('fs');
const path = require('path');
const { GetTimeAndDate } = require('./index')

const LogDirPath = path.join(__dirname, '../log')

const SaveLog = async (socketid, ip, type) => {
    const ex = CheckExist(LogDirPath)
    if (!ex) {
        Create(LogDirPath, 'dir')
    }
    WriteLog(socketid, ip, type)
};

const CheckExist = (filePath) => {
    const exists = fs.existsSync(filePath);
    return exists;
};

const Create = (path, type) => {
    if (type === 'file') {
        fs.writeFile(path, `# Log created at ${GetTimeAndDate().date} ${GetTimeAndDate().time}\n`, (err) => {
            if (err) console.log(`${type} creating Error ${err.message}`)
            return;
        })
        console.log(`Create File, Path: ${path}`)
    }
    if (type === 'dir') {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) console.log(`${type} creating Error ${err.message}`)
            return;
        })
        console.log(`Create File, Path: ${path}`)
    }
}

const WriteLog = (socketid, ip, type) => {
    const filePath = path.join(LogDirPath, `${GetTimeAndDate().date}.log`);
    const ex = CheckExist(filePath)
    if(!ex){
        Create(filePath,'file')
    }
    const log =  `${type} - Socket ID: ${socketid}, IP: ${ip}, Time: ${GetTimeAndDate().time}\n`;
    fs.appendFile(filePath,log, (err) => {
        if(err) console.log(`Log Saving Error: ${err.message}`)
    })
}

module.exports = { SaveLog };
