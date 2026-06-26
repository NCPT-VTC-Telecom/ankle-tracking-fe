import { ReactElement } from 'react';

// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

export interface SSIDUser {
  ssid_id: string;
  user_id: string;
  id: number;
}
export interface SiteUser {
  site_id: string;
  user_id: string;
  name: string;
}

export interface RegionUser {
  id: number;
  region_id: string;
  user_id: string;
}

export type UserProfile = {
  id: string;
  email?: string;
  avatar?: string;
  image?: string;
  name?: string;
  role?: string;
  tier?: string;
  fullname?: string;
  username?: string;
  phoneNumber?: string;
  phone_number?: string;
  address?: string;
  currentSites?: string | null;
  currentRegion?: string | null;
  currentAds: Array<Number> | null; // Added currentAds property
  sites?: SiteUser[];
  regions?: RegionUser[];
  ssids?: SSIDUser[];
  user_group?: any;
  user_group_lv2?: any;
  user_group_lv3?: any;
  status_description?: string;
};

export interface AuthProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  userLogged?: any;
  username?: string;
  userFound?: any;
  userSocial?: any;
  token?: string | null;
  currentSites?: string | null;
  currentRegion?: string | null;
  currentAds: Array<Number> | null; // Added currentAds property
}

export interface AuthActionProps {
  type: string;
  payload?: AuthProps;
}

export interface InitialLoginContextProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
}

export interface JWTDataProps {
  userId: string;
}

export type JWTContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  username?: string;
  userFound?: any;
  logout: (silent?: boolean) => void;
  login: (username: string, password: string) => Promise<{ code: number }>;
  register: (
    phoneNumber: string,
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isAdmin: boolean
  ) => Promise<{ code: number; message: string }>;
  resetPassword: (username: string, email: string, newPassword: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};
