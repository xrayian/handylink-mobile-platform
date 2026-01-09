import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "react-native-heroicons/outline";
import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  UserGroupIcon as UserGroupSolid,
  Cog6ToothIcon as CogSolid,
} from "react-native-heroicons/solid";

import AdminOverviewScreen from "../screens/admin/AdminOverviewScreen";
import AdminHandymenScreen from "../screens/admin/AdminHandymenScreen";
import AdminCustomersScreen from "../screens/admin/AdminCustomersScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    // <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
    //@ts-ignore
      <Tab.Navigator
        screenOptions={{
                headerShown: false,
                // tabBaseStyle: {
                //     borderTopWidth: 0,
                //     elevation: 0,
                //     height: 60,
                //     paddingBottom: 10,
                // },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        // screenOptions={{
        //   headerShown: false,
        //   tabBarStyle: {
        //     backgroundColor: "white",
        //     borderTopWidth: 1,
        //     borderTopColor: "#f3f4f6",
        //     height: 60,
        //     paddingBottom: 8,
        //     paddingTop: 8,
        //   },
        //   tabBarActiveTintColor: "black",
        //   tabBarInactiveTintColor: "#9ca3af",
        //   tabBarLabelStyle: {
        //     fontSize: 12,
        //     fontWeight: "600",
        //   },
        // }}
      >
        <Tab.Screen
          name="Dashboard"
          component={AdminOverviewScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) =>
              focused ? (
                <HomeSolid size={size} color={color} />
              ) : (
                <HomeIcon size={size} color={color} />
              ),
            tabBarLabel: "Overview",
          }}
        />
        <Tab.Screen
          name="HandymenList"
          component={AdminHandymenScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) =>
              focused ? (
                <UsersSolid size={size} color={color} />
              ) : (
                <UsersIcon size={size} color={color} />
              ),
            tabBarLabel: "Handymen",
          }}
        />
        <Tab.Screen
          name="CustomersList"
          component={AdminCustomersScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) =>
              focused ? (
                <UserGroupSolid size={size} color={color} />
              ) : (
                <UserGroupIcon size={size} color={color} />
              ),
            tabBarLabel: "Customers",
          }}
        />
        <Tab.Screen
          name="AdminSettings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) =>
              focused ? (
                <CogSolid size={size} color={color} />
              ) : (
                <Cog6ToothIcon size={size} color={color} />
              ),
            tabBarLabel: "Settings",
          }}
        />
      </Tab.Navigator>
    // </SafeAreaView>
  );
};

export default AdminTabNavigator;
