import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {useDataHook} from "model-react";
import {useSyncState} from "../../services/useSyncState";
import {Application} from "../../model/Application";
import {PrimaryButton, DefaultButton} from "@fluentui/react";
import {TextField} from "../../components/TextField";

export const RoomName: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h);
    const [name, setName] = useSyncState(room?.getID());

    return (
        <div css={{display: "inline-block", width: 195}}>
            <TextField
                value={name}
                onChange={(e, v) => v !== undefined && setName(v)}
                label="Room"
                underlined
            />
            {name != room?.getID() && (
                <div
                    css={{
                        display: "flex",
                        width: "100%",
                        flexDirection: "row",
                        "> *": {flexGrow: 1},
                    }}>
                    <PrimaryButton onClick={() => Application.joinRoom(name)}>
                        GO!
                    </PrimaryButton>
                    <DefaultButton onClick={() => setName(room?.getID())}>
                        Cancel
                    </DefaultButton>
                </div>
            )}
        </div>
    );
};
