import {app, BrowserWindow, dialog} from 'electron'
import store from '../renderer/store'
import Launch from './Launch/launch'
import path from "path"

const fs = require('fs');
const api = require('./api/api');
const checks = require('./launcher/checks');
const DownloadManager = require("electron-download-manager");
const DecompressZip = require('decompress-zip');
const updater = require('electron-updater');
const isDev = require('electron-is-dev');
const log = require("electron-log");
const config = require('../config');

checks.methods.checkGtaFolder(store.getters.GtaPath)
    .then(() => {
        if (!fs.existsSync(store.getters.GtaPath + '/downloads')){
            fs.mkdirSync(store.getters.GtaPath + '/downloads');
        }
        store.commit('UPDATE_DOWNLOAD_PATH', store.getters.GtaPath + '/downloads');
        DownloadManager.register({downloadFolder: store.getters.DownloadPath});
    })
    .catch(() => {
        if (store.getters.DownloadPath !== app.getPath("downloads") + "/MTA Vice City"){
            store.commit('UPDATE_DOWNLOAD_PATH', app.getPath("downloads") + "/MTA Vice City")
        }
        DownloadManager.register({downloadFolder: store.getters.DownloadPath});
    });

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.on('uncaughtException', error => {
    log.error(error);
    throw error;
});

let mainWindow;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

/*
************************************************************************************
 */

app.setPath('userData', path.join(process.env.APPDATA, 'MTA Vice City'));

let mainWindowSettings = {
    height: 400,
    width: 650,
    webPreferences: {
        nodeIntegration: true,
        devTools: false
    },
    resizable: false,
    movable: true,
    maximizable: false,
    minimizable: true,
    transparent: true,
    frame: false,
    show: false
};

if(isDev){
    mainWindowSettings = {
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        movable: true,
        maximizable: false,
        minimizable: true,
        transparent: true,
        frame: false,
        show: false
    }
}


