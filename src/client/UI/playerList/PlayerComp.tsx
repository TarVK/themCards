import {jsx} from "@emotion/core";
import {FC} from "react";
import {Player} from "../../model/game/Player";
import {Persona, PersonaSize} from "@fluentui/react";
import {DefaultLoader} from "../../components/DefaultLoader";
import {Application} from "../../model/Application";
import {IDataHook, useDataHook} from "model-react";
import {useSyncState} from "../../services/useSyncState";
import {useTheme} from "../../services/useTheme";
import {TextField} from "../../components/TextField";

export const PlayerComp: FC<{player: Player}> = ({player}) => {
    const [h] = useDataHook();
    const room = Application.getRoom(h);
    const won = player.hasSelection(room?.getAnswer(h) || [], h);

    const theme = useTheme();
    return (
        <div css={{width: 200, padding: theme.spacing.s1}}>
            <DefaultLoader>
                {h => (
                    <Persona
                        css={{height: "auto"}}
                        text={player.getName(h)}
                        secondaryText={`Points: ${player.getScore(h)}`}
                        size={PersonaSize.size48}
                        initialsColor={
                            won ? theme.palette.greenLight : theme.palette.accent
                        }
                        onRenderPrimaryText={
                            player.is(Application.getPlayer(h))
                                ? () => <ChangeableName player={player} hook={h} />
                                : undefined
                        }
                    />
                )}
            </DefaultLoader>
        </div>
    );
};

const ChangeableName: FC<{hook: IDataHook; player: Player}> = ({hook: h, player}) => {
    const [name, setName] = useSyncState(player?.getName(h) ?? "");
    return (
        <TextField
            value={name}
            onChange={(e, v) => v !== undefined && setName(v)}
            onBlur={() => player.setName(name)}
            underlined
        />
    );
};
