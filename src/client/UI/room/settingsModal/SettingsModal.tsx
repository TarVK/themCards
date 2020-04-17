import {jsx} from "@emotion/core";
import {IconButton, Modal, SearchBox, Toggle, Button} from "@fluentui/react";
import {useDataHook} from "model-react";
import {FC, Fragment, useEffect, useState} from "react";
import {TextField} from "../../../components/TextField";
import {Title} from "../../../components/Title";
import {Application} from "../../../model/Application";
import {useSyncState} from "../../../services/useSyncState";
import {useTheme} from "../../../services/useTheme";
import {PackSelection} from "./PackSelection";
import {useIsMobileView} from "../../../services/useIsMobileView";
import {FakeFocus} from "../../../components/FakeFocus";

export const SettingsModal: FC = () => {
    const [h, c] = useDataHook();

    // Retrieve all relevant data
    const room = Application.getRoom(h);
    const isAdmin = Application.isAdmin(h);
    const cardsSelection = room?.getCardSelection();

    // Retrieve the packs
    const selectedPacks = cardsSelection?.getSelection(h) || [];

    // Open the packs if no selection was made yet
    const [isOpen, setOpen] = useState(false);
    useEffect(() => {
        if (room && selectedPacks.length == 0) setOpen(true);
    }, [room, selectedPacks.length == 0]);

    // Keep track of some local data
    const [search, setSearch] = useState("");
    const [handSize, setHandSize] = useSyncState(room?.getHandSize(h) || 0);
    const [maxPlayerCount, setMaxPlayerCount] = useSyncState(
        room?.getMaxPlayerCount(h) || 2
    );

    const isMobile = useIsMobileView();
    const theme = useTheme();
    return (
        <Fragment>
            <IconButton
                iconProps={{iconName: "Settings"}}
                styles={{
                    root: {
                        color: theme.palette.black,
                        verticalAlign: "middle",
                    },
                }}
                title="Settings"
                ariaLabel="Settings"
                onClick={() => setOpen(true)}
            />
            <Modal
                isOpen={isOpen}
                onDismiss={() => setOpen(false)}
                styles={{main: {padding: theme.spacing.s1, width: 800}}}>
                <div css={{display: "flex", maxHeight: "90vh", flexDirection: "column"}}>
                    {isMobile && (
                        <div css={{display: "flex", alignItems: "flex-end"}}>
                            <Title css={{flexGrow: 1}}>Room settings</Title>
                            <IconButton
                                iconProps={{iconName: "remove"}}
                                onClick={() => setOpen(false)}
                            />
                        </div>
                    )}
                    <div css={{display: "flex", alignItems: "flex-end"}}>
                        <TextField
                            label={"Hand size"}
                            css={{flexGrow: 1}}
                            value={handSize + ""}
                            type="number"
                            disabled={!isAdmin}
                            onChange={(e, v) => v !== undefined && setHandSize(Number(v))}
                            onBlur={() => {
                                if (room && room.getHandSize(null) != handSize)
                                    room.setHandSize(handSize);
                            }}
                        />

                        <TextField
                            label={"Max player count"}
                            css={{
                                flexGrow: 1,
                                marginLeft: theme.spacing.s1,
                                marginRight: theme.spacing.s1,
                            }}
                            value={maxPlayerCount + ""}
                            type="number"
                            disabled={!isAdmin}
                            onChange={(e, v) =>
                                v !== undefined && setMaxPlayerCount(Number(v))
                            }
                            onBlur={() => {
                                if (room) room.setMaxPlayerCount(maxPlayerCount);
                            }}
                        />
                        <Toggle
                            label="Private room"
                            checked={room?.isPrivate(h) || false}
                            disabled={!isAdmin}
                            onChange={(e, v) => {
                                if (room && v !== undefined) room.setPrivate(v);
                            }}
                        />
                    </div>

                    {/* We don't want an actual field to auto focus, so this is a dirty fix */}
                    <FakeFocus />

                    <Title
                        css={{
                            marginTop: theme.spacing.m,
                            marginBottom: theme.spacing.s1,
                        }}>
                        Card packs selection
                    </Title>
                    <SearchBox
                        placeholder="Search"
                        underlined
                        value={search}
                        onChange={(e, v) => v !== undefined && setSearch(v)}
                    />
                    <div
                        css={{
                            flex: 1,
                            flexShrink: 1,
                            minHeight: 0,
                            overflow: "auto",
                        }}
                        data-is-scrollable={true}>
                        <PackSelection filter={search.toLowerCase()} />
                    </div>
                </div>
            </Modal>
        </Fragment>
    );
};
