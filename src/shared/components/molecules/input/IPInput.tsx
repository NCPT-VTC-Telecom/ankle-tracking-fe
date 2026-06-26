import { Box, TextField, Typography } from '@mui/material';
import { useRef } from 'react';

interface IPInputProps {
  value: string; // dạng '192.168.1.1'
  onChange: (value: string) => void;
}

const IPInput = ({ value, onChange }: IPInputProps) => {
  const parts = value.split('.'); // ['192', '168', '1', '1']
  const ip = [...parts, '', '', '', ''].slice(0, 4); // đảm bảo có đủ 4 phần
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, partValue: string) => {
    if (!/^\d{0,3}$/.test(partValue)) return;

    const newParts = [...ip];
    newParts[index] = partValue;
    const joined = newParts.filter((x) => x !== '').join('.');
    onChange(joined);

    if (partValue.length === 3 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && ip[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === '.' && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <Box display="flex" gap={1}>
      {ip.map((part, index) => (
        <Box key={index} display="flex" alignItems="center" gap={0.5}>
          <TextField
            value={part}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            inputRef={(el) => (inputRefs.current[index] = el)}
            inputProps={{
              maxLength: 3,
              inputMode: 'numeric'
            }}
          />
          {index < 3 && <Typography variant="h6">.</Typography>}
        </Box>
      ))}
    </Box>
  );
};

export default IPInput;
