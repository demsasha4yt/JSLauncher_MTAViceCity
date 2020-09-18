const Promise = require('es6-promise');
const { net } = require('electron')

let data = {
    urls: [
        'https://download.mtavc.ru',
    ]
};

module.exports = {
    data,
    methods: {
        getResponseData,
        getResponseHeader,
        getApiServer
    }
};

function getResponseData(url) {
    return new Promise((resolve, reject) => {
        try {
            const request = net.request(url)
            request.on('response', (response) => {
                let responseData = '';
                response.on('data', (chunk) => {
                    responseData += chunk;
                });
                response.on('end', () => {
                    resolve(responseData);
                })
            });
            request.end()
        } catch (e){
            reject(e)
        }
    });
}

function  getResponseHeader(url) {
    return new Promise((resolve, reject) => {
        const request = new net.request({
            method: 'HEAD',
            url: url,
        });

        request.on('response', response => {
            //console.log(response.headers);
            resolve(response.headers);
        });

        request.on('error', error => {
            reject(error);
        });
        request.end();
    })
}

function getApiServer() {
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0, c = data.urls.length; i < c; i++ ) {
                (function (url) {
                    getResponseData(`${url}/api/connect`)
                        .then(response => {
                            if ((JSON.parse(response).Message === 'OK'))
                                resolve(url);
                            // if last not resolved reject No available update servers
                            if (i === data.urls.length - 1) reject("No available update servers")
                        });
                })( data.urls[i] );
            }
        } catch (e) {
            reject("No available update servers")
        }
    });
}
