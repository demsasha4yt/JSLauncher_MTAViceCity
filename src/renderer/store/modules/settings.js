const path = require("path")

const state = {
    settings: {
        playerName: '',
        clientVersion: '0.4.6',
        launcherVersion: '0.1',
        enb: 'NOENB',
        mainf: '0.4.1',
        anim: '0.4.1',
        audio: '0.4.1',
        data: '0.4.6',
        models: '0.4.5',
        text: '0.4.1',
        gtaint: '0.4.1',
        gta3: '0.4.2',
        player: '0.4.1',
        vcdff: '0.4.1',
        vccol: '0.4.6',
        vctxd: '0.4.5',
        mta: '0.4.5',
        gtaPath: '',
        launcherPath: '',
        downloadPath: '',
    },
    enbList: []
}; //

const mutations = {
    UPDATE_PLAYER_NAME(state, name, save = false){
        state.settings.playerName = name
    },
    UPDATE_CLIENT_VERSION(state, val, save = false)
    {
        state.settings.clientVersion = val

    },
    UPDATE_LAUNCHER_VERSION(state, val, save = false)
    {
        state.settings.launcherVersion = val
    },
    UPDATE_AUDIO_VERSION(state, val, save = false)
    {
        state.settings.audio = val

    },
    UPDATE_ANIM_VERSION(state, val, save = false)
    {
        state.settings.anim = val

    },
    UPDATE_DATA_VERSION(state, val, save = false)
    {
        state.settings.data = val

    },
    UPDATE_MODELS_VERSION(state, val, save = false)
    {
        state.settings.models = val

    },
    UPDATE_TEXT_VERSION(state, val, save = false)
    {
        state.settings.text = val
    },
    UPDATE_GTA_INT_VERSION(state, val, save = false)
    {
        state.settings.gtaint = val

    },
    UPDATE_GTA3_VERSION(state, val, save = false)
    {
        state.settings.gta3 = val
    },
    UPDATE_PLAYER_VERSION(state, val, save = false)
    {
        state.settings.player = val

    },
    UPDATE_VCCOL_VERSION(state, val, save = false)
    {
        state.settings.vccol = val

    },
    UPDATE_VCTXD_VERSION(state, val, save = false)
    {
        state.settings.vctxd = val

    },
    UPDATE_VCDFF_VERSION(state, val, save = false)
    {
        state.settings.vcdff = val
    },
    UPDATE_MTA_VERSION(state, val, save = false)
    {
        state.settings.mta = val
    },
    UPDATE_MAIN_VERSION(state, val){
        state.settings.mainf = val;
    },
    UPDATE_GTA_PATH(state, val, save = false)
    {
        state.settings.gtaPath = val
    },
    UPDATE_LAUNCHER_PATH(state, val, save = false)
    {
        state.settings.launcherPath = val
    },
    UPDATE_ALL_SETTINGS(state, val, save = false)
    {
        state.settings = val;
    },
    UPDATE_ENB_LIST(state, val){
        state.enbList = val;
    },
    UPDATE_ENB(state, val){
        state.settings.enb = val;
    },
    UPDATE_DOWNLOAD_PATH(state, val){
        state.settings.downloadPath = val;
    }
};

const actions = {
    haveGtaSelect({commit}, value){
        commit('UPDATE_GTA_PATH', value);
        commit('SET_PROGRAM_STATE', 'check-have-gta');
    },
    updateDownloadPath({commit}, value){
      commit('UPDATE_DOWNLOAD_PATH', value);
    },
    updateVersionsFromArray({commit}, updates){
        /*
            *
            * updates = [
            * {
            *   name: "main",
            *   obj: {
            *       info: {
            *           version: '0.x.x"
            *       }
            *   },
            *  ]
            *
         */
        updates.forEach(update => {
            switch (update.name) {
                case "mainf":{
                    commit('UPDATE_MAIN_VERSION', update.obj.info.version);
                    break;
                }
                case "anim":{
                    commit('UPDATE_ANIM_VERSION', update.obj.info.version);
                    break;
                }
                case "audio":{
                    commit('UPDATE_AUDIO_VERSION', update.obj.info.version);
                    break;
                }
                case "data":{
                    commit('UPDATE_DATA_VERSION', update.obj.info.version);
                    break;
                }
                case "models":{
                    commit('UPDATE_MODELS_VERSION', update.obj.info.version);
                    break;
                }
                case "text":{
                    commit('UPDATE_TEXT_VERSION', update.obj.info.version);
                    break;
                }
                case "gtaint":{
                    commit('UPDATE_GTA_INT_VERSION', update.obj.info.version);
                    break;
                }
                case "gta3":{
                    commit('UPDATE_GTA3_VERSION', update.obj.info.version);
                    break;
                }
                case "player":{
                    commit('UPDATE_PLAYER_VERSION', update.obj.info.version);
                    break;
                }
                case "vccol":{
                    commit('UPDATE_VCCOL_VERSION', update.obj.info.version);
                    break;
                }
                case "vctxd":{
                    commit('UPDATE_VCTXD_VERSION', update.obj.info.version);
                    break;
                }
                case "vcdff":{
                    commit('UPDATE_VCDFF_VERSION', update.obj.info.version);
                    break;
                }
                case "mta":{
                    commit('UPDATE_MTA_VERSION', update.obj.info.version);
                    break;
                }
            }
        })
    }
};

const getters = {
    /**
     * @return {string}
     */
    PlayerName(state) {
        return state.settings.playerName
    },
    /**
     * @return {string}
     */
    ClientVersion(state){
        return state.settings.clientVersion
    },
    /**
     * @return {string}
     */
    LauncherVersion(state){
        return state.settings.launcherVersion
    },
    /**
     * @return {string}
     */
    LauncherPath(state){
        return state.settings.launcherPath
    },
    /**
     * @return {string}
     */
    Enb(state){
        return state.settings.enb
    },
    /**
     * @return {string}
     */
    AnimVersion(state){
        return state.settings.anim
    },
    /**
     * @return {string}
     */
    AudioVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    DataVersion(state){
        return state.settings.data
    },
    /**
     * @return {string}
     */
    ModelsVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    TextVersion(state){
        return state.settings.text
    },
    /**
     * @return {string}
     */
    GtaIntVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    Gta3Version(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    VcDffVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    VcTxdVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    VcColVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    MtaVersion(state){
        return state.settings.audio
    },
    /**
     * @return {string}
     */
    GtaPath(state) {
        return state.settings.gtaPath
    },
    /**
     * @return {string}
     */
    MtaPath (state) {
        return path.join(state.settings.gtaPath, "MTA")
    },
    /**
     * @return {string}
     */
    MtaExePath(state) {
        return path.join(state.settings.gtaPath, "MTA", "Multi Theft Auto.exe")
    },
    /**
     * @return {string}
     */
    CoreConfigPath(state){
        try {
            console.log(state.settings.gtaPath + typeof state.settings.gtaPath);
            return path.join(state.settings.gtaPath, 'MTA', 'mta', 'config', 'coreconfig.xml')
        } catch (e) {
            state.settings.gtaPath = ''
        }

    },
    AllSettings(state) {
        return state.settings
    },
    EnbList(state){
        return state.enbList;
    },
    /**
     * @return {string}
     */
    DownloadPath(state){
        return state.settings.downloadPath;
    }
};

export default {
    state,
    mutations,
    actions,
    getters
}
