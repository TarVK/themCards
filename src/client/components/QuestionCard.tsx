import {jsx} from "@emotion/core";
import {FC} from "react";
import {useTheme} from "../services/useTheme";
import {Card} from "./Cards";

export const QuestionCard: FC<{
    revealed?: boolean;
    halfRevealed?: boolean;
    children: string;
}> = ({revealed = true, halfRevealed = false, children}) => {
    const theme = useTheme();
    return (
        <Card
            revealed={revealed}
            halfRevealed={halfRevealed}
            css={{
                backgroundColor: theme.palette.themePrimary,
            }}>
            {children.replace(/_/g, "____")}
        </Card>
    );
};
