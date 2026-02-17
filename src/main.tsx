import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Provider } from "react-redux";
import {store} from './store'
import {Toaster} from 'sonner'

createRoot(document.getElementById("root")!).render(

  <StrictMode>
    <Toaster/>
    <Provider store={store}>
    <AuthProvider>
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>
    </AuthProvider>
    </Provider>
  </StrictMode>,
);
