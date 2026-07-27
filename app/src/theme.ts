import { createTheme } from '@mui/material/styles';
import { zhCN } from '@mui/material/locale';

export function buildTheme(mode: 'light' | 'dark') {
  return createTheme(
    {
      palette: { mode },
      typography: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", ' +
          '"Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
      },
      components: {
        MuiButton: { defaultProps: { size: 'small' } },
        MuiTextField: { defaultProps: { size: 'small' } },
      },
    },
    zhCN,
  );
}
