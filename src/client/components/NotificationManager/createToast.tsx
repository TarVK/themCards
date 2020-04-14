import {jsx} from "@emotion/core";
import {MessageBarType, MessageBar} from "@fluentui/react";
import {FC} from "react";
import {Field, useDataHook} from "model-react";
import {useNotifier} from "./useNotifier";
import {createTimedNotification} from "./createTimedNotification";
import {NotificationManager} from "./NotificationManager";

/**
 * Creates a new toast
 * @param text The text of the toast
 * @param type The type of toast
 * @param duration The duration of the toast
 */
export const createToast = (
    text: string,
    type: MessageBarType = MessageBarType.info,
    duration: number = 5000
) => {
    const field = new Field(text);
    NotificationManager.addNotification(
        createTimedNotification(<Toast type={type} text={field} />)
    );

    // Return a text update function
    return (text: string) => field.set(text);
};

const Toast: FC<{type: MessageBarType; text: Field<string>}> = ({type, text}) => {
    const [h] = useDataHook();
    return (
        <MessageBar messageBarType={type} isMultiline={false}>
            {text.get(h)}
        </MessageBar>
    );
};
