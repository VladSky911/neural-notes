import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NotesScreen from "../screens/NotesScreen";
import NoteEditorScreen from "../screens/NoteEditorScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Notes">
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
          options={{ title: "Мои заметки" }}
        />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{ title: "Редактор" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
