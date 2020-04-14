import {jsx} from "@emotion/core";
import {FC, ReactNode, useEffect, useRef, useState} from "react";
import {ProgressIndicator} from "office-ui-fabric-react";

export const createTimedNotification = (
    notification: ReactNode,
    duration: number = 5000
) => {
    return (remove: () => void) => (
        <TimedNotification remove={remove} duration={duration}>
            {notification}
        </TimedNotification>
    );
};

const TimedNotification: FC<{
    children: ReactNode;
    remove: () => void;
    duration: number;
}> = ({children, remove, duration}) => {
    const mouseOver = useRef(false);

    // Creates a timer that calls remove when it runs out
    const [timeLeft, setTimeLeft] = useState(duration);
    useEffect(() => {
        const stepSize = 100;

        let remaining = duration;
        let finished = false;
        let finish = () => {
            clearInterval(intervalID);
            if (finished) return;
            remove();
            finished = true;
        };
        const intervalID = setInterval(() => {
            if (!mouseOver.current && !finished) {
                const t = (remaining -= stepSize);
                if (t < 0) finish();
                else setTimeLeft(t);
            }
        }, stepSize);

        return finish;
    }, []);

    return (
        <div
            onMouseEnter={() => (mouseOver.current = true)}
            onMouseLeave={() => (mouseOver.current = false)}>
            {children}
            <ProgressIndicator
                styles={{itemProgress: {padding: 0}}}
                percentComplete={1 - timeLeft / duration}
            />
        </div>
    );
};
