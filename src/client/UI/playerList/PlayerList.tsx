import {jsx} from "@emotion/core";
import {FC} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {PlayerComp} from "./PlayerComp";
import {DefaultLoaderSwitch} from "../../components/DefaultLoaderSwitch";
import {FakeFocus} from "../../components/FakeFocus";

export const PlayerList: FC = () => {
    const [h] = useDataHook();
    const room = Application.getRoom(h);
    const players = room?.getPlayers(h) || [];

    return (
        <div>
            {players.map(p => (
                <PlayerComp key={p.getID()} player={p} />
            ))}

            {/* We don't want an actual field to auto focus, so this is a dirty fix */}
            <FakeFocus />
        </div>
    );
};
