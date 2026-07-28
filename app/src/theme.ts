import { createTheme } from '@mui/material/styles';
import { zhCN, enUS } from '@mui/material/locale';
import type { ResolvedLang } from './types';

const BASE_THEME = {
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", ' +
      '"Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: { defaultProps: { size: 'small' as const } },
    MuiTextField: { defaultProps: { size: 'small' as const } },
  },
};

export function buildTheme(mode: 'light' | 'dark', lang: ResolvedLang) {
  const muiLocale = lang === 'zh' ? zhCN : enUS;
  return createTheme({ palette: { mode }, ...BASE_THEME }, muiLocale);
}
