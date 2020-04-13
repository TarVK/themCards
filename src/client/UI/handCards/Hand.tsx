import {jsx} from "@emotion/core";
import {FC} from "react";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {DefaultLoaderSwitch} from "../../components/DefaultLoaderSwitch";
import {AnswerCard} from "../../components/AnswerCard";
import {Stack} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {useIsMobileView} from "../../services/useIsMobileView";
import {HorizontalScroller} from "../../components/HorizontalScroller";

export const Hand: FC = () => {
    const [h, c] = useDataHook();
    const player = Application.getPlayer(h);
    const room = Application.getRoom(h);
    const cards = player?.getHand(h) || [];
    const isJudge = Application.isJudge(h);

    const requiredCardCount = room?.getRequiredAnswerCount(h) || 0;
    const selection = player?.getSelection(h) || [];

    const canSelect =
        !isJudge && !room?.isRevealed(h) && selection.length < requiredCardCount;

    const theme = useTheme();
    const mobile = useIsMobileView();

    return (
        <div css={{...(isJudge && {opacity: 0.5, cursor: "no-drop"})}}>
            <HorizontalScroller>
                <Stack
                    horizontal
                    disableShrink
                    tokens={{padding: "m", childrenGap: "m"}}
                    css={{width: "fit-content"}}>
                    {cards.map((card, i) => (
                        <AnswerCard
                            key={i}
                            css={canSelect ? {cursor: "pointer"} : undefined}
                            revealed
                            onClick={() => {
                                if (player && canSelect) {
                                    player.setSelection([...selection, card]);
                                }
                            }}>
                            {card}
                        </AnswerCard>
                    ))}
                </Stack>
            </HorizontalScroller>
        </div>
    );
};
