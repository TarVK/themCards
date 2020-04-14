import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {Player} from "../../model/game/Player";
import {shuffleArray} from "../../../server/services/shuffleArray";
import {Stack, Spinner} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {PlayerSelection} from "./PlayerSelection";
import {HorizontalScroller} from "../../components/HorizontalScroller";
import {useIsMobileView} from "../../services/useIsMobileView";
import {ContinueGame} from "../judging/ContinueGame";

export const PlayedCards: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h);
    const player = Application.getPlayer(h);

    const answeringPlayers = room?.getAnsweringPlayers(h) || [];
    const readyCount = room?.getReadyCount(h) || 0;
    const isAnswering = answeringPlayers.find(({player: p}) => p.is(player));
    const revealedAny = room?.isRevealed(h) || false;
    const selectedAnswer = room?.getAnswer(h);
    const isJudge = Application.isJudge(h);

    const theme = useTheme();
    if (useIsMobileView())
        return (
            <div
                css={{
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                <Stack disableShrink tokens={{padding: "s1", childrenGap: "s1"}}>
                    {(player && !revealedAny && isAnswering
                        ? [{player, revealed: false}]
                        : answeringPlayers
                    ).map(({player, revealed}) => (
                        <PlayerSelection
                            key={player.getID()}
                            player={player}
                            revealed={revealed}
                        />
                    ))}
                </Stack>
                {(!selectedAnswer || !isJudge) && answeringPlayers.length > 0 && (
                    <div css={{padding: theme.spacing.s1}}>
                        {readyCount}/{answeringPlayers.length} players answered
                    </div>
                )}
                {selectedAnswer && isJudge && <ContinueGame />}
            </div>
        );

    return (
        <div>
            <HorizontalScroller>
                <Stack
                    horizontal
                    disableShrink
                    tokens={{padding: "m", childrenGap: "m"}}
                    css={{width: "fit-content"}}>
                    {answeringPlayers.map(({player, revealed}) => (
                        <PlayerSelection
                            key={player.getID()}
                            player={player}
                            revealed={revealed}
                        />
                    ))}
                </Stack>
            </HorizontalScroller>
        </div>
    );
};
