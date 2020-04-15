import {jsx} from "@emotion/core";
import {FC} from "react";
import {ITheme} from "@fluentui/react";
import {ICardPackData} from "../../../../_types/game/ICardPackData";
import {Surface} from "../../../components/Surface";
import {Title} from "../../../components/Title";

export const Pack: FC<{pack: ICardPackData; onToggle: () => void; selected: boolean}> = ({
    pack,
    onToggle,
    selected,
}) => (
    <Surface
        onClick={onToggle}
        elevation="elevation8"
        css={(theme: ITheme) => ({
            verticalAlign: "top",
            padding: theme.spacing.m,
            minHeight: 120,
            margin: theme.spacing.s1,
            display: "inline-block",
            boxSizing: "border-box",
            backgroundColor: selected
                ? theme.palette.themePrimary
                : theme.palette.themeLighter,
            width: `calc(${Math.floor(
                100 / Math.floor(Math.min(window.innerWidth, 800) / 250)
            )}% - 2 * ${theme.spacing.s1})`,
        })}>
        <Title>{pack.name}</Title>
        <Title size="small" css={(theme: ITheme) => ({marginBottom: theme.spacing.s1})}>
            {pack.language}
        </Title>
        {pack.description}
    </Surface>
);
