import {useTheme as emotionUseTheme} from "emotion-theming";
import {ITheme} from "@fluentui/react";

export const useTheme = emotionUseTheme as () => ITheme;
