import {useEffect, useState} from "react";

export const useIsMobileView = (): boolean => {
    const [, update] = useState();
    useEffect(() => {
        const listener = () => update({});
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    });

    return window.innerWidth < 700 || window.innerHeight < 600; //TODO: boundaries to be decided
};
