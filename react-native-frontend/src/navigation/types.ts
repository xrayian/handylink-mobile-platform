import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  RegisterChoice: undefined;
  RegisterCustomer: undefined;
  RegisterHandyman: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  About: undefined;
  Settings: undefined;
  GigDetails: { id: string };
  HandymanProfile: { id: string };
  HandymanVerification: undefined;
  
  // Tab Navigators / Dashboards
  AdminDashboard: undefined;
  HandymanDashboard: undefined;
  CustomerTabs: undefined;
  
  CreateGig: { gig?: any } | undefined;
};

// Combine all stacks for the global type
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
} & AuthStackParamList & AppStackParamList; 

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
