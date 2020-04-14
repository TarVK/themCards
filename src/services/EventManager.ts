export class EventManager {
    protected listeners: {
        [type: string]: {label?: string; listener: (...args: any) => void}[];
    } = {};

    /**
     * Adds a listener to the manager
     * @param eventType The type of event to listen to
     * @param listener The listener to be added
     * @param label The label to add it under, for easier future removal
     */
    public on(
        eventType: string,
        listener: (...args: any[]) => void,
        label?: string
    ): void {
        if (!this.listeners[eventType]) this.listeners[eventType] = [];
        if (this.listeners[eventType].find(l => l.listener == listener)) return;
        this.listeners[eventType].push({label, listener});
    }

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    public off(eventType: string, label: string): boolean;

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    public off(eventType: string, listener: (...args: any[]) => void): boolean;
    public off(
        eventType: string,
        listener: ((...args: any[]) => void) | string
    ): boolean {
        if (!this.listeners[eventType]) return false;

        const listeners = this.listeners[eventType];
        const index = listeners.findIndex(
            l => l.listener == listener || l.label == listener
        );
        if (index != -1) {
            listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Emits an event
     * @param eventType The type of event to emit
     * @param args The arguments to pass to the listener
     */
    public emit(eventType: string, ...args: any[]): void {
        if (!this.listeners[eventType]) return;

        this.listeners[eventType].forEach(({listener}) => listener(...args));
    }
}
