import {jsx} from "@emotion/core";
import {FC, useState} from "react";
import {useDataHook} from "model-react";
import {Application} from "../model/Application";
import {useSyncState} from "../services/useSyncState";
import {Hand} from "./handCards/Hand";
import {DefaultLoaderSwitch} from "../components/DefaultLoaderSwitch";
import {useIsMobileView} from "../services/useIsMobileView";
import {PlayerList} from "./playerList/PlayerList";
import {RoomData} from "./room/RoomData";
import {PlayedCards} from "./playedCards/PlayedCards";
import {Judging} from "./judging/Judging";
import {useTheme} from "../services/useTheme";
import {Surface} from "../components/Surface";
import {CardsSelection} from "../model/game/CardsSelection";
import {PackSelection} from "./room/packSelection/PackSelection";

export const App: FC = () => {
    const [h, c] = useDataHook();
    const player = Application.getPlayer(h);
    const room = Application.getRoom(h);

    const mobile = useIsMobileView();
    if (mobile) {
        return <div>hoi</div>;
    }

    const theme = useTheme();
    return (
        <DefaultLoaderSwitch {...c}>
            <div
                css={{
                    display: "flex",
                    flexDirection: "row",
                    height: "100%",
                    width: "100%",
                    maxWidth: "auto",
                }}>
                <div
                    css={{
                        height: "100%",
                        overflow: "auto",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        justifyContent: "space-between",
                    }}>
                    <div css={{height: 300}}>
                        <Judging />
                    </div>
                    <div css={{height: 300}}>
                        <PlayedCards />
                    </div>
                    <div>
                        <Hand />
                    </div>
                </div>
                <Surface
                    css={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: theme.palette.themeLight,
                        flexShrink: 0,
                        width: 250,
                    }}>
                    <div
                        css={{
                            padding: theme.spacing.s1,
                            backgroundColor: theme.palette.themeLighter,
                        }}>
                        <RoomData />
                    </div>
                    <div css={{flexGrow: 1}}>
                        <PlayerList />
                    </div>
                </Surface>
                {/* <PackSelection /> */}
            </div>
        </DefaultLoaderSwitch>
    );
};
