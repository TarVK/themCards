import {jsx} from "@emotion/core";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {PrimaryButton} from "@fluentui/react";
import {useIsMobileView} from "../../services/useIsMobileView";

export const ContinueGame: FC = () => {
    const [h] = useDataHook();
    const isJudge = Application.isJudge(h);

    const room = Application.getRoom(h);
    const hasChosen = room?.getAnswer(h) || false;

    const isMobile = useIsMobileView();
    if (!isJudge) return <div />;
    return (
        <div css={{...(!isMobile && {display: "flex", flexDirection: "row-reverse"})}}>
            {hasChosen && (
                <PrimaryButton
                    css={{...(isMobile && {width: "100%"})}}
                    onClick={() => {
                        if (room) room.nextRound();
                    }}>
                    Next round
                </PrimaryButton>
            )}
        </div>
    );
};
