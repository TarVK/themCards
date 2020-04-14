import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";

export const Title: FC<{children: ReactNode; size?: "big" | "normal" | "small"}> = ({
    size = "normal",
    ...props
}) => <div css={{fontSize: {big: 28, normal: 22, small: 18}[size]}} {...props} />;
