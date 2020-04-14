import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../model/Application";
import {Hand} from "./handCards/Hand";
import {DefaultLoaderSwitch} from "../components/DefaultLoaderSwitch";
import {useIsMobileView} from "../services/useIsMobileView";
import {PlayerList} from "./playerList/PlayerList";
import {RoomData} from "./room/RoomData";
import {PlayedCards} from "./playedCards/PlayedCards";
import {Judging} from "./judging/Judging";
import {useTheme} from "../services/useTheme";
import {Surface} from "../components/Surface";
import {Player} from "../model/game/Player";
import {createToast} from "../components/NotificationManager/createToast";
import {MessageBarType, Panel, PanelType, IconButton} from "@fluentui/react";
import {useSyncState} from "../services/useSyncState";

export const App: FC = () => {
    const [h, c] = useDataHook();
    const player = Application.getPlayer(h);
    const room = Application.getRoom(h);
    const answering = room?.getAnsweringPlayers(h).find(({player: p}) => p.is(player));
    const isRevealed = room?.isRevealed(h);

    useEffect(() => {
        const listener = (kicked: Player) => {
            if (kicked.is(player)) {
                Application.joinRoom("Kicked");
                createToast(`You were kicked!`, MessageBarType.error);
            } else {
                createToast(`${kicked.getName(null)} was kicked`);
            }
        };

        room?.on("kick", listener);
        return () => void room?.off("kick", listener);
    }, [room]);

    const theme = useTheme();
    const [isMenuOpen, setMenuOpen] = useSyncState(
        player?.getHand(h).length == 0 || false
    );
    if (useIsMobileView())
        return (
            <DefaultLoaderSwitch {...c}>
                <IconButton
                    iconProps={{iconName: "GlobalNavButton"}}
                    styles={{
                        root: {
                            color: theme.palette.black,
                            position: "absolute",
                            right: theme.spacing.s1,
                            top: 12,
                        },
                        icon: {
                            fontSize: 25,
                        },
                    }}
                    title="Menu"
                    ariaLabel="Menu"
                    onClick={() => setMenuOpen(true)}
                />
                <div
                    css={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <div>
                        <Judging />
                    </div>
                    <div
                        css={{
                            flexGrow: 4,
                            overflow: "auto",
                            ...(!isRevealed && {flexShrink: 0}),
                        }}>
                        <PlayedCards />
                    </div>
                    <div
                        css={{
                            overflow: "auto",
                            ...(!isRevealed && answering && {minHeight: 100}),
                            boxShadow: theme.effects.elevation64,
                        }}>
                        <Hand />
                    </div>
                </div>
                <Panel
                    isOpen={isMenuOpen}
                    isLightDismiss
                    type={PanelType.custom}
                    customWidth={"250px"}
                    onRenderNavigation={() => <div />}
                    styles={{
                        main: {backgroundColor: theme.palette.themeLight},
                        content: {padding: 0},
                        commands: {margin: 0},
                    }}
                    onDismiss={() => setMenuOpen(false)}>
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
                </Panel>
            </DefaultLoaderSwitch>
        );

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
