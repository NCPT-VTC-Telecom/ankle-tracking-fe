import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// third-party
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider as ReduxProvider } from 'react-redux';
// fonts
import 'assets/fonts/inter/inter.css';

// scroll bar
import 'simplebar/dist/simplebar.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

// apex-chart
import 'assets/third-party/apex-chart.css';
import 'assets/third-party/react-table.css';

//ant
import 'antd/dist/reset.css';

// project-imports
import { ConfigProvider } from 'shared/contexts/ConfigContext';
import { store } from 'shared/store';
import App from './App';
import reportWebVitals from './reportWebVitals';

//css
import './input.css';

const container = document.getElementById('root');
const root = createRoot(container!);
const clientID: string = import.meta.env.VITE_APP_TOKEN_CLIENT_ID_GOOGLE || '';

const router = createBrowserRouter([
  {
    path: '/*', // App của bạn sẽ handle toàn bộ route con
    element: <App />
  }
]);
// ==============================|| MAIN - REACT DOM RENDER  ||============================== //

root.render(
  <GoogleOAuthProvider clientId={clientID}>
    <ReduxProvider store={store}>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ReduxProvider>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
