import {render} from "react-dom";
import {jsx} from "@emotion/core";
import {App} from "./UI/App";
import {ThemeProvider} from "emotion-theming";
import {getTheme, initializeIcons} from "@fluentui/react";
import "./theme";
import {Application} from "./model/Application";
initializeIcons();

const theme = getTheme();

render(
    <ThemeProvider theme={theme}>
        <div
            css={{
                fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
            }}>
            <App />
        </div>
    </ThemeProvider>,
    document.getElementById("root")
);

// Immediately join a random room
Application.joinRoom();
