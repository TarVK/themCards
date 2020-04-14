import {jsx} from "@emotion/core";
import {FC} from "react";
import {Player} from "../../model/game/Player";
import {IDataHook} from "model-react";
import {useSyncState} from "../../services/useSyncState";
import {TextField} from "../../components/TextField";

export const ChangeableName: FC<{hook: IDataHook; player: Player}> = ({
    hook: h,
    player,
}) => {
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
