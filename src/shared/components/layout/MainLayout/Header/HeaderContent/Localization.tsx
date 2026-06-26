import { useRef, useState } from 'react';

// material-ui
import {
  Box,
  ClickAwayListener,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
import Transitions from 'shared/components/@extended/Transitions';
import MainCard from 'shared/components/MainCard';
import useConfig from 'shared/hooks/useConfig';

// types
import { I18n } from 'shared/types/config';

// icons
import flagUS from 'assets/images/icons/flag-us.png';
import flagVN from 'assets/images/icons/flag-vn.png';
import { FormattedMessage } from 'react-intl';
import { ArrowDown2 } from 'iconsax-react';

// ==============================|| HEADER CONTENT - LOCALIZATION ||============================== //

const Localization = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const { i18n, onChangeLocalization } = useConfig();

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListItemClick = (lang: I18n) => {
    onChangeLocalization(lang);
    setOpen(false);
  };

  const flagIcon = (lang: I18n) => (lang === 'en' ? flagUS : flagVN);

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          borderRadius: '50%',
          backdropFilter: 'blur(6px)',
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.8)',
          border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.divider : 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.4)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(50,50,50,0.9)',
            boxShadow: theme.palette.mode === 'light' ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.6)'
          }
        }}
        aria-label="open localization"
        ref={anchorRef}
        aria-controls={open ? 'localization-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className="cursor-pointer flex items-center p-2 h-11 w-11 md:w-auto rounded-full shadow-sm backdrop-blur-sm 
             hover:shadow-md transition-shadow duration-300 px-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <img src={flagIcon(i18n)} alt={i18n === 'en' ? 'English' : 'Vietnamese'} className="w-5 h-5" />
            <Typography
              sx={{
                color: theme.palette.text.primary
              }}
              className="font-semibold text-sm hidden md:block"
            >
              {i18n === 'en' ? 'ENG' : 'VIE'}
            </Typography>
          </div>
          {/* Icon dropdown có xoay */}
          <ArrowDown2
            size="16"
            style={{ color: theme.palette.text.primary }}
            className={`hidden md:block transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Box>

      <Popper
        placement={matchesXs ? 'bottom-start' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 0 : 0, 9] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top-right' : 'top'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, borderRadius: 1.5 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <List
                    component="nav"
                    sx={{
                      p: 1,
                      width: '100%',
                      minWidth: 200,
                      maxWidth: 290,
                      bgcolor: theme.palette.background.paper,
                      [theme.breakpoints.down('md')]: {
                        maxWidth: 250
                      }
                    }}
                  >
                    <ListItemButton selected={i18n === 'en'} onClick={() => handleListItemClick('en')}>
                      <ListItemIcon>
                        <img src={flagUS} alt="English" className="w-5 h-5" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Grid container alignItems="center">
                            <Typography color="textPrimary" fontWeight={500}>
                              <FormattedMessage id="english" />
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                              (US)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>

                    <ListItemButton selected={i18n === 'vi'} onClick={() => handleListItemClick('vi')}>
                      <ListItemIcon>
                        <img src={flagVN} alt="Vietnamese" className="w-5 h-5" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Grid container alignItems="center">
                            <Typography color="textPrimary" fontWeight={500}>
                              <FormattedMessage id="vietnamese" />
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                              (VN)
                            </Typography>
                          </Grid>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Localization;
