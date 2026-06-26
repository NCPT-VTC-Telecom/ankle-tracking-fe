import { forwardRef, CSSProperties, ReactNode } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Divider, Typography, CardProps, CardHeaderProps, CardContentProps } from '@mui/material';
import useConfig from 'shared/hooks/useConfig';
import { KeyedObject } from 'shared/types/root';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

export interface MainCardProps extends KeyedObject {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactNode | string;
  subheader?: ReactNode | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  elevation?: number;
  title?: ReactNode | string;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
}

const MainCard = forwardRef<HTMLDivElement, MainCardProps>(
  (
    {
      border = true,
      boxShadow = true,
      children,
      subheader,
      content = true,
      contentSX = {},
      darkTitle,
      divider = true,
      elevation,
      secondary,
      shadow,
      sx = {},
      title,
      codeHighlight = false,
      codeString,
      modal = false,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();
    const { themeContrast } = useConfig();

    return (
      <Card
        elevation={elevation || 0}
        ref={ref}
        {...others}
        sx={{
          position: 'relative',
          border: border
            ? `1px solid ${alpha(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.divider, 0.4)}`
            : 'none',
          borderRadius: 1.5,
          ...(((themeContrast && boxShadow) || shadow) && {
            boxShadow: shadow ? shadow : theme.customShadows.z1
          }),
          ...(codeHighlight && {
            '& pre': {
              m: 0,
              p: '12px !important',
              fontFamily: theme.typography.fontFamily,
              fontSize: '0.75rem'
            }
          }),
          ...(modal && {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: `calc( 100% - 50px)`, sm: 'auto' },
            '& .MuiCardContent-root': {
              overflowY: 'auto',
              minHeight: 'auto',
              maxHeight: `calc(100vh - 200px)`
            }
          }),
          ...sx
        }}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader
            sx={headerSX}
            titleTypographyProps={{ variant: 'subtitle1' }}
            title={title}
            action={secondary}
            subheader={subheader}
          />
        )}
        {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h4">{title}</Typography>} action={secondary} />}

        {/* content & header divider */}
        {title && divider && <Divider />}

        {/* card content */}
        {content && <CardContent sx={{ p: { xs: 2, md: 3 }, ...contentSX }}>{children}</CardContent>}
        {!content && children}
      </Card>
    );
  }
);

export default MainCard;
