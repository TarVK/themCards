import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Application} from "../../../model/Application";
import {useDataHook} from "model-react";
import {Pack} from "./Pack";
import {useTheme} from "../../../services/useTheme";

export const PackSelection: FC<{filter?: string}> = ({filter = ""}) => {
    const [h, c] = useDataHook();

    // Retrieve all relevant data
    const room = Application.getRoom(h);
    const isAdmin = Application.isAdmin(h);
    const cardsSelection = room?.getCardSelection();

    // Retrieve the packs
    const allPacks = cardsSelection?.getAvailable() || [];
    const selectedPacks = cardsSelection?.getSelection(h) || [];

    return (
        <div>
            {allPacks
                .filter(pack =>
                    (pack.name + " " + pack.language).toLowerCase().includes(filter)
                )
                .map(pack => {
                    const selected =
                        selectedPacks.find(p => p.name == pack.name) != undefined;
                    return (
                        <Pack
                            key={pack.name}
                            pack={pack}
                            onToggle={() => {
                                if (cardsSelection && isAdmin) {
                                    if (selected)
                                        cardsSelection.setSelection(
                                            selectedPacks.filter(p => p.name != pack.name)
                                        );
                                    else
                                        cardsSelection.setSelection([
                                            ...selectedPacks,
                                            pack,
                                        ]);
                                }
                            }}
                            selected={selected}
                        />
                    );
                })}
        </div>
    );
};
