import {jsx} from "@emotion/core";
import {FC, ReactNode, useRef, useEffect} from "react";

const speed = 0.1;
export const HorizontalScroller: FC<{children: ReactNode}> = ({...rest}) => {
    const elRef = useRef(null as HTMLDivElement | null);
    const target = useRef(0);
    const animating = useRef(false);
    const updateTarget = (change: number) => {
        target.current = Math.max(0, target.current + change * 2);
        if (elRef.current) {
            const el = elRef.current;
            target.current = Math.min(target.current, el.scrollWidth - el.clientWidth);
        } else {
            target.current = 0;
        }

        const move = () => {
            const el = elRef.current;
            if (el) {
                const delta = target.current - el.scrollLeft;
                if (Math.abs(delta) > 1) {
                    el.scrollLeft +=
                        delta > 0 ? Math.ceil(delta * speed) : Math.floor(delta * speed);

                    requestAnimationFrame(move);
                } else {
                    el.scrollLeft = target.current;
                    animating.current = false;
                }
            } else {
                animating.current = false;
            }
        };

        if (!animating.current) {
            animating.current = true;
            requestAnimationFrame(move);
        }
    };

    useEffect(() => {
        // Had to manually mount event handler, otherwise prevent default doesn't work
        if (elRef.current)
            elRef.current.addEventListener("wheel", e => {
                e.preventDefault();
                updateTarget(e.deltaY || e.deltaX);
            });
    }, []);

    return (
        <div
            css={{
                maxWidth: "100%",
                overflow: "auto",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                    display: "none",
                },
            }}
            ref={el => {
                if (el) elRef.current = el;
            }}
            {...rest}
        />
    );
};
