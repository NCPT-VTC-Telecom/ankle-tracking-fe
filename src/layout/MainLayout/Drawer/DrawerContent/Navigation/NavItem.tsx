import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { alpha, Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, useMediaQuery } from '@mui/material';

// project-imports
import Dot from 'components/@extended/Dot';
import useConfig from 'hooks/useConfig';
import { dispatch, useSelector } from 'store';
import { activeItem, openDrawer } from 'store/reducers/menu';
import IconWrapper from 'utils/icon-wrapper';

// types
import { MenuOrientation, ThemeMode } from 'types/config';
import { LinkTarget, NavItemType } from 'types/menu';

// ==============================|| NAVIGATION - ITEM ||============================== //

interface Props {
  item: NavItemType;
  level: number;
}

const NavItem = ({ item, level }: Props) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { drawerOpen, openItem } = useSelector((state) => state.menu);
  const { menuOrientation } = useConfig();

  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const isSelected = openItem.findIndex((id: string) => id === item.id) > -1;

  // Icon lớn hơn: 26 khi mở, 28 khi thu gọn
  const itemIcon = item.icon ? (
    <IconWrapper
      icon={item.icon}
      variant="Bulk"
      size={drawerOpen ? 26 : 28}
      color={isSelected ? theme.palette.primary.main : theme.palette.secondary.main}
    />
  ) : (
    false
  );

  const { pathname } = useLocation();

  // active menu item on page load
  useEffect(() => {
    if (pathname && pathname.includes('product-details')) {
      if (item.url && item.url.includes('product-details')) {
        dispatch(activeItem({ openItem: [item.id] }));
      }
    }

    if (pathname && pathname.includes('kanban')) {
      if (item.url && item.url.includes('kanban')) {
        dispatch(activeItem({ openItem: [item.id] }));
      }
    }

    if (pathname === item.url) {
      dispatch(activeItem({ openItem: [item.id] }));
    }
    // eslint-disable-next-line
  }, [pathname]);

  const textColor = theme.palette.mode === ThemeMode.DARK ? 'secondary.400' : 'secondary.main';
  const iconSelectedColor = 'primary.main';

  const itemContent = (
    <ListItemButton
      component={Link}
      to={item.url!}
      target={itemTarget}
      disabled={item.disabled}
      selected={isSelected}
      sx={{
        zIndex: 1201,
        pl: drawerOpen ? `${level * 20}px` : 1.5,
        py: !drawerOpen && level === 1 ? 1.5 : 1.1,
        borderRadius: '10px',
        mx: drawerOpen ? 1.25 : 0.75,
        my: 0.35,
        transition: 'all 0.25s ease',
        ...(drawerOpen && {
          '&:hover': {
            bgcolor: theme.palette.mode === ThemeMode.DARK
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.07)
          },
          '&.Mui-selected': {
            background: theme.palette.mode === ThemeMode.DARK
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)}, ${alpha(theme.palette.primary.dark, 0.1)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.primary.light, 0.06)})`,
            '&:hover': {
              background: theme.palette.mode === ThemeMode.DARK
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(theme.palette.primary.dark, 0.14)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.primary.light, 0.10)})`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '20%',
              height: '60%',
              width: 4,
              borderRadius: '0 4px 4px 0',
              bgcolor: 'primary.main'
            }
          }
        }),
        ...(!drawerOpen && {
          px: 2.75,
          justifyContent: 'center',
          '&:hover': {
            bgcolor: 'transparent'
          },
          '&.Mui-selected': {
            '&:hover': {
              bgcolor: 'transparent'
            },
            bgcolor: 'transparent'
          }
        })
      }}
      {...(downLG && {
        onClick: () => dispatch(openDrawer(false))
      })}
    >
      {itemIcon && (
        <ListItemIcon
          sx={{
            minWidth: drawerOpen ? 42 : 'auto',
            color: isSelected ? iconSelectedColor : textColor,
            transition: 'all 0.25s ease',
            ...(!drawerOpen &&
              level === 1 && {
                borderRadius: '12px',
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isSelected
                  ? theme.palette.mode === ThemeMode.DARK
                    ? alpha(theme.palette.primary.main, 0.22)
                    : alpha(theme.palette.primary.main, 0.12)
                  : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : alpha(theme.palette.primary.main, 0.08)
                }
              })
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}

      {!itemIcon && drawerOpen && (
        <ListItemIcon
          sx={{
            minWidth: 30
          }}
        >
          <Dot size={isSelected ? 7 : 5} color={isSelected ? 'primary' : 'secondary'} />
        </ListItemIcon>
      )}

      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText
          primary={
            <Typography
              variant="h5"
              sx={{
                color: isSelected ? iconSelectedColor : textColor,
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.875rem',
                lineHeight: 1.4,
                transition: 'color 0.2s ease'
              }}
            >
              {item.title}
            </Typography>
          }
        />
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
          sx={{ fontSize: '0.7rem', height: 20 }}
        />
      )}
    </ListItemButton>
  );

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <>
          {/* Tooltip khi sidebar thu gọn */}
          {!drawerOpen && level === 1 ? (
            <Tooltip title={item.title} placement="right" arrow>
              {itemContent}
            </Tooltip>
          ) : (
            itemContent
          )}
        </>
      ) : (
        <ListItemButton
          component={Link}
          to={item.url!}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          sx={{
            zIndex: 1201,
            borderRadius: '8px',
            mx: 0.5,
            ...(drawerOpen && {
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                bgcolor: 'transparent',
                color: iconSelectedColor,
                '&:hover': {
                  color: iconSelectedColor,
                  bgcolor: 'transparent'
                }
              }
            }),
            ...(!drawerOpen && {
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                '&:hover': {
                  bgcolor: 'transparent'
                },
                bgcolor: 'transparent'
              }
            })
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 36,
                ...(!drawerOpen && {
                  borderRadius: 1,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: 'transparent'
                  }
                }),
                ...(!drawerOpen &&
                  isSelected && {
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  })
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}

          <ListItemText
            primary={
              <Typography
                variant="h5"
                sx={{ color: isSelected ? iconSelectedColor : textColor, fontWeight: isSelected ? 600 : 400, fontSize: '0.875rem' }}
              >
                {item.title}
              </Typography>
            }
          />
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
};

export default NavItem;
