import {Field, IDataHook} from "model-react";
import {cloneElement} from "react";

export const NotificationManager = new (class NotificationManager {
    protected notifications = new Field([] as JSX.Element[]);

    /**
     * Adds a notification to be displayed
     * @param notification The notification to add
     * @returns A function that removes the notification
     */
    public addNotification(
        notification: JSX.Element | ((remove: () => void) => JSX.Element)
    ): () => void {
        if (notification instanceof Function) {
            const notificationEl = cloneElement(
                notification(() => this.removeNotification(notificationEl)),
                {key: Math.random()}
            );
            this.notifications.set([notificationEl, ...this.notifications.get(null)]);
            return () => this.removeNotification(notificationEl);
        } else {
            notification = cloneElement(notification, {key: Math.random()});
            this.notifications.set([notification, ...this.notifications.get(null)]);
            return () => this.removeNotification(notification as JSX.Element);
        }
    }

    /**
     * Removes a notification such that it is no longer displayed
     * @param notification The notification to remove
     */
    public removeNotification(notification: JSX.Element): void {
        const c = this.notifications.get(null);
        const index = c.indexOf(notification);
        if (index !== -1)
            this.notifications.set([...c.slice(0, index), ...c.slice(index + 1)]);
    }

    /**
     * Gets the notifications to be displayed
     * @param hook The hook to subscribe to changes
     * @returns The notifications to display
     */
    public getNotifications(hook: IDataHook): JSX.Element[] {
        return this.notifications.get(hook);
    }
})();
