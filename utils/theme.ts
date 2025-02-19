import colors from '@mui/joy/colors';
import {
  extendTheme as extendJoyTheme,
  FontSize,
  Theme as JoyTheme,
  ThemeCssVar as JoyThemeCssVar,
  ThemeVars as JoyThemeVars,
} from '@mui/joy/styles';
import type { TypeBackground } from '@mui/material';
import {
  experimental_extendTheme as extendMuiTheme,
  Overlays,
  PaletteAlert,
  PaletteAppBar,
  PaletteAvatar,
  PaletteChip,
  PaletteColor,
  PaletteColorChannel,
  PaletteFilledInput,
  PaletteLinearProgress,
  PaletteSkeleton,
  PaletteSlider,
  PaletteSnackbarContent,
  PaletteSpeedDialAction,
  PaletteStepConnector,
  PaletteStepContent,
  PaletteSwitch,
  PaletteTableCell,
  PaletteTooltip,
  Shadows,
  TypeAction,
  TypeText,
  ZIndex,
} from '@mui/material/styles';
import { CommonColors } from '@mui/material/styles/createPalette';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { deepmerge } from '@mui/utils';
import * as React from 'react';

const purple = {
  50: '#FDF7FF',
  100: '#F4EAFF',
  200: '#E1CBFF',
  300: '#C69EFF',
  400: '#A374F9',
  500: '#814DDE',
  600: '#5F35AE',
  700: '#452382',
  800: '#301761',
  900: '#1D0A42',
};

// extends Joy theme to include tokens from Material UI
declare module '@mui/joy/styles' {
  interface Palette {
    secondary: PaletteColorChannel;
    error: PaletteColorChannel;
    dividerChannel: string;
    action: TypeAction;
    Alert: PaletteAlert;
    AppBar: PaletteAppBar;
    Avatar: PaletteAvatar;
    Chip: PaletteChip;
    FilledInput: PaletteFilledInput;
    LinearProgress: PaletteLinearProgress;
    Skeleton: PaletteSkeleton;
    Slider: PaletteSlider;
    SnackbarContent: PaletteSnackbarContent;
    SpeedDialAction: PaletteSpeedDialAction;
    StepConnector: PaletteStepConnector;
    StepContent: PaletteStepContent;
    Switch: PaletteSwitch;
    TableCell: PaletteTableCell;
    Tooltip: PaletteTooltip;
  }
  interface PalettePrimary extends PaletteColor {}
  interface PaletteInfo extends PaletteColor {}
  interface PaletteSuccess extends PaletteColor {}
  interface PaletteWarning extends PaletteColor {}
  interface PaletteCommon extends CommonColors {}
  interface PaletteText extends TypeText {}
  interface PaletteBackground extends TypeBackground {}

  interface ThemeVars {
    // attach to Joy UI `theme.vars`
    shadows: Shadows;
    overlays: Overlays;
    zIndex: ZIndex;
  }

  interface TypographySystemOverrides {
    kbd: true;
    display1: true;
  }

  interface FontSizeOverrides {
    xl7: true;
    xl6: true;
    xl5: true;
    xs2: true;
    xs3: true;
  }

  interface FontWeightOverrides {
    xs: true;
    xl2: true;
    xl3: true;
  }
}

type MergedThemeCssVar = { [k in JoyThemeCssVar]: true };

declare module '@mui/material/styles' {
  interface Theme {
    // put everything back to Material UI `theme.vars`
    vars: JoyTheme['vars'];
  }

  // makes Material UI theme.getCssVar() sees Joy theme tokens
  interface ThemeCssVarOverrides extends MergedThemeCssVar {}
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsSizeOverrides extends Record<keyof FontSize, true> {}

  interface SvgIconPropsColorOverrides {
    danger: true;
    neutral: true;
  }
}

