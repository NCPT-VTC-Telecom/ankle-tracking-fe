import { useEffect, useState, useMemo, Dispatch, MouseEvent, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Collapse,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// project-imports
import NavItem from './NavItem';
import Dot from 'shared/components/@extended/Dot';
import SimpleBar from 'shared/components/third-party/SimpleBar';
import Transitions from 'shared/components/@extended/Transitions';

import useConfig from 'shared/hooks/useConfig';
import { dispatch, useSelector } from 'shared/store';
import { activeItem } from 'shared/store/reducers/menu';
import IconWrapper from 'shared/utils/icon-wrapper';

// assets
import { ArrowDown2, ArrowUp2, ArrowRight2, Copy } from 'iconsax-react';

// types
import { MenuOrientation, ThemeMode } from 'shared/types/config';
import { NavItemType } from 'shared/types/menu';

type VirtualElement = {
  getBoundingClientRect: () => ClientRect | DOMRect;
  contextElement?: Element;
};

// mini-menu - wrapper
const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 200,
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 38,
    left: -5,
    width: 10,
    height: 10,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 120,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

// ==============================|| NAVIGATION - COLLAPSE ||============================== //

interface Props {
  menu: NavItemType;
  level: number;
  parentId: string;
  setSelectedItems: Dispatch<SetStateAction<string | undefined>>;
  selectedItems: string | undefined;
  setSelectedLevel: Dispatch<SetStateAction<number>>;
  selectedLevel: number;
}

const NavCollapse = ({ menu, level, parentId, setSelectedItems, selectedItems, setSelectedLevel, selectedLevel }: Props) => {
  const theme = useTheme();
  const navigation = useNavigate();

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { drawerOpen } = useSelector((state) => state.menu);
  const { menuOrientation } = useConfig();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null | undefined>(null);
  const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);

  const handleClick = (event: MouseEvent<HTMLElement> | undefined) => {
    setAnchorEl(null);
    setSelectedLevel(level);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
      setSelectedItems(!selected ? menu.id : '');
      if (menu.url) navigation(`${menu.url}`);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handlerIconLink = () => {
    if (!drawerOpen) {
      if (menu.url) navigation(`${menu.url}`);
      setSelected(menu.id);
    }
  };

  const handleHover = (event: MouseEvent<HTMLElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
    if (!drawerOpen) {
      setSelected(menu.id);
    }
  };

  const miniMenuOpened = Boolean(anchorEl);

  const handleClose = () => {
    setOpen(false);
    if (!miniMenuOpened && !menu.url) {
      setSelected(null);
    }
    setAnchorEl(null);
  };

  useMemo(() => {
    if (selected === selectedItems) {
      if (level === 1) {
        setOpen(true);
      }
    } else {
      if (level === selectedLevel) {
        setOpen(false);
        if ((!miniMenuOpened && !drawerOpen && !selected) || drawerOpen) {
          setSelected(null);
        }
      }
    }
  }, [selectedItems, level, selected, miniMenuOpened, drawerOpen, selectedLevel]);

  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === menu.url) {
      setSelected(menu.id);
    }
    // eslint-disable-next-line
  }, [pathname]);

  const checkOpenForParent = (child: NavItemType[], id: string) => {
    child.forEach((item: NavItemType) => {
      if (item.url === pathname) {
        setOpen(true);
        setSelected(id);
      }
    });
  };

  // menu collapse for sub-levels
  useEffect(() => {
    setOpen(false);
    if (!miniMenuOpened) {
      setSelected(null);
    }
    if (miniMenuOpened) setAnchorEl(null);
    if (menu.children) {
      menu.children.forEach((item: NavItemType) => {
        if (item.children?.length) {
          checkOpenForParent(item.children, menu.id!);
        }
        if (pathname && pathname.includes('product-details')) {
          if (item.url && item.url.includes('product-details')) {
            setSelected(menu.id);
            setOpen(true);
          }
        }
        if (item.url === pathname) {
          setSelected(menu.id);
          setOpen(true);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children]);

  useEffect(() => {
    if (menu.url === pathname) {
      dispatch(activeItem({ openItem: [menu.id] }));
      setSelected(menu.id);
      setAnchorEl(null);
      setOpen(true);
    }
  }, [pathname, menu]);

  const navCollapse = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            menu={item}
            level={level + 1}
            parentId={parentId}
          />
        );
      case 'item':
        return <NavItem key={item.id} item={item} level={level + 1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Collapse or Item
          </Typography>
        );
    }
  });

  const isSelected = selected === menu.id;
  const borderIcon = level === 1 ? <Copy variant="Bulk" size={drawerOpen ? 26 : 28} /> : false;
  const menuIcon = menu.icon ? (
    <IconWrapper
      icon={menu.icon}
      variant="Bulk"
      size={drawerOpen ? 26 : 28}
      color={isSelected ? theme.palette.primary.main : theme.palette.secondary.main}
    />
  ) : (
    borderIcon
  );
  const textColor = theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[400] : theme.palette.secondary.main;
  const iconSelectedColor = theme.palette.mode === ThemeMode.DARK && drawerOpen ? theme.palette.text.primary : theme.palette.primary.main;
  const popperId = miniMenuOpened ? `collapse-pop-${menu.id}` : undefined;
  const FlexBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' };

  const collapseButton = (
    <ListItemButton
      selected={isSelected}
      {...(!drawerOpen && { onMouseEnter: handleClick, onMouseLeave: handleClose })}
      onClick={handleClick}
      sx={{
        pl: drawerOpen ? `${level === 1 ? 20 : level * 20 - 10}px` : 1.5,
        py: !drawerOpen && level === 1 ? 1.5 : 1.1,
        borderRadius: '12px',
        mx: drawerOpen ? 1.25 : 0.75,
        my: 0.35,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        ...(drawerOpen && {
          '&:hover': {
            bgcolor: theme.palette.mode === ThemeMode.DARK
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(4px)'
          },
          '&.Mui-selected': {
            background: theme.palette.mode === ThemeMode.DARK
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)}, ${alpha(theme.palette.primary.main, 0.08)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.main, 0.04)})`,
            color: iconSelectedColor,
            border: `1px solid ${
              theme.palette.mode === ThemeMode.DARK
                ? alpha(theme.palette.primary.main, 0.25)
                : alpha(theme.palette.primary.main, 0.18)
            }`,
            boxShadow: theme.palette.mode === ThemeMode.DARK
              ? `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.12)}`
              : `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.06)}`,
            '&:hover': {
              background: theme.palette.mode === ThemeMode.DARK
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.26)}, ${alpha(theme.palette.primary.main, 0.12)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(theme.palette.primary.main, 0.06)})`,
              transform: 'translateX(4px)'
            }
          }
        }),
        ...(!drawerOpen && {
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
    >
      {menuIcon && (
        <ListItemIcon
          onClick={handlerIconLink}
          sx={{
            minWidth: drawerOpen ? 42 : 'auto',
            color: isSelected ? 'primary.main' : textColor,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(!drawerOpen && {
              borderRadius: '12px',
              width: 46,
              height: 46,
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isSelected
                ? theme.palette.mode === ThemeMode.DARK
                  ? alpha(theme.palette.primary.main, 0.22)
                  : alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
              border: isSelected
                ? `1px solid ${
                    theme.palette.mode === ThemeMode.DARK
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.18)
                  }`
                : '1px solid transparent',
              boxShadow: isSelected
                ? theme.palette.mode === ThemeMode.DARK
                  ? `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`
                  : `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.08)}`
                : 'none',
              '&:hover': {
                bgcolor: theme.palette.mode === ThemeMode.DARK 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : alpha(theme.palette.primary.main, 0.06),
                transform: 'scale(1.05)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            })
          }}
        >
          {menuIcon}
        </ListItemIcon>
      )}

      {!menuIcon && drawerOpen && (
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
              color={isSelected ? 'primary' : textColor}
              sx={{ fontWeight: isSelected ? 600 : 400, fontSize: '0.875rem', lineHeight: 1.4, transition: 'color 0.2s ease' }}
            >
              {menu.title}
            </Typography>
          }
          secondary={
            menu.caption && (
              <Typography variant="caption" color="secondary" sx={{ fontSize: '0.72rem' }}>
                {menu.caption}
              </Typography>
            )
          }
        />
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) &&
        (miniMenuOpened || open ? (
          <>
            {miniMenuOpened ? (
              <ArrowRight2 size={14} color={textColor} style={{ marginLeft: 4 }} />
            ) : (
              <ArrowUp2 size={14} color={textColor} style={{ marginLeft: 4 }} />
            )}
          </>
        ) : (
          <ArrowDown2 size={14} color={textColor} style={{ marginLeft: 4 }} />
        ))}

      {!drawerOpen && (
        <PopperStyled
          open={miniMenuOpened}
          anchorEl={anchorEl}
          placement="right-start"
          style={{
            zIndex: 2001
          }}
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-12, 1]
                }
              }
            ]
          }}
        >
          {({ TransitionProps }) => (
            <Transitions in={miniMenuOpened} {...TransitionProps}>
              <Paper
                sx={{
                  overflow: 'hidden',
                  mt: 1.5,
                  borderRadius: '12px',
                  boxShadow: theme.customShadows.z1,
                  backgroundImage: 'none',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <>
                    <SimpleBar
                      sx={{
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 170px)'
                      }}
                    >
                      {navCollapse}
                    </SimpleBar>
                  </>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </PopperStyled>
      )}
    </ListItemButton>
  );

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <>
          {/* Tooltip khi sidebar thu gọn */}
          {!drawerOpen && level === 1 ? (
            <Tooltip title={menu.title} placement="right" arrow>
              {collapseButton}
            </Tooltip>
          ) : (
            collapseButton
          )}
          {drawerOpen && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List
                sx={{
                  p: 0,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '32px',
                    top: 4,
                    bottom: 4,
                    width: 2,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === ThemeMode.DARK ? 'divider' : alpha(theme.palette.primary.main, 0.18)
                  }
                }}
              >
                {navCollapse}
              </List>
            </Collapse>
          )}
        </>
      ) : (
        <>
          <ListItemButton
            id={`boundary-${popperId}`}
            selected={isSelected}
            onMouseEnter={handleHover}
            onMouseLeave={handleClose}
            onClick={handleHover}
            aria-describedby={popperId}
            sx={{
              borderRadius: '8px',
              mx: 0.5,
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                '&:hover': {
                  bgcolor: 'transparent'
                },
                bgcolor: 'transparent'
              }
            }}
          >
            <Box onClick={handlerIconLink} sx={FlexBox}>
              {menuIcon && (
                <ListItemIcon sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 38, color: theme.palette.secondary.dark }}>
                  {menuIcon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={
                  <Typography variant="h5" color={textColor} sx={{ fontWeight: isSelected ? 600 : 400, fontSize: '0.875rem' }}>
                    {menu.title}
                  </Typography>
                }
              />
              {miniMenuOpened ? <ArrowRight2 size={14} color={textColor} /> : <ArrowDown2 size={14} color={textColor} />}
            </Box>

            {anchorEl && (
              <PopperStyled
                id={popperId}
                open={miniMenuOpened}
                anchorEl={anchorEl}
                placement="right-start"
                style={{
                  zIndex: 2001
                }}
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [-10, 0]
                    }
                  }
                ]}
              >
                {({ TransitionProps }) => (
                  <Transitions in={miniMenuOpened} {...TransitionProps}>
                    <Paper
                      sx={{
                        overflow: 'hidden',
                        mt: 1.5,
                        py: 0.5,
                        borderRadius: '12px',
                        boxShadow: theme.customShadows.z1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: 'none'
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <>
                          <SimpleBar
                            sx={{
                              overflowX: 'hidden',
                              overflowY: 'auto',
                              maxHeight: 'calc(100vh - 170px)'
                            }}
                          >
                            {navCollapse}
                          </SimpleBar>
                        </>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
        </>
      )}
    </>
  );
};

export default NavCollapse;
