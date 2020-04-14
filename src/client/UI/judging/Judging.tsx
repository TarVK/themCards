import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {QuestionCard} from "../../components/QuestionCard";
import {useTheme} from "../../services/useTheme";
import {Judge} from "./Judge";
import {ContinueGame} from "./ContinueGame";
import {useIsMobileView} from "../../services/useIsMobileView";

export const Judging: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h);
    const question = room?.getQuestion(h);
    const judge = room?.getJudge(h);

    const theme = useTheme();
    if (useIsMobileView())
        return (
            <div>
                {judge && <Judge judge={judge} />}
                {question && <QuestionCard revealed>{question}</QuestionCard>}
            </div>
        );

    return (
        <div
            css={{
                display: "flex",
                justifyContent: "space-between",
                padding: theme.spacing.s1,
            }}>
            <div css={{width: 300}}>{judge && <Judge judge={judge} />}</div>
            {question && <QuestionCard revealed>{question}</QuestionCard>}
            <div css={{width: 300}}>
                <ContinueGame />
            </div>
        </div>
    );
};
