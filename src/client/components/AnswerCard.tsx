import {jsx} from "@emotion/core";
import {FC} from "react";
import {useTheme} from "../services/useTheme";
import {Card} from "./Cards";

export const AnswerCard: FC<{
    revealed: boolean;
    halfRevealed?: boolean;
    children: string;
    title?: string;
    onClick?: () => void;
    onRemove?: () => void;
}> = ({revealed, halfRevealed = false, children, ...rest}) => {
    const theme = useTheme();
    return (
        <Card
            revealed={revealed}
            halfRevealed={halfRevealed}
            css={{
                backgroundColor: theme.palette.themeSecondary,
            }}
            {...rest}>
            {children}
        </Card>
    );
};
