import {useState, useEffect} from "react";

/**
 * A state hook that updates as the initial value changes
 * @param remote The initial value that may be changed
 * @returns The getter and setter of the data
 */
export const useSyncState = <T>(remote: T) => {
    const [state, setState] = useState(remote);
    useEffect(() => {
        setState(remote);
    }, [remote]);

    return [state, setState] as const;
};
