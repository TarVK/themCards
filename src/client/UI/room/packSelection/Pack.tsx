import {jsx} from "@emotion/core";
import {FC} from "react";
import {ITheme, DocumentCardTitle, DocumentCard} from "@fluentui/react";
import {ICardPackData} from "../../../../_types/game/ICardPackData";
import {Surface} from "../../../components/Surface";

export const Pack: FC<{pack: ICardPackData; onToggle: () => void; selected: boolean}> = ({
    pack,
    onToggle,
    selected,
}) => (
    <Surface
        onClick={onToggle}
        css={(theme: ITheme) => ({padding: theme.spacing.s1, width: 300, height: 150})}>
        {selected && "Selected"}
        <DocumentCardTitle title={pack.name} shouldTruncate />
        <DocumentCardTitle title={pack.description} shouldTruncate showAsSecondaryTitle />
    </Surface>
);
