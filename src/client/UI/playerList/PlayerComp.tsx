import {jsx} from "@emotion/core";
import {FC, useState, useRef} from "react";
import {Player} from "../../model/game/Player";
import {Persona, PersonaSize, ContextualMenu} from "@fluentui/react";
import {DefaultLoader} from "../../components/DefaultLoader";
import {Application} from "../../model/Application";
import {IDataHook, useDataHook} from "model-react";
import {useTheme} from "../../services/useTheme";
import {ChangeableName} from "./ChangeableName";

export const PlayerComp: FC<{player: Player; plain?: boolean}> = ({player, plain}) => {
    const [h] = useDataHook();
    const [showContext, setShowContext] = useState(false);
    const isAdmin = Application.isAdmin(h);
    const me = Application.getPlayer(h);
    const room = Application.getRoom(h);
    const won = player.hasSelection(room?.getAnswer(h) || [], h);
    const elRef = useRef(null);

    const isMe = player.is(me);
    const theme = useTheme();
    return (
        <div css={{width: 200, padding: theme.spacing.s1}}>
            <DefaultLoader>
                {h => (
                    <div ref={elRef}>
                        <Persona
                            onClick={() => !isMe && !plain && setShowContext(true)}
                            css={{height: "auto"}}
                            text={player.getName(h)}
                            secondaryText={`Points: ${player.getScore(h)}`}
                            size={PersonaSize.size48}
                            initialsColor={
                                won ? theme.palette.greenLight : theme.palette.accent
                            }
                            onRenderPrimaryText={
                                isMe && !plain
                                    ? () => <ChangeableName player={player} hook={h} />
                                    : undefined
                            }
                        />
                    </div>
                )}
            </DefaultLoader>

            <ContextualMenu
                items={[
                    {
                        key: "kick",
                        text: "Kick",
                        disabled: !isAdmin,
                        onClick: () => {
                            if (player && room) room.kick(player);
                        },
                    },
                ]}
                hidden={!showContext}
                target={elRef}
                onDismiss={() => setShowContext(false)}
            />
        </div>
    );
};
