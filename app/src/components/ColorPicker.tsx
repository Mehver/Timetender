import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { COLOR_PRESETS, normalizeHex } from '../utils/color';

interface Props {
  value: string;
  onChange: (color: string) => void;
}

/** Compact swatch picker with a native custom-color fallback. */
export default function ColorPicker({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
      {COLOR_PRESETS.map((c) => (
        <Box
          key={c}
          onClick={() => onChange(c)}
          sx={{
            width: 26,
            height: 26,
            borderRadius: '6px',
            bgcolor: c,
            cursor: 'pointer',
            boxSizing: 'border-box',
            border: '2px solid',
            borderColor: value === c ? 'text.primary' : 'transparent',
            '&:hover': { transform: 'scale(1.12)' },
            transition: 'transform 80ms',
          }}
        />
      ))}
      <Tooltip title="自定义颜色">
        <Box
          component="input"
          type="color"
          value={normalizeHex(value) ?? '#42a5f5'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: 34,
            height: 30,
            p: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '6px',
            bgcolor: 'transparent',
            cursor: 'pointer',
          }}
        />
      </Tooltip>
    </Stack>
  );
}