// const primary = {
//   50: '#ede7f6',
//   100: '#d1c4e9',
//   200: '#b39ddb',
//   300: '#9575cd',
//   400: '#7e57c2',
//   500: '#673ab7',
//   600: '#5e35b1',
//   700: '#512da8',
//   800: '#4527a0',
//   900: '#311b92',
//   // 50: '#FAFFFE',
//   // 100: '#E6FFFA',
//   // 200: '#B3FEEF',
//   // 300: '#72FEE2',
//   // 400: '#04F5C6',
//   // 500: '#04DDB2',
//   // 600: '#03B491',
//   // 700: '#069377',
//   // 800: '#0B6B58',
//   // 900: '#084A3D',
// };

const muiTheme = extendMuiTheme({
  cssVarPrefix: 'joy',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          // main: colors.blue[500],
          // ...primary,
          ...purple,
        },
        // grey: colors.grey,
        // error: {
        //   main: colors.red[500],
        // },
        // success: {
        //   main: colors.green[500],
        // },
        // warning: {
        //   main: colors.yellow[200],
        // },
        // common: {
        //   white: '#FFF',
        //   // black: '#09090D',
        //   black: '#000000',
        // },
        // divider: colors.grey[200],
        // text: {
        //   primary: colors.grey[800],
        //   secondary: colors.grey[600],
        // },
      },
    },
    dark: {
      palette: {
        primary: {
          // main: colors.blue[600],
          // ...primary,
          ...purple,
        },
        // grey: colors.grey,
        // error: {
        //   main: colors.red[600],
        // },
        // success: {
        //   main: colors.green[600],
        // },
        // warning: {
        //   main: colors.yellow[300],
        // },
        // common: {
        //   white: '#FFF',
        //   // black: '#09090D',
        //   black: '#000',
        // },
        // divider: colors.grey[800],
        // text: {
        //   primary: colors.grey[100],
        //   secondary: colors.grey[300],
        // },
      },
    },
  },
});

const joyTheme = extendJoyTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          ...purple,
        },
      },
    },
    light: {
      palette: {
        primary: {
          ...purple,
        },
      },
    },
  },
  fontFamily: {
    body: 'Josefin Sans, sans-serif',
    display: 'Josefin Sans, sans-serif',
  },
  typography: {
    'display1': {
      // `--joy` is the default CSS variable prefix.
      // If you have a custom prefix, you have to use it instead.
      // For more details about the custom prefix, go to https://mui.com/joy-ui/customization/using-css-variables/#custom-prefix
      background:
        'linear-gradient(-30deg, var(--joy-palette-primary-900), var(--joy-palette-primary-400))',
      // `Webkit*` properties must come later.
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: "57px",
      lineHeight: "64px",
      letterSpacing: "-0.25px"
    },
    kbd: {
      background:
        'linear-gradient(to top, var(--joy-palette-background-level2), var(--joy-palette-background-surface))',
      border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
      borderRadius: 'var(--joy-radius-xs)',
      boxShadow: 'var(--joy-shadow-sm)',
      padding: '0.125em 0.375em',
    },
  },
  fontSize: {
    xl7: '4.5rem',
    xl6: '3.75rem',
    xl5: '3rem',
    xs2: '0.625rem',
    xs3: '0.5rem',
  },
  fontWeight: {
    xs: 200,
    xl2: 800,
    xl3: 900,
  },
});

const mergedTheme = {
  ...muiTheme,
  ...joyTheme,
  colorSchemes: deepmerge(muiTheme.colorSchemes, joyTheme.colorSchemes),
  typography: {
    ...muiTheme.typography,
    ...joyTheme.typography,
  },
} as unknown as ReturnType<typeof extendJoyTheme>;

mergedTheme.generateCssVars = (colorScheme) => ({
  css: {
    ...muiTheme.generateCssVars(colorScheme).css,
    ...joyTheme.generateCssVars(colorScheme).css,
  },
  vars: deepmerge(
    muiTheme.generateCssVars(colorScheme).vars,
    joyTheme.generateCssVars(colorScheme).vars
  ) as unknown as JoyThemeVars,
});
mergedTheme.unstable_sxConfig = {
  ...muiTheme.unstable_sxConfig,
  ...joyTheme.unstable_sxConfig,
};

export default mergedTheme;
