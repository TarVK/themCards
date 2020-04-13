import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";

export const VerticalCenter: FC<{children: ReactNode}> = props => (
    <div
        css={{position: "relative", top: "50%", transform: "translate(0,-50%)"} as any}
        {...props}></div>
);
