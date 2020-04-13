import {jsx} from "@emotion/core";
import {FC} from "react";
import {Player} from "../../model/game/Player";
import {useDataHook} from "model-react";
import {Persona, PersonaSize} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {Title} from "../../components/Title";

export const Judge: FC<{judge: Player}> = ({judge}) => {
    const [h] = useDataHook();
    const name = judge.getName(h);

    const theme = useTheme();
    return (
        <div css={{width: "fit-content", padding: theme.spacing.s1}}>
            <Title size="big">Judge:</Title>
            <div
                css={{
                    display: "flex",
                    marginTop: theme.spacing.s1,
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <Persona
                    css={{minWidth: 100, width: 100}}
                    text={name}
                    onRenderPrimaryText={() => null} //Don't render name
                    initialsColor={theme.palette.accent}
                    size={PersonaSize.size100}
                />
                <Title
                    css={{
                        display: "inline-block",
                        maxWidth: 200,
                        maxHeight: 100,
                        overflow: "hidden",
                        textAlign: "center",
                    }}>
                    {name}
                </Title>
            </div>
        </div>
    );
};
