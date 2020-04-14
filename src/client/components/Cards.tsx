import {jsx} from "@emotion/core";
import {FC} from "react";
import {Surface} from "./Surface";
import {useTheme} from "../services/useTheme";
import {IconButton} from "@fluentui/react";
import {useIsMobileView} from "../services/useIsMobileView";

export const Card: FC<{
    revealed: boolean;
    halfRevealed?: boolean;
    children: string;
    onRemove?: () => void;
    onClick?: () => void;
}> = ({revealed, halfRevealed, children, onRemove, ...rest}) => {
    const theme = useTheme();
    const isMobile = useIsMobileView();
    const removeButton = (
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
    );
    return (
        <Surface
            elevation="elevation16"
            css={{
                width: 160,
                height: 220,
                boxSizing: "border-box",
                wordBreak: "break-word",
                padding: theme.spacing.s1,
                fontSize: 18,
                ...(halfRevealed && !revealed && {color: "rgba(60,60,60,0.5)"}),
                ...(isMobile && {width: "100%", height: "auto", minHeight: 38}),
            }}
            {...rest}>
            {onRemove &&
                (isMobile ? (
                    removeButton
                ) : (
                    <div>
                        {removeButton}
                        <br css={{clear: "both"}} />
                    </div>
                ))}
            <div
                css={{
                    display: "-webkit-box",
                    WebkitLineClamp: (isMobile ? 4 : 8) - (onRemove ? 1 : 0),
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
                {...((revealed || halfRevealed) && {title: children})}>
                {(revealed || halfRevealed) && children}
            </div>
        </Surface>
    );
};
