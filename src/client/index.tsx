import {jsx} from "@emotion/core";
import {render} from "react-dom";
import {App} from "./UI/App";
import {ThemeProvider} from "emotion-theming";
import {getTheme, initializeIcons} from "@fluentui/react";
import "./theme";
import {Application} from "./model/Application";
import {NotificationDisplayer} from "./components/NotificationManager/NotificationDisplayer";

initializeIcons();
const theme = getTheme();
render(
    <ThemeProvider theme={theme}>
        <App />
        <NotificationDisplayer />
    </ThemeProvider>,
    document.getElementById("root")
);

// Immediately join a random room, or the room from the URL
Application.joinRoom(location.hash ? location.hash.replace("#", "") : undefined);

// Potential heroku automatic sleep fix, just pinging the server from time to time (5 minutes)
setInterval(async () => {
    const sendTime = Date.now();
    const resp = await fetch("/ping");
    let delta = -1;
    try {
        const json = await resp.json();
        if (json.type == "pong") delta = Date.now() - sendTime;
    } catch (e) {}

    if (delta > 0) {
        // Got some resp, don't really need to do anything with it
        console.log("detect", delta);
    } else {
        console.error("Server unreachable");
    }
}, 1000 * 60 * 5);
