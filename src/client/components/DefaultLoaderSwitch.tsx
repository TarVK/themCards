import {jsx} from "@emotion/core";
import {FC, ReactNode} from "react";
import {CenteredSpinner} from "./CenteredSpinner";
import {FormattedError} from "./FormattedError";
import {LoaderSwitch} from "model-react";

export const DefaultLoaderSwitch: FC<{
    children: ReactNode;
    onLoad?: ReactNode | (() => ReactNode);
    onError?: ReactNode | ((exceptions: any[]) => ReactNode);
    isLoading?: () => boolean;
    getExceptions?: () => any[];
}> = ({
    onLoad = <CenteredSpinner />,
    onError = e => (
        <FormattedError>
            {e.map(e => e.errorMessage || e.toString()).join(", ")}
        </FormattedError>
    ),
    ...rest
}) => <LoaderSwitch onLoad={onLoad} onError={onError} {...rest} />;
