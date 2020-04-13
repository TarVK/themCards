import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";

export const HorizontalCenter: FC<{children: ReactNode}> = props => (
    <div
        css={{position: "relative", left: "50%", transform: "translate(-50%, 0)"} as any}
        {...props}></div>
);
