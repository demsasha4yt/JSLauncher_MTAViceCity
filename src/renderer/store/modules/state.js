const log = require('electron-log');

const state = {
    programState: 'init',
    progressValue: 0,
    progressState: "Инициализация лаунчера",
    launchBtnText: 'Играть',
    launchBtnEnabled: true,
    settingsBtnText: 'Настройки',
    settingsBtnEnabled: true,
    needUpdate: [],
    toApplySettings: []
};

const mutations = {
    SET_PROGRAM_STATE (state, newState) {
        state.programState = newState;
        switch (newState) {
            case 'init': {
                state.progressState = 'Инициализация лаунчера';
                state.progressValue = 0;
                break
            }
            case 'fetch-launcher-version': {
                state.progressState = 'Проверка обновлений лаунчера';
                break;
            }
            case 'check-launcher-version': {
                break;
            }
            case 'download-launcher-updates': {
                break;
            }
            case 'before-launcher-update': {
                state.progressState = 'Загрузка завершена. Перезагрузка через 1 секунду.';
                break
            }
            case 'check-exist-gta': {
                state.progressState = 'Проверка GTA';
                break;
            }
            case 'check-have-gta': {
                state.progressState = 'Проверка GTA';
                break;
            }
            case 'check-gta-updates': {
                state.progressState = 'Проверка обновлений GTA';
                break;
            }
            case 'gta-not-updated': {
                state.progressState = 'Необходимо установить обновление. Нажмите на кнопку обновить';
                state.launchBtnText = "Обновить";
                break;
            }
            case 'install-gta': {
                state.launchBtnText = 'Подождите..';
                state.progressState = 'Подготовка к установке GTA';
                break;
            }
            case 'updating-gta': {
                state.launchBtnText = 'Подождите..';
                state.progressState = 'Подготовка к обновлению';
                break;
            }
            case 'apply-settings':{
                state.progressState = "Применение настроек";
                break;
            }
            case 'get-api-servers': {
                state.progressState = 'Подключение к серверам обновлений';
                break;
            }
            case 'not-found': {
                state.progressState = 'Гта не найдена';
                break;
            }
            case 'ingame': {
                state.progressState = 'В игре';
                break;
            }
            case 'ready': {
                state.launchBtnText = "Играть";
                state.progressValue = 100;
                state.progressState = 'Игра готова!';
                break
            }
        }
        log.info(`set programstate to ${state.programState}`);
    },
    SET_PROGRESS_VALUE (state, val){
        state.progressValue = val
        //log.info(`set progressValue to ${val}`);
    },
    SET_PROGRESS_STATE (state, val){
        state.progressState = val;
        log.info(`set progressState to ${val}`);
    },
    SET_NEED_UPDATE(state, val){
        state.needUpdate = val;
        log.info(`set needupdate to ${val}`)
    },
    SET_LAUNCH_BTN_TEXT(state, val){
        state.launchBtnText = val;
        console.log(val);
    },
    SET_LAUNCH_BTN_ENABLED(state, val){
        state.launchBtnEnabled = val;
    },
    SET_SETTINGS_BTN_TEXT(state, val){
        state.settingsBtnText = val;
    },
    SET_SETTING_BTN_ENABLED(state, val){
        state.settingsBtnEnabled = val;
    },
    SET_TO_APPLY_SETTINGS(state, val){
        state.toApplySettings = val;
    },
    PUSH_TO_APPLY_SETTINGS(state, val){
        state.toApplySettings.push(val)
    }
};


const actions = {
    setToApplySettings({commit}, val){
        commit('SET_TO_APPLY_SETTINGS', val)
    },
    pushToApplySettings({commit}, setting){
        commit('PUSH_TO_APPLY_SETTINGS', setting)
    },
    setProgramState({commit}, value){
        commit('SET_PROGRAM_STATE', value)
    },
    startInstallGta({commit}, installPath){
        // Handled in main process by subscribe to Actions
    }
};

const getters = {
    /**
     * @return {string}
     */
    ProgramState (state) {
        return state.programState
    },
    /**
     * @return {int}
     */
    ProgressValue (state) {
        return state.progressValue
    },
    /**
     * @return {string}
     */
    ProgressState(state) {
        return state.progressState
    },
    /**
     * @return {string}
     */
    NeedUpdate(state) {
        return state.needUpdate;
    },
    /**
     * @return {string}
     */
    LaunchButtonText(state){
        return state.launchBtnText;
    },
    /**
     * @return {boolean}
     */
    LaunchButtonEnabled(state){
        return state.launchBtnEnabled;
    },
    /**
     * @return {string}
     */
    SettingsButtonText(state){
        return state.settingsBtnText;
    },
    /**
     * @return {boolean}
     */
    SettingsButtonEnabled(state){
        return state.settingsBtnEnabled;
    },
    ToApplySettings(state){
        return state.toApplySettings;
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
