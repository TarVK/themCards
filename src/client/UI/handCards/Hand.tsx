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

    const selecting = !isJudge && !room?.isRevealed(h);
    const canSelect = selecting && selection.length < requiredCardCount;

    const theme = useTheme();
    if (useIsMobileView()) {
        if (!selecting) return <div />;
        return (
            <div
                css={{
                    width: "100%",
                    backgroundColor: theme.palette.themeLighter,
                    ...(isJudge && {opacity: 0.5, cursor: "no-drop"}),
                }}>
                <Stack disableShrink tokens={{childrenGap: "s1"}}>
                    {cards.map((card, i) => (
                        <AnswerCard
                            key={i}
                            css={canSelect ? {cursor: "pointer"} : undefined}
                            revealed
                            onClick={() => {
                                if (player && canSelect)
                                    player.setSelection([...selection, card]);
                            }}>
                            {card}
                        </AnswerCard>
                    ))}
                </Stack>
            </div>
        );
    }

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
