import {jsx} from "@emotion/core";
import {FC} from "react";
import {VerticalCenter} from "./VerticalCenter";
import {HorizontalCenter} from "./HorizontalCenter";
import {Spinner} from "@fluentui/react";

export const CenteredSpinner: FC = () => (
    <VerticalCenter>
        <HorizontalCenter>
            <Spinner />
        </HorizontalCenter>
    </VerticalCenter>
);
