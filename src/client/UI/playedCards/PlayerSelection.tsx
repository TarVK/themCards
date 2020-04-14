import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {Player} from "../../model/game/Player";
import {AnswerCard} from "../../components/AnswerCard";
import {Stack} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {useIsMobileView} from "../../services/useIsMobileView";
import {PlayerComp} from "../playerList/PlayerComp";

export const PlayerSelection: FC<{player: Player; revealed: boolean}> = ({
    player,
    revealed,
}) => {
    const [h, c] = useDataHook();
    const me = Application.getPlayer(h);
    const room = Application.getRoom(h);
    const areMyCards = player.is(me);
    const roomRevealed = room?.isRevealed(h);
    const roomAllRevealed = room?.areAllRevealed(h);
    const cards = player.getSelection(h);

    // Judge related actions
    const isJudge = Application.isJudge(h);
    const answer = room?.getAnswer(h);

    const canReveal = isJudge && !revealed && !answer;
    const canSelect = isJudge && roomAllRevealed && !answer;
    const canGotoNextRound = isJudge && answer;
    const onSelect = () => {
        if (room) {
            if (canSelect) room.pickAnswer(player);
            if (canReveal) room.revealAnswer(player);
            if (canGotoNextRound) room.nextRound();
        }
    };

    // Player related actions
    const canRemove = areMyCards && !roomRevealed;
    const removeCard = (card: string) => {
        if (me) me.setSelection((me.getSelection(null) || []).filter(c => c != card));
    };

    // Styling
    const won = player.hasSelection(room?.getAnswer(h) || [], h);
    const theme = useTheme();
    const isMobile = useIsMobileView();
    if (cards.length > 1 || won) {
        return (
            <div
                onClick={onSelect}
                title={canSelect ? "Pick as best" : canReveal ? "Reveal" : undefined}
                css={{
                    cursor: canSelect || canReveal ? "pointer" : "normal",
                    padding: theme.spacing.s1,
                    backgroundColor: won
                        ? theme.palette.greenLight
                        : theme.palette.themeLighter,
                }}>
                <Stack
                    disableShrink
                    horizontal={!isMobile}
                    tokens={{childrenGap: theme.spacing.s1}}>
                    {cards.map(card => (
                        <AnswerCard
                            key={card}
                            revealed={revealed}
                            halfRevealed={areMyCards}
                            onRemove={canRemove ? () => removeCard(card) : undefined}>
                            {card}
                        </AnswerCard>
                    ))}
                </Stack>
                {won && isMobile && (
                    <div css={{backgroundColor: "rgba(255,255,255,0.5)"}}>
                        <PlayerComp player={player} plain />
                    </div>
                )}
            </div>
        );
    } else {
        const card = cards[0];
        if (!card) return <div />;
        return (
            <AnswerCard
                title={canSelect ? "Pick as best" : canReveal ? "Reveal" : undefined}
                css={{
                    cursor: canSelect || canReveal ? "pointer" : "normal",
                }}
                onClick={onSelect}
                onRemove={canRemove ? () => removeCard(card) : undefined}
                key={card}
                revealed={revealed}
                halfRevealed={areMyCards}>
                {card}
            </AnswerCard>
        );
    }
};
