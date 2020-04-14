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

// Immediately join a random room
Application.joinRoom(location.hash ? location.hash.replace("#", "") : undefined);
