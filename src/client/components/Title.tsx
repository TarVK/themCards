import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";

export const Title: FC<{children: ReactNode; size?: "big" | "normal"}> = ({
    size = "normal",
    ...props
}) => <div css={{fontSize: size == "big" ? 28 : 22}} {...props} />;
