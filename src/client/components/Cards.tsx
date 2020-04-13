import {jsx} from "@emotion/core";
import {FC} from "react";
import {Surface} from "./Surface";
import {useTheme} from "../services/useTheme";
import {IconButton} from "@fluentui/react";

export const Card: FC<{
    revealed: boolean;
    children: string;
    onRemove?: () => void;
    onClick?: () => void;
}> = ({revealed, children, onRemove, ...rest}) => {
    const theme = useTheme();
    return (
        <Surface
            elevation="elevation16"
            css={{
                width: 160,
                height: 220,
                boxSizing: "border-box",
                padding: theme.spacing.s1,
                fontSize: 18,
            }}
            {...rest}>
            {onRemove && (
                <div>
                    <IconButton
                        iconProps={{iconName: "ChromeClose"}}
                        title="Remove"
                        ariaLabel="Remove"
                        onClick={onRemove}
                        styles={{
                            icon: {color: theme.palette.black},
                            root: {float: "right"},
                        }}
                    />
                    <br css={{clear: "both"}} />
                </div>
            )}
            <div
                css={{
                    display: "-webkit-box",
                    WebkitLineClamp: onRemove ? 7 : 8,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
                {...(revealed && {title: children})}>
                {revealed && children}
            </div>
        </Surface>
    );
};
