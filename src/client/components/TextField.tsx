import {jsx} from "@emotion/core";
import {FC} from "react";
import {TextField as FluentUITextField, ITextFieldProps} from "@fluentui/react";

export const TextField: React.FunctionComponent<ITextFieldProps> = ({...props}) => (
    <FluentUITextField
        {...props}
        styles={{fieldGroup: {background: "rgba(255, 255, 255, 0.5)"}}}
    />
);
