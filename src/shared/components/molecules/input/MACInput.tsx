import { Box, TextField, Typography } from '@mui/material';
import { useRef } from 'react';

interface MACInputProps {
  value: string; // dạng 'AA-BB-CC-DD-EE-FF'
  onChange: (value: string) => void;
}

const MACInput = ({ value, onChange }: MACInputProps) => {
  const parts = value.split('-'); // ['AA', 'BB', ...]
  const mac = [...parts, '', '', '', '', '', ''].slice(0, 6); // đảm bảo có đủ 6 phần
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, partValue: string) => {
    if (!/^[0-9A-Fa-f]{0,2}$/.test(partValue)) return;

    const newParts = [...mac];
    newParts[index] = partValue.toUpperCase();
    const joined = newParts.filter((x) => x !== '').join('-');
    onChange(joined);

    if (partValue.length === 2 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && mac[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if ((e.key === ':' || e.key === '-') && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <Box display="flex" gap={1}>
      {mac.map((part, index) => (
        <Box key={index} display="flex" alignItems="center" gap={0.5}>
          <TextField
            value={part}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            inputRef={(el) => (inputRefs.current[index] = el)}
            inputProps={{
              maxLength: 2,
              inputMode: 'text',
              style: { textTransform: 'uppercase', textAlign: 'center' }
            }}
          />
          {index < 5 && <Typography variant="h6">:</Typography>}
        </Box>
      ))}
    </Box>
  );
};

export default MACInput;
