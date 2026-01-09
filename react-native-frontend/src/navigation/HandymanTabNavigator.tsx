import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  HomeIcon,
  Cog6ToothIcon,
} from "react-native-heroicons/outline";
import {
  HomeIcon as HomeSolid,
  Cog6ToothIcon as CogSolid,
} from "react-native-heroicons/solid";

import HandymanDashboardScreen from "../screens/dashboard/HandymanDashboardScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const HandymanTabNavigator = () => {
  return (
    /* @ts-ignore */
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HandymanDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <HomeSolid size={size} color={color} />
            ) : (
              <HomeIcon size={size} color={color} />
            ),
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="HandymanSettings"
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
  );
};

export default HandymanTabNavigator;
