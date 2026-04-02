import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🌱 AI 园艺设计师
        </Typography>
        
        <Button color="inherit" onClick={() => navigate('/')}>首页</Button>
        <Button color="inherit" onClick={() => navigate('/dashboard')}>仪表板</Button>
        <Button color="inherit" onClick={() => navigate('/projects')}>我的项目</Button>
        <Button color="inherit" onClick={() => navigate('/plants')}>植物库</Button>
        <Button color="inherit" onClick={() => navigate('/community')}>社区</Button>
        
        {user ? (
          <>
            <Button color="inherit" onClick={() => navigate('/profile')}>
              {user.username || user.name}
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Typography>👤</Typography>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>个人资料</MenuItem>
              <MenuItem onClick={handleLogout}>退出登录</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>登录</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>注册</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;