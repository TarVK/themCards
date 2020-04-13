import {jsx} from "@emotion/core";
import {FC, useEffect, useState} from "react";
import {Application} from "../../../model/Application";
import {useDataHook} from "model-react";
import {DefaultLoaderSwitch} from "../../../components/DefaultLoaderSwitch";
import {Pack} from "./Pack";
import {Modal} from "@fluentui/react";

export const PackSelection: FC = () => {
    const [h, c] = useDataHook();

    // Retrieve all relevant data
    const room = Application.getRoom(h);
    const admin = room?.getAdmin(h);
    const player = Application.getPlayer(h);
    const cardsSelection = room?.getCardSelection();

    // Retrieve the packs
    const allPacks = cardsSelection?.getAvailable() || [];
    const selectedPacks = cardsSelection?.getSelection(h) || [];

    // Open the packs if no selection was made yet
    const [isOpen, setOpen] = useState(true);
    useEffect(() => {
        if (room && selectedPacks.length == 0) setOpen(true);
    }, [room, selectedPacks.length == 0]);

    return (
        <Modal isOpen={isOpen} onDismiss={() => setOpen(false)}>
            <DefaultLoaderSwitch {...c}>
                {allPacks.map(pack => {
                    const selected =
                        selectedPacks.find(p => p.name == pack.name) != undefined;
                    return (
                        <Pack
                            key={pack.name}
                            pack={pack}
                            onToggle={() => {
                                if (cardsSelection && player && player.is(admin)) {
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
            </DefaultLoaderSwitch>
        </Modal>
    );
};
