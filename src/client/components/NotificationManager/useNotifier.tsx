import {useEffect, useRef} from "react";
import {NotificationManager} from "./NotificationManager";

/**
 * Retrieves an array with a function to add notifications,
 * and a function to clear all added notifications
 */
export const useNotifier = (): [(notifiction: JSX.Element) => () => void, () => void] => {
    // Keeps track of all functions to remove notifications
    const notificationRemovers = useRef([] as (() => void)[]);

    // Clears all notifications
    const clear = () => {
        notificationRemovers.current.forEach(remove => remove());
        notificationRemovers.current = [];
    };

    // Adds a notification
    const add = (notification: JSX.Element) => {
        const remove = NotificationManager.addNotification(notification);
        notificationRemovers.current.push(remove);
        return remove;
    };

    // Clears all notifications when this component is unmounted
    useEffect(() => clear, []);

    return [add, clear];
};
