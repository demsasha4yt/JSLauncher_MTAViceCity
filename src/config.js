module.exports = {
    develop: false,
    updateTokens: {
        release:{
            feedUrl: {
                provider: "generic",
                url: "https://gitlab.com/api/v4/projects/13366947/jobs/artifacts/master/raw/build/?job=build"
            },
            token: "1"
        },
        develop: {
            feedUrl: {
                provider: "generic",
                url: "https://gitlab.com/api/v4/projects/13366947/jobs/artifacts/develop/raw/build/?job=build"
            },
            token: "1"
        }
    }
};
