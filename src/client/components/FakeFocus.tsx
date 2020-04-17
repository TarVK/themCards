import {jsx} from "@emotion/core";
import {FC} from "react";
import {ActionButton} from "@fluentui/react";

export const FakeFocus: FC = () => (
    <ActionButton
        label="dummy"
        autoFocus
        css={{height: 0, overflow: "hidden", opacity: 0}}
    />
);