function createWindow () {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow(mainWindowSettings);

    store.commit('SET_PROGRESS_VALUE', 0);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        initializeLauncher();
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// Handle while user run second instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock){
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if(mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

app.on('ready', () => {
    setTimeout(() => {
        createWindow()
    }, 100);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});

/*
  Select folder dialog
 */

exports.selectDirectory = function (){
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
};

/*
************************************************************************************
 */

/*
  Catch actions from ipcRenderer
 */

store.subscribeAction((action, state) => {
    switch (action.type) {
        case "CloseBtnHandle": {
            if(mainWindow)
                mainWindow.close();
            break
        }
        case "MinimizeBtnHandle": {
            if (mainWindow)
                mainWindow.minimize();
            break
        }
        case "LaunchButtonHandle": {
            switch (store.getters.ProgramState) {
                case 'ready': {

                    let nickname = action.payload;
                    log.info(`---Launch game---nickname= ${nickname}`);
                    if(nickname.length > 5){
                        store.commit('UPDATE_PLAYER_NAME', nickname);
                        Launch.launchMta(store.getters.MtaExePath,
                            store.getters.CoreConfigPath, nickname)
                    }
                    break;
                }
                case 'gta-not-updated':{
                    downloadGtaUpdates();
                    break;
                }
            }
            break
        }
        case "SettingsButtonHandle": {
            switch (store.getters.ProgramState) {
                case 'ready': {
                    store.commit('SET_PROGRAM_STATE', 'insettings');
                    navigate('/settings');
                    break;
                }
            }
            break
        }
        case "startInstallGta": {
            let installPath = action.payload;
            if (installPath)
                installGta(installPath);
        }
    }
});

/*
  Catch mutations from ipcRenderer
 */

store.subscribe(mutation => {
    if (mutation.type === 'SET_PROGRAM_STATE'){
        //console.log(mutation.payload);
        switch (mutation.payload) {
            case 'check-have-gta':{
                navigate('/');
                checks.methods.checkGtaFolder(store.getters.GtaPath)
                    .then(() => initializeLauncher())
                    .catch(() => {
                        store.commit('SET_PROGRAM_STATE','not-found');
                        navigate('/havegta');
                    })
                break;
            }
            case 'apply-settings':{
                applySettings();
                break;
            }
        }
    }
});

/*
************************************************************************************
 */

function initializeLauncher(){
    log.info('=================================================================');
    log.info('Application started');
    log.info('=================================================================');

    let server = null;

    store.commit('SET_PROGRAM_STATE', 'init');
    store.commit('UPDATE_LAUNCHER_PATH', path.parse(app.getPath('exe')).dir);

    // Initialize

    getVersion()
        .then(() => {
            store.commit('SET_PROGRAM_STATE','get-api-servers');
            return Promise.resolve();
        })
        .then(api.methods.getApiServer)
        .then((_server => {
            server = _server;
            return Promise.resolve();
        }))
        // .then(checkLauncherUpdates)
        .then(() => initSettingWindowData(server))
        .then(() => initializeGta(server))
        .catch(e => log.info(e));
}

function checkLauncherUpdates() {
    log.info('Checking launcher Updates');
    return new Promise((resolve, reject) => {
        try{
            if (isDev) {
                console.log("\x1b[32m", '---------------------------------------------------');
                console.log("\x1b[32m", 'Skip checkLauncherUpdates() in development mode');
                console.log("\x1b[32m", '---------------------------------------------------');
                resolve();
            } else {
                const autoUpdater = updater.autoUpdater;
                autoUpdater.logger = log;
                autoUpdater.logger.transports.file.level = "info";
                autoUpdater.autoDownload = true;

                if (config.develop === true){
                    autoUpdater.requestHeaders = {"PRIVATE-TOKEN": config.updateTokens.develop.token};
                    autoUpdater.setFeedURL(config.updateTokens.develop.feedUrl);
                } else {
                    autoUpdater.requestHeaders = {"PRIVATE-TOKEN": config.updateTokens.release.token};
                    autoUpdater.setFeedURL(config.updateTokens.release.feedUrl);
                }

                autoUpdater.on('checking-for-update', function () {
                    store.commit('SET_PROGRAM_STATE', 'fetch-launcher-version')
                });

                autoUpdater.on('update-available', function (info) {
                    store.commit('SET_PROGRAM_STATE', 'check-launcher-version');
                    store.commit('SET_PROGRAM_STATE', 'download-launcher-updates');
                });

                autoUpdater.on('update-not-available', function (info) {
                    resolve();
                });

                autoUpdater.on('error', function (err) {
                    log.error(err);
                    resolve();
                });

                autoUpdater.on('download-progress', function (progressObj) {
                    store.commit('SET_PROGRESS_STATE',
                        `Загрузка обновлений лаунчера (${Number(progressObj.percent).toFixed(0)}%)`);
                });

                autoUpdater.on('update-downloaded', function (info) {
                    store.commit('SET_PROGRAM_STATE', 'before-launcher-update')
                });

                autoUpdater.on('update-downloaded', function (info) {
                    setTimeout(function () {
                        autoUpdater.quitAndInstall();
                    }, 1000);
                });
                autoUpdater.checkForUpdates();
            }
        }
        catch(e){
            reject(e);
        }
    })
}

function  initializeGta(server) {
    store.commit('SET_PROGRAM_STATE', 'check-exist-gta');
    log.info(`initialize GTA`);
    checks.methods.checkGtaFolder(store.getters.GtaPath)
        .then(() => checkGtaUpdates(server))
        .catch((e) => {
            let defaultFolder = path.join(store.getters.LauncherPath, "MTA Vice City");
            checks.methods.directoryExist(defaultFolder)
                .then(checks.methods.checkGtaFolder(defaultFolder))
                .then(() => {
                    store.commit('UPDATE_GTA_PATH', path.join(store.getters.LauncherPath, "MTA Vice City"));
                    checkGtaUpdates(server);
                })
                .catch(() => {
                    store.commit('UPDATE_GTA_PATH', path.join('C:/Games/MTA Vice City'));
                    initNotFoundView()
                });
        })
}

function checkGtaUpdates(server) {
    log.info('checkGtaUpdates');
    api.methods.getResponseData(`${server}/api/gta/currents`)
        .then(response => {return Promise.resolve(JSON.parse(response))})
        .then(currents => checks.methods.checkGtaUpdates(currents, store.getters.AllSettings))
        .then(toUpdate => getToUpdateArray(toUpdate))
        .then((files) => {
            //console.log(`files = ${files}`);
            if (files.length !== 0){
                store.commit('SET_NEED_UPDATE', files);
                log.info('GTA NOT UPDATED');
                log.info(`Files to update ${files}`);
                store.commit('SET_PROGRAM_STATE', 'gta-not-updated');
            } else {
                store.commit('SET_NEED_UPDATE', []);
                store.commit('SET_PROGRAM_STATE', 'ready')
            }
            return Promise.resolve()
        })
        .then(() => navigate('/main'))
        .catch((e) => {
            log.error(e);
            // TODO Add error handle while GTA updates;
            store.commit('SET_PROGRAM_STATE', 'ready');
            navigate('/main');
        })
}

function getToUpdateArray(toUpdate) {
    return new Promise((resolve, reject) => {
        let files = [];
        let chain = Promise.resolve();
        toUpdate.forEach(update => {
            chain = chain
                .then(() => new Promise((resolve1, reject1) => {
                    for (let upd in update){
                        if (update.hasOwnProperty(upd)){
                            if (update[upd].hasOwnProperty('info') &&  update[upd].info &&
                                update[upd].info.dataUrl){
                                api.methods.getResponseHeader(update[upd].info.dataUrl)
                                    .then(data => {
                                        if (data.hasOwnProperty('content-disposition')) {
                                            let filename = getFileNameByContentDisposition(data['content-disposition'][0]);
                                            return Promise.resolve(filename);
                                        }
                                    })
                                    .then((filename) => {
                                        files.push({
                                            name: upd,
                                            url:  update[upd].info.dataUrl,
                                            path: 'gta',
                                            obj: update[upd],
                                            srcPath: path.join(store.getters.DownloadPath, 'gta', filename), // initialize in next promise
                                            destPath: store.getters.GtaPath
                                        });
                                    })
                                    .then(() => resolve1())
                                    .catch(error => reject1(error))
                            }
                        }
                    }
                }));
        });
        chain.then(() => {
            //console.log(`files1 = ${files}`)
            resolve(files);
        });
        chain.catch((e) => {
            reject(e);
        })
    })
}

function initSettingWindowData(server){
    return new Promise((resolve, reject) => {
        api.methods.getResponseData(`${server}/api/enb`)
            .then((response) => {return Promise.resolve(JSON.parse(response)) })
            .then(array => store.commit('UPDATE_ENB_LIST', array))
            .then(() => resolve())
            .catch((e) => reject(e))
    })
}

function downloadGtaUpdates() {
    store.commit('SET_PROGRAM_STATE', 'updating-gta');
    log.info('download Gta Updates');
    let downloadResults = [];
    let extractResults = [];
    let countToExtract = 0;
    let extractedFiles = 0;
    let toUpdate = store.getters.NeedUpdate;
    downloadMultiplyFiles(toUpdate, "Загрузка файлов игры", function (error, filePath, info) {
        if (!error){
            console.log(filePath, info);
            downloadResults.push(filePath);
        }
    })
        .then (() => {
            countToExtract = downloadResults.length;
            extractedFiles = 0;
            store.commit('SET_PROGRESS_STATE', "Установка обновлений");
            return Promise.resolve();
        })
        .then(() => extractMultiplyFiles(toUpdate, function (info) {
            if (info.hasOwnProperty('error') && info.hasOwnProperty('extracted') &&
                info.hasOwnProperty('dest') && info.hasOwnProperty('file')){
                if (info.error){
                    return Promise.reject(info.error)
                }
                extractedFiles += 1;
                store.commit('SET_PROGRESS_VALUE', Number(extractedFiles/countToExtract * 100));
                extractResults.push(info.file);
                return Promise.resolve();
            }
        }))
        .then(() => {
            store.dispatch('updateVersionsFromArray', extractResults);
            store.commit('SET_NEED_UPDATE', []);
            return Promise.resolve();
        })
        .then(() => {
            store.commit('SET_PROGRAM_STATE', 'ready')
        })
        .catch(e => {
            log.error(e);
            store.commit('SET_PROGRAM_STATE', 'ready')
        })
}

function installGta(installPath) {
    let server = null;
    let files = [];
    let downloadResults = [];
    let responseData = {};

    let extractedFiles = 0; // count of extracted files
    let filesCount = 0; // Count files to extract

    log.info('start gta install');
    api.methods.getApiServer()
        .then((_server => {
            server = _server;
            return Promise.resolve(server);
        }))
        .then(server => api.methods.getResponseData(`${server}/api/gta/currents`))
        .then(response => { return Promise.resolve(JSON.parse(response)) })
        .then(data =>  {
            responseData = data;
            for (let property in data) {
                if (data.hasOwnProperty(property)) {
                    if (!data[property].hasOwnProperty('info') || !data[property].info || !data[property].info.hasOwnProperty('dataUrl')){
                        console.log(property);
                        return Promise.reject(`Can't get ${property} download url`);
                    }
                    files.push({url: data[property].info.dataUrl, path: 'gta', entity: data[property]})
                }
            }
            store.commit('SET_PROGRAM_STATE', 'install-gta');
            navigate('/main');
            console.log(files);
            if (!fs.existsSync(installPath)){
                fs.mkdirSync(installPath);
            }
            return Promise.resolve(files);
        })
        .then(files => downloadMultiplyFiles(files, "Загрузка файлов игры",
            function (error, file = {}, info = {}) {
                if (error)
                    downloadResults.push(error);
                else
                    downloadResults.push({srcPath: file, destPath: installPath})
            }))
        .then(() => {
            if (!fs.existsSync(installPath))
                fs.mkdirSync(installPath);

            store.commit('SET_PROGRESS_VALUE', 0);
            filesCount = downloadResults.length;
            store.commit('SET_PROGRESS_STATE', 'Установка ГТА');
            return Promise.resolve();
        })
        .then(() => extractMultiplyFiles(downloadResults, function (progress) {
            extractedFiles++;
            store.commit('SET_PROGRESS_VALUE', Number(extractedFiles/filesCount * 100));
        }))
        .then(() => {
            store.commit('SET_PROGRESS_STATE', 'Завершение установки');
            let updates = [];
            for (let data in responseData) {
                if (responseData.hasOwnProperty(data)) {
                    log.info(`${data} new version ${responseData[data].info.version}`);
                    updates.push({name: data, obj: responseData[data]});
                }
            }
            store.dispatch('updateVersionsFromArray', updates);
            return Promise.resolve();
        })
        .then(() => {
            store.commit('UPDATE_GTA_PATH', installPath);
            store.commit('SET_PROGRAM_STATE', 'ready');
        })
        .catch(e => console.log(e));
}

function getVersion() {
    return new Promise((resolve, reject) => {
        try{
            let json = require('../../package');
            store.commit('UPDATE_LAUNCHER_VERSION', json.version);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

function initNotFoundView(){
    store.commit('SET_PROGRAM_STATE', 'not-found');
    navigate('/notfound');
}

function initMainView(ready = false) {
    store.commit('SET_NEED_UPDATE', []);
    if (ready) { store.commit('SET_PROGRAM_STATE', 'ready'); }
    navigate('/main')
}

function applySettings() {
    let toApplyList = store.getters.ToApplySettings;
    let chain = Promise.resolve();
    log.info(`Apply settings`);
    log.info(`settings to apply = ${toApplyList}`);

    toApplyList.forEach(setting => {
        chain = chain
            .then(() => new Promise((resolve, reject) => {
                applySetting(setting)
                    .then(() => resolve())
            }))
    });
    chain.then(() => {
        log.info('Apply settings finished');
        store.commit('SET_TO_APPLY_SETTINGS', []);
        store.commit('SET_PROGRAM_STATE', 'ready');
    })
}

function applySetting(setting) {
    return new Promise((resolve, reject) => {
        switch(setting.type)
        {
            case "installEnb":{
                applyEnbSetting(setting)
                    .then(() => { console.log(`applyEnb`); resolve()})
                    .catch(e => resolve());
            }
        }
    });
}

function applyEnbSetting(setting) {
    log.info(`apply ENB setting`);
    log.info(`ENB setting is ${setting}`);
    return new Promise((resolve, reject) => {
        let files = [];
        let oldExtractedPath = '';
        let newExtractedPath = '';
        Promise.resolve()
            .then(() => {
                // old ENB
                return new Promise((resolve1, reject1) => {
                    if (!fs.existsSync(path.join(store.getters.GtaPath, 'enbseries'))){
                        fs.mkdirSync(path.join(store.getters.GtaPath, 'enbseries'));
                    }
                    if (!fs.existsSync(path.join(store.getters.DownloadPath, 'enb', setting.oldEnb.name))){
                        api.methods.getResponseHeader(setting.oldEnb.url)
                            .then(data => {
                                if (data.hasOwnProperty('content-disposition')) {
                                    let filename = getFileNameByContentDisposition(data['content-disposition'][0]);
                                    return Promise.resolve(filename);
                                }
                            })
                            .then((filename) => {
                                files.push({
                                    type: 'old',
                                    url:  setting.oldEnb.url,
                                    path: 'enb',
                                    obj: setting.oldEnb,
                                    srcPath: path.join(store.getters.DownloadPath, 'enb', filename), // initialize in next promise
                                    destPath: path.join(store.getters.DownloadPath, 'enb')
                                });
                                resolve1();
                            })
                    }
                    else {
                        oldExtractedPath = path.join(store.getters.DownloadPath, 'enb', setting.oldEnb.name);
                        resolve1();
                    }
                });
            })
            .then(() => {
                // new ENB
                return new Promise((resolve1, reject1) => {
                    if (!fs.existsSync(path.join(store.getters.DownloadPath, 'enb', setting.enb.name))){
                        api.methods.getResponseHeader(setting.enb.url)
                            .then(data => {
                                if (data.hasOwnProperty('content-disposition')) {
                                    let filename = getFileNameByContentDisposition(data['content-disposition'][0]);
                                    return Promise.resolve(filename);
                                }
                            })
                            .then((filename) => {
                                files.push({
                                    type: 'new',
                                    url:  setting.enb.url,
                                    path: 'enb',
                                    obj: setting.enb,
                                    srcPath: path.join(store.getters.DownloadPath, 'enb', filename), // initialize in next promise
                                    destPath: path.join(store.getters.DownloadPath, 'enb')
                                });
                                resolve1();
                            })
                    }
                    else {
                        newExtractedPath = path.join(store.getters.DownloadPath, 'enb', setting.enb.name);
                        resolve1();
                    }
                });
            })
            .then(() => new Promise((resolve1, reject1) => {
                log.info(`Installing ENB  files = ${files}, oldExtractedPath = ${oldExtractedPath} newExtractedPath = ${newExtractedPath}`);
                if (files.length > 0){
                    downloadMultiplyFiles(files, "Загрузка файлов ENB",
                        function (error, progress, info) {})
                        .then(() => extractMultiplyFiles(files, function (info) {
                            if (info.hasOwnProperty('error') && info.hasOwnProperty('extracted')
                                && info.hasOwnProperty('dest') && info.hasOwnProperty('file')){
                                if (info.file.type === 'old'){
                                    log.info(`Downloaded old ENB: ${info}`);
                                    oldExtractedPath = path.join(store.getters.DownloadPath, "enb", setting.oldEnb.name);
                                    log.info(`SET oldExtractedPath = ${oldExtractedPath}`)
                                }
                                else if (info.file.type === 'new'){
                                    log.info(`Download new ENB: ${info}`);
                                    newExtractedPath = path.join(store.getters.DownloadPath, "enb",  setting.enb.name);
                                    log.info(`SET newExtractedPath = ${newExtractedPath}`)
                                }
                            }

                        }))
                        .then(() => resolve1())
                }
                else{
                    resolve1();
                }
            }))
            .then (() => new Promise(resolve1 => {
                store.commit('SET_PROGRESS_STATE', 'Установка ENB');
                resolve1();
            }))
            .then(() => new Promise((resolve1, reject1) => {
                // delete old ENB files from GTA
                log.info(`start delete old enb files. Source ${oldExtractedPath}`)
                const oldEnbFilesList = walkSync(oldExtractedPath);
                oldEnbFilesList.forEach(file => {
                    let relativePath = path.relative(oldExtractedPath, file);
                    let gtaPath = path.join(store.getters.GtaPath, relativePath);
                    log.info(`delete ENB file ${gtaPath} relative ${relativePath} source ${file}`);
                    try{
                        if(fs.existsSync(gtaPath))
                            fs.unlinkSync(gtaPath);
                    }
                    catch (e) {
                        log.error(e);
                    }
                });
                resolve1();
            }))
            .then(() => new Promise((resolve1, reject1) => {
                //copy new ENB files
                log.info(`start copy new enb files. Source ${newExtractedPath}`);
                const newEnbFilesList = walkSync(newExtractedPath);
                newEnbFilesList.forEach(file => {
                    let relativePath = path.relative(newExtractedPath, file);
                    let gtaPath = path.join(store.getters.GtaPath, relativePath);
                    log.info(`copy ENB file from ${file} to ${gtaPath}`);
                    fs.copyFileSync(file, gtaPath);
                });
                resolve1();
            }))
            .then(() => new Promise(resolve1 => {
                store.commit('UPDATE_ENB', setting.enb.name);
                resolve1();
            }))
            .then(() => resolve())
            .catch(e => {
                log.error(e);
                reject(e);
            })
    })
}

/*
   ****************************************
   * Some Useful functions
   ****************************************
 */

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist;
}

function navigate(routerPath) {
    if (mainWindow.webContents) {
        mainWindow.webContents.send('navigate', routerPath);
    }
}

/**
 * @function
 *
 * @param files = array of files [{url, path}, {url, path}]
 * @param progressText text to display in prigress bar
 * @param cbProgress = callback function on One file downloaded
 * @returns {Promise<any> | Promise}
 */
function downloadMultiplyFiles(files, progressText = "Загрузка файлов", cbProgress = null){
    // files: [{url, path}, {url, path}]
    return new Promise((resolve, reject) => {
        let downloadSize = 0;
        let pathDiskToCheck = "C:";
        try {
            getMultiplyDownloadFileSize(files)
                .then((downloadSize_) => {
                    /**
                     * Prepare to check disk space
                     */
                    return new Promise(resolve1 => {
                        downloadSize = downloadSize_;
                        resolve1();
                    })
                })
                .then(() => {
                    // console.log(`downloadSize = ${downloadSize}`);
                    let results = [];
                    let chain = Promise.resolve();
                    let downloadedBytes = Number(0);
                    files.forEach(file => {
                        chain = chain
                            .then(() => new Promise((resolve1, reject1) => {
                                downloadFile(file.url, file.path, function (progress) {
                                    downloadedBytes += progress.speedBytes;
                                    //console.log(progress);
                                    let progressPercentage = Number(downloadedBytes/downloadSize * 100).toFixed(0);
                                    store.commit('SET_PROGRESS_STATE', `${progressText} (${progressPercentage}%) - ${progress.speed}`);
                                    store.commit('SET_PROGRESS_VALUE', progressPercentage);
                                })
                                    .then(filePath => {
                                        if (cbProgress){
                                            cbProgress(null, filePath, file);
                                        }
                                    })
                                    .then(() => resolve1())
                                    .catch(e => {
                                        log.error(e);
                                        if (cbProgress)
                                            cbProgress(e, null, info);
                                    })
                            }))
                    });
                    chain.then(() => resolve());
                })
                .catch(e => reject(e));
        }
        catch (e) {
            reject(e);
        }
    })
}

function getMultiplyDownloadFileSize(files) {
    return new Promise((resolve, reject) => {
        try {
            let chain = Promise.resolve();
            let result = Number(0);
            files.forEach(file => {
                // console.log(result);
                chain = chain
                    .then (() => new Promise((resolve1, reject1) =>{
                        getDowloadFileSize(file.url)
                            .then(size => result += Number(size))
                            .then(() => resolve1());
                    }))
            });
            chain.then(() => resolve(result));
        }
        catch (e) {
            log.error(e);
            reject(e);
        }
    })
}

function downloadFile(url, path, onProgress){
    return new Promise((resolve, reject) => {
        //console.log(url, path, onProgress)
        //log.info(`download file ${path.parse(url).base}`);
        try {
            DownloadManager.download({
                    url: url,
                    path: path,
                    onProgress: onProgress
                },
                (error, info) => {
                    if (error) reject(error);
                    resolve(info.filePath);
                }
            )
        }
        catch (e) {
            log.error(e);
            reject(e);
        }
    })
}

function getDowloadFileSize(url) {
    return new Promise((resolve, reject) => {
        api.methods.getResponseHeader(url)
            .then(header => {
                //console.log(header);
                // console.log(url, header['content-length'])
                resolve(Number(header['content-length'][0]))
            });
    });
}

function extractMultiplyFiles(files, cbProgress = null) {
    // files: [{srcPath, destPath}, {srcPath, destPath}]
    return new Promise((resolve, reject) => {
        try {
            let chain = Promise.resolve();
            files.forEach(file => {
                chain = chain
                    .then(() => new Promise((resolve1, reject1) => {
                        extractZip(file.srcPath, file.destPath)
                            .then(() => {
                                if (cbProgress){
                                    cbProgress({error:null, extracted: file.srcPath, dest: file.destPath, file: file});
                                }
                                return Promise.resolve();
                            })
                            .then(() => { resolve1() })
                            .catch(e => {
                                if (cbProgress){
                                    cbProgress({error: e, extracted: file.srcPath, dest: file.destPath, file: file});
                                }
                                log.error(e);
                                resolve1();
                            })
                    }))

            });
            chain.then(() => resolve());
        }
        catch (e) {
            reject(e);
        }
    })
}

function extractZip(srcPath, destPath) {
    return new Promise((resolve, reject) => {
        let unzipper = new DecompressZip(srcPath);

        unzipper.on('error', (err) => {
            reject(err);
        });


        unzipper.on('extract', function (l) {
            log.info(`finished extract ${l}`)
            resolve();
        });

        unzipper.on('progress', (fileIndex, fileCount) => {

        });

        unzipper.extract({
            path: destPath
        });
    });
}

function getFileNameByContentDisposition(contentDisposition){
    let regex = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/i;
    let matches = regex.exec(contentDisposition);
    let filename;

    if (matches != null && matches[3]) {
        filename = matches[3].replace(/['"]/g, '');
    }

    return decodeURI(filename);
}

/**
 *
 * @param path - path
 * @param downloadSize - size to download
 * @returns {Promise<any> | Promise}
 */
function checkSpace(path, downloadSize){
    return new Promise((resolve, reject) => {
        log.info(`Checking space on fisk ${path}. Space needs to download ${downloadSize}`);
        let free = getFreeSpace(path);
        if (free < downloadSize)
            reject("No space available");
        resolve();
    })
}

/**
 *
 * @param path
 * @returns {Promise<number>}
 */
async function getFreeSpace(path) {
    try {
        const { free } = await disk.check(path);
        log.info(`Free space ${free}`);
        return free
    } catch (err) {
        log.error(err);
        return 0
    }
}