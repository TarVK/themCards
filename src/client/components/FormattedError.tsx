import {jsx} from "@emotion/core";
import {ReactNode, FC} from "react";
import {ITheme} from "@fluentui/react";

export const FormattedError: FC<{children: ReactNode}> = ({children, ...rest}) => (
    <div
        css={(theme: ITheme) => ({
            padding: theme.spacing.s1,
            color: theme.semanticColors.errorText,
            backgroundColor: theme.semanticColors.errorBackground,
        })}
        {...rest}>
        {children}
    </div>
);
