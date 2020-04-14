import {jsx} from "@emotion/core";
import {FC} from "react";
import {VerticalCenter} from "./VerticalCenter";
import {HorizontalCenter} from "./HorizontalCenter";
import {Spinner, SpinnerSize} from "@fluentui/react";

export const CenteredSpinner: FC<{size?: SpinnerSize}> = ({
    size = SpinnerSize.medium,
}) => (
    <VerticalCenter>
        <HorizontalCenter>
            <Spinner size={size} />
        </HorizontalCenter>
    </VerticalCenter>
);
