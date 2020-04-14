import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";
import {CenteredSpinner} from "./CenteredSpinner";
import {FormattedError} from "./FormattedError";
import {IDataHook, Loader} from "model-react";
import {SpinnerSize} from "@fluentui/react";

export const DefaultLoader: FC<{
    children: (hook: IDataHook) => ReactNode;
    onLoad?: ReactNode | (() => ReactNode);
    onError?: ReactNode | ((exceptions: any[]) => ReactNode);
}> = ({
    children,
    onLoad = <CenteredSpinner size={SpinnerSize.large} />,
    onError = e => <FormattedError>{e.join(", ")}</FormattedError>,
}) => (
    <Loader onLoad={onLoad} onError={onError}>
        {children}
    </Loader>
);
