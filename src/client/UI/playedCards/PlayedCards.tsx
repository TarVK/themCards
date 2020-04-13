import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {Player} from "../../model/game/Player";
import {shuffleArray} from "../../services/shuffleArray";
import {Stack, Spinner} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {PlayerSelection} from "./PlayerSelection";
import {HorizontalScroller} from "../../components/HorizontalScroller";

export const PlayedCards: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h);
    const players = room?.getPlayers(h);
    const judge = room?.getJudge(h);

    // Keep track of the players without the judge, in a random order
    const [playerSelections, setPlayerSelections] = useState([] as Player[]);
    useEffect(() => {
        const filtered = players?.filter(player => !player.is(judge)) || [];
        shuffleArray(filtered);
        setPlayerSelections(filtered);
    }, [players, judge]);

    const theme = useTheme();
    return (
        <div>
            <HorizontalScroller>
                <Stack
                    horizontal
                    disableShrink
                    tokens={{padding: "m", childrenGap: "m"}}
                    css={{width: "fit-content"}}>
                    {playerSelections.map(player => (
                        <PlayerSelection key={player.getID()} player={player} />
                    ))}
                </Stack>
            </HorizontalScroller>
        </div>
    );
};
