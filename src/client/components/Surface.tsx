import {jsx} from "@emotion/core";
import {ReactNode, FC} from "react";
import {ITheme} from "@fluentui/react";

export const Surface: FC<{
    children: ReactNode;
    onClick?: () => void;
    elevation?: keyof ITheme["effects"];
}> = ({elevation = "elevation64", ...props}) => (
    <div
        css={(theme: ITheme) =>
            ({
                boxShadow: theme.effects[elevation],
            } as any)
        }
        {...props}
    />
);
