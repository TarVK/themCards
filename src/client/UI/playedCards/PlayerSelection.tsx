import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {Player} from "../../model/game/Player";
import {AnswerCard} from "../../components/AnswerCard";
import {Stack} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";

export const PlayerSelection: FC<{player: Player}> = ({player}) => {
    const [h, c] = useDataHook();
    const me = Application.getPlayer(h);
    const room = Application.getRoom(h);
    const areMyCards = player.is(me);
    const roomRevealed = room?.isRevealed(h);
    const revealed = roomRevealed || areMyCards;
    const cards = player.getSelection(h);

    const canSelect = Application.isJudge(h) && roomRevealed && !room?.getAnswer(h);
    const onSelect = () => {
        if (canSelect && room) room.pickAnswer(player);
    };

    const canRemove = areMyCards && !roomRevealed;
    const removeCard = (card: string) => {
        if (me) me.setSelection((me.getSelection(null) || []).filter(c => c != card));
    };

    const won = player.hasSelection(room?.getAnswer(h) || [], h);

    const theme = useTheme();
    if (cards.length > 1 || won) {
        return (
            <div
                onClick={onSelect}
                css={{
                    cursor: canSelect ? "pointer" : "normal",
                    padding: theme.spacing.s1,
                    backgroundColor: won
                        ? theme.palette.greenLight
                        : theme.palette.themeLighter,
                }}>
                <Stack disableShrink horizontal tokens={{childrenGap: theme.spacing.s1}}>
                    {cards.map(card => (
                        <AnswerCard
                            key={card}
                            revealed={revealed}
                            onRemove={canRemove ? () => removeCard(card) : undefined}>
                            {card}
                        </AnswerCard>
                    ))}
                </Stack>
            </div>
        );
    } else {
        const card = cards[0];
        if (!card) return <div />;
        return (
            <AnswerCard
                css={{
                    cursor: canSelect ? "pointer" : "normal",
                }}
                onClick={onSelect}
                onRemove={canRemove ? () => removeCard(card) : undefined}
                key={card}
                revealed={revealed}>
                {card}
            </AnswerCard>
        );
    }
};
