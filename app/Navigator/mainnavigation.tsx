import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Module from '../../app/(tabs)/Module';
import Dashboard from '../../app/(tabs)/dashboard';

// import AttendanceScreen from '../screens/attendance/AttendanceScreen';
// import DocTypeListScreen from '../screens/documents/DocTypeListScreen';
// import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
// import DocumentFormScreen from '../screens/documents/DocumentFormScreen';
// import EmployeeAdvanceFormScreen from '../screens/documents/EmployeeAdvanceFormScreen';
// import LeaveApplicationFormScreen from '../screens/documents/LeaveApplicationFormScreen';
// import PaymentEntryFormScreen from '../screens/documents/PaymentEntryFormScreen';
// import QuotationFormScreen from '../screens/documents/QuotationFormScreen';
// import SalesOrderFormScreen from '../screens/documents/SalesOrderFormScreen';
// import AccountingScreen from '../screens/modules/AccountingScreen';

// Define the parameter types for the stack navigator
export type MainStackParamList = {
  MainTabs: undefined;
  DocTypeList: { moduleName: string; docTypes: string[] };
  DocumentDetail: { docType: string; docName: string; title: string };
  DocumentForm: { docType: string; docName?: string; mode: 'create' | 'edit'; title: string };
};

// Define the parameter types for the tab navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Module: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  const { colorScheme } = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5', // primary-500
        tabBarInactiveTintColor: '#6b7280', // gray-500
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff', // gray-800 or white
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb', // gray-700 or gray-200
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Module') {
            iconName = 'information-outline';
          } else {
            iconName = 'circle';
          }

          return <Icon name={iconName} size={size + 4} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Module" component={Module} />
    </Tab.Navigator>
    );
  };

// Main Stack Navigator (wraps the tabs and other screens)
export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="DocTypeList"
        component={DocTypeListScreen}
        options={({ route }) => ({
          title: route.params.moduleName,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DocumentForm"
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitleVisible: false,
        })}
      >
        {props => {
          const docType = props.route.params?.docType;
          switch (docType) {
            case 'Quotation':
              return <QuotationFormScreen {...props} />;
            case 'Employee Advance':
              return <EmployeeAdvanceFormScreen {...props} />;
            case 'Sales Order':
              return <SalesOrderFormScreen {...props} />;
            case 'Payment Entry':
              return <PaymentEntryFormScreen {...props} />;
            case 'Leave Application':
              return <LeaveApplicationFormScreen {...props} />;
            default:
              return <DocumentFormScreen {...props} />;
          }
        }}
      </Stack.Screen>
      <Stack.Screen
        name="Accounting"
        component={AccountingScreen}
        options={{
          title: 'Accounting',
        }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          title: 'Attendance',
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
