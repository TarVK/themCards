import {jsx} from "@emotion/core";
import {FC} from "react";
import {useTheme} from "../services/useTheme";
import {Card} from "./Cards";

export const QuestionCard: FC<{revealed: boolean; children: string}> = ({
    revealed,
    children,
}) => {
    const theme = useTheme();
    return (
        <Card
            revealed={revealed}
            css={{
                backgroundColor: theme.palette.themePrimary,
            }}>
            {children.replace(/_/g, "____")}
        </Card>
    );
};
