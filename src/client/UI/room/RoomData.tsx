import {jsx} from "@emotion/core";
import {FC} from "react";
import {useDataHook} from "model-react";
import {RoomName} from "./RoomName";
import {Application} from "../../model/Application";
import {DefaultButton, PrimaryButton} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {SettingsModal} from "./settingsModal/SettingsModal";

export const RoomData: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h);
    const isAdmin = Application.isAdmin(h);
    const isGameGoing = room?.getJudge(h) != null;
    const startGame = () => {
        if (room) room.resetDeck();
    };

    const theme = useTheme();
    return (
        <div>
            <RoomName /> <SettingsModal />
            <div css={{marginTop: theme.spacing.s1}} />
            {isAdmin &&
                (isGameGoing ? (
                    <DefaultButton onClick={startGame}>Restart</DefaultButton>
                ) : (
                    <PrimaryButton onClick={startGame}>Start game!</PrimaryButton>
                ))}
        </div>
    );
};
