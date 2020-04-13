import {jsx} from "@emotion/core";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {useTheme} from "emotion-theming";
import {PrimaryButton} from "@fluentui/react";

export const ContinueGame: FC = () => {
    const [h] = useDataHook();
    const isJudge = Application.isJudge(h);

    const room = Application.getRoom(h);
    const isRevealed = room?.isRevealed(h) || false;
    const hasChosen = room?.getAnswer(h) || false;

    // Count how many players are ready
    const playerCount = (room?.getPlayers(h).length || 0) - 1;
    const readyCount = room?.getReadyCount(h) || 0;

    if (!isJudge) return <div />;
    return (
        <div css={{display: "flex", flexDirection: "row-reverse"}}>
            {!isRevealed && (
                <PrimaryButton
                    onClick={() => {
                        if (room && readyCount > 0) room.reveal();
                    }}>
                    Reveal cards ({readyCount}/{playerCount})
                </PrimaryButton>
            )}
            {hasChosen && (
                <PrimaryButton
                    onClick={() => {
                        if (room) room.nextRound();
                    }}>
                    Next round
                </PrimaryButton>
            )}
        </div>
    );
};
