const Promise = require('es6-promise');
const path = require('path');
const fs = require('fs');

module.exports = {
    methods: {
        checkGtaFolder,
        directoryExist,
        checkGtaUpdates
    }
};

/*
    * ***************************************************************
    ** Checking GTA on UPDATES
    * ***************************************************************
 */

function checkGtaUpdates(data, settings) {
    return new Promise((resolve, reject) => {
        try {
            let toUpdate = [];
            for (let current in data) {
                if(data.hasOwnProperty(current))
                {
                    if (!settings.hasOwnProperty(current) || !data[current].info ||
                        !data[current].hasOwnProperty('info') ||
                        !data[current].info.hasOwnProperty('version'))
                        continue;
                    console.log(`${current} | ${settings[current]} | ${data[current].info.version}` );
                    if (settings[current] !== data[current].info.version) {
                        let one = {};
                        one[current] = data[current];
                        toUpdate.push(one);
                    }
                }
            }
            resolve(toUpdate);
        }
        catch (e) {
            console.log(e);
            reject(e);
        }

    })
}

/*
    * ***************************************************************
    ** Checking GTA on INSTALL
    * ***************************************************************
 */

function checkGtaFolder(_path) {
    return new Promise((resolve, reject) => {
        if (checkGtaFolderE(_path))
            resolve();
        else
            reject();
    })
}

function checkGtaFolderE(_path) {
    if (_path.length === 0)
        return false;
    if (fs.existsSync(_path)){
        if (checkFolderExist(_path)
            && checkMainFolder(_path)
            && checkImgs(_path)
            && checkData(_path))
            return true
    }
    return false
}

function checkFolderExist(_path) {
    return (fs.existsSync(path.join(_path, "anim"))
        && fs.existsSync(path.join(_path, "audio"))
        && fs.existsSync(path.join(_path, "data"))
        && fs.existsSync(path.join(_path, "models"))
        && fs.existsSync(path.join(_path, "audio"))
        && fs.existsSync(path.join(_path, "MTA"))
        && fs.existsSync(path.join(_path, "text")));

}

function checkMainFolder(_path) {
    return (fs.existsSync(path.join(_path, "bass.dll"))
        && fs.existsSync(path.join(_path, "eax.dll"))
        && fs.existsSync(path.join(_path, "ogg.dll"))
        && fs.existsSync(path.join(_path, "gta_sa.exe"))
        && fs.existsSync(path.join(_path, "vorbis.dll")));
}

function checkImgs(_path) {
    const img = path.join(_path, "models")
    return (fs.existsSync(path.join(img, "gta_int.img"))
        && fs.existsSync(path.join(img, "gta3.img"))
        && fs.existsSync(path.join(img, "player.img"))
        && fs.existsSync(path.join(img, "vccol.img"))
        && fs.existsSync(path.join(img, "vctxd.img")))
    }

function  checkData(_path) {
    return fs.existsSync(path.join(_path, 'data', 'maps', 'vc'))
}

/*
    * ***************************************************************
    ** Some useful functions
    * ***************************************************************
 */

function directoryExist(path) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(path))
            resolve(path);
        else
            reject()
    })
}
