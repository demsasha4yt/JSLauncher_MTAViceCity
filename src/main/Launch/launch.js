import store from "../../renderer/store"
const log = require("electron-log");

const { spawn, execFile } = require('child_process');

export default class Launch {
    static createCorconfig(coreconfigPath, nickname){
        const fs = require("fs"),
            parseString = require("xml2js").parseString,
            xml2js = require("xml2js");

        let data = {
            "mainconfig": {
                "settings": {
                    "nick": nickname
                }
            }
        };
        console.log(data);

        var builder = new xml2js.Builder();
        var xml = builder.buildObject(data);
        console.log(xml);
        fs.writeFile(coreconfigPath, xml, function(err, a) {
            if (err) console.log(err);
            console.log("successfully written our update xml to file");
        });
    }

    static applytoCoreConfig(coreconfigPath, nickname)
    {
        const fs = require("fs"),
            parseString = require("xml2js").parseString,
            xml2js = require("xml2js");
        if (fs.existsSync(coreconfigPath)){
            fs.readFile(coreconfigPath, "utf-8", function(err, data) {
                if (err) {
                    throw err;
                }
                // we log out the readFile results
                // console.log(data);
                parseString(data, function(err, result) {
                    if (err) console.log(err);
                    // here we log the results of our xml string conversion
                    //console.log(result);

                    var json = result;
                    json.mainconfig.settings[0].nick[0] = nickname
                    console.log(json.mainconfig.settings)

                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(json);

                    fs.writeFile(coreconfigPath, xml, function(err, data) {
                        if (err) console.log(err);
                        console.log("successfully written our update xml to file");
                    });
                });
            });
        } else {
            this.createCorconfig(coreconfigPath, nickname);
        }
    }

    static launchMta (path, coreConfigPath = null, nickname = null) {
        if (coreConfigPath && nickname) {
            // save playerName to Settings
            store.commit('UPDATE_PLAYER_NAME', nickname)
            // Apply playerName to coreconfig path
            this.applytoCoreConfig(coreConfigPath, nickname)
        }
        store.commit('SET_PROGRAM_STATE', 'ingame')
        console.log("In launchMTA")
        this.child = require('child_process').execFile(path, (error, stdout, stderr) => {
            if (error) {
                store.commit('SET_PROGRAM_STATE', 'ready');
                log.error(error.toString());
                throw error;
            }
            store.commit('SET_PROGRAM_STATE', 'ready')
            //console.log(stdout);
        });

        this.child.on('close', () => {
            store.commit('SET_PROGRAM_STATE', 'ready')
        })
    }
}
