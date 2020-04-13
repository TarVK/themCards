import {jsx} from "@emotion/core";
import {FC} from "react";
import {Surface} from "./Surface";
import {useTheme} from "../services/useTheme";
import {Card} from "./Cards";

export const AnswerCard: FC<{
    revealed: boolean;
    children: string;
    onClick?: () => void;
    onRemove?: () => void;
}> = ({revealed, children, ...rest}) => {
    const theme = useTheme();
    return (
        <Card
            revealed={revealed}
            css={{
                backgroundColor: theme.palette.themeSecondary,
            }}
            {...rest}>
            {children}
        </Card>
    );
};
