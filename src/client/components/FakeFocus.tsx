import {jsx} from "@emotion/core";
import {FC} from "react";
import {Button} from "@fluentui/react";

export const FakeFocus: FC = () => (
    <Button label="dummy" autoFocus css={{height: 0, overflow: "hidden", opacity: 0}} />
);
