let data: {
    domain: {
        socket: {
            address: string;
            port: string;
        };
        resources: {
            address: string;
            port: string;
        };
    };
    dev: boolean;
};

// process.env.NODE_ENV is a variable passed by either webpack, or the server startup process
// See webpack.config.js and jest.config.js (defaults to test)
if (process.env.NODE_ENV === "production") {
    data = {
        // TODO: read url from environment variables, put port in webpack build
        domain: {
            socket: {
                address: "https://themCards.herokuapp.com",
                port: process.env.PORT || "",
            },
            resources: {
                address: "https://themCards.herokuapp.com",
                port: process.env.PORT || "",
            },
        },
        dev: false,
    };
} else {
    data = {
        domain: {
            socket: {
                address: "http://localhost",
                port: "4000",
            },
            resources: {
                address: "http://localhost",
                port: "3000",
            },
        },
        dev: true,
    };
}

export const domain = data.domain;
export const dev = data.dev;
