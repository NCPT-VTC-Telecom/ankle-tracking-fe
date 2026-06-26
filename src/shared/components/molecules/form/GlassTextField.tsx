import React from 'react';
import { TextField, InputAdornment, IconButton, Typography, Box } from '@mui/material';
import { Eye, EyeSlash } from 'iconsax-react';

interface GlassTextFieldProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string | boolean;
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
}

export const GlassTextField: React.FC<GlassTextFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  showPassword,
  setShowPassword
}) => {
  const isPassword = type === 'password';

  const handleTogglePassword = () => {
    if (setShowPassword) setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 0.75,
            ml: 0.5,
            fontWeight: 500,
            fontSize: 14,
            color: '#fff'
          }}
        >
          {label}
        </Typography>
      )}

      <TextField
        fullWidth
        autoComplete={isPassword ? 'new-password' : 'new-username'}
        variant="filled"
        placeholder={placeholder}
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        type={isPassword && !showPassword ? 'password' : 'text'}
        error={error}
        helperText={helperText}
        InputProps={{
          disableUnderline: true,
          endAdornment: isPassword ? (
            <InputAdornment position="end" sx={{ pr: 0.5 }}>
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
          sx: {
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            px: 2.5,
            py: 0.5,
            height: 48,
            border: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)'
            },
            '&.Mui-focused': {
              bgcolor: 'rgba(255,255,255,0.15)'
            },
            '& .MuiFilledInput-input': {
              padding: 0,
              lineHeight: '48px',
              fontSize: 14,
              color: '#ffffff',
              fontWeight: 400,
              '&::placeholder': {
                color: '#fff',
                opacity: 1
              }
            },
            '&:-webkit-autofill': {
              WebkitTextFillColor: '#fff !important',
              boxShadow: '0 0 0 1000px rgba(255,255,255,0.05) inset !important',
              transition: 'background-color 5000s ease-in-out 0s !important',
              caretColor: '#fff'
            }
          }
        }}
        FormHelperTextProps={{
          sx: {
            ml: 0.5,
            color: '#ff6b6b',
            fontSize: 12,
            fontWeight: 500
          }
        }}
      />
    </Box>
  );
};
