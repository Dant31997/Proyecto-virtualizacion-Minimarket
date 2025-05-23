import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import Header from "./Header";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.7;

const Layout = ({ children }) => {
  const navigation = useNavigation();
  const { authState, signOut } = useAuth();
  const userRole = authState?.role || authState?.user?.role || "";

  useEffect(() => {
    console.log(
      "Estado de autenticación completo:",
      JSON.stringify(authState, null, 2)
    );
    console.log("Tipo de authState:", typeof authState);
    console.log("Rol extraído:", userRole);
    console.log("Tipo de rol:", typeof userRole);
    console.log("¿Es admin? (comparación directa):", userRole === "admin");
    console.log(
      "¿Es admin? (comparación insensible):",
      userRole.toLowerCase() === "admin"
    );
  }, [authState, userRole]);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // Función para abrir el menú
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Función para cerrar el menú
  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleMenuPress = () => {
    if (menuVisible) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleProfilePress = () => {
    const isAdmin =
      userRole &&
      (userRole === "admin" ||
        userRole.toLowerCase() === "admin" ||
        userRole === "ADMIN");

    if (isAdmin) {
      navigation.navigate("AdminRoot", { screen: "AccountScreenAdmin" });
    } else if (userRole) {
      navigation.navigate("UserRoot", { screen: "AccountScreen" });
    } else {
      navigation.navigate("Login");
    }
  };

  // Función para navegar y cerrar el menú
  const navigateTo = (screenName, params = {}) => {
    closeMenu();
    navigation.navigate(screenName, params);
  };

  // Renderiza diferentes opciones de menú según el rol de usuario
  const renderMenuItems = () => {
    const isAdmin =
      userRole &&
      (userRole === "admin" ||
        userRole.toLowerCase() === "admin" ||
        userRole === "ADMIN");

    if (!authState.authenticated) {
      // Opciones para usuarios no autenticados
      return (
        <>
          <MenuItem
            icon="home-outline"
            label="Inicio"
            onPress={() => navigateTo("Home")}
          />
          <MenuItem
            icon="cart-outline"
            label="Carrito"
            onPress={() => navigateTo("CartScreen")}
          />
          <MenuItem
            icon="log-in-outline"
            label="Iniciar Sesión"
            onPress={() => navigateTo("Login")}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Acerca de"
            onPress={() => navigateTo("About")}
          />
        </>
      );
    } else if (isAdmin) {
      // Opciones para administradores
      return (
        <>
          <MenuItem
            icon="grid-outline"
            label="Panel Principal"
            onPress={() =>
              navigateTo("AdminRoot", { screen: "AdminDashboard" })
            }
          />
          <MenuItem
            icon="cube-outline"
            label="Crear Producto"
            onPress={() => navigateTo("AdminRoot", { screen: "CreateProduct" })}
          />
          <MenuItem
            icon="document-text-outline"
            label="Pedidos"
            onPress={() => navigateTo("AdminRoot", { screen: "OrdersScreen" })}
          />
          <MenuItem
            icon="people-outline"
            label="Gestión de Usuarios"
            onPress={() =>
              navigateTo("AdminRoot", { screen: "UserManagement" })
            }
          />
          <MenuItem
            icon="person-circle-outline"
            label="Mi Cuenta"
            onPress={() =>
              navigateTo("AdminRoot", { screen: "AccountScreenAdmin" })
            }
          />
          <MenuItem
            icon="log-out-outline"
            label="Cerrar Sesión"
            onPress={() => {
              closeMenu();
              signOut();
            }}
          />
        </>
      );
    } else {
      // Opciones para usuarios
      return (
        <>
          <MenuItem
            icon="home-outline"
            label="Inicio"
            onPress={() => navigateTo("UserRoot", { screen: "UserDashboard" })}
          />
          <MenuItem
            icon="cart-outline"
            label="Productos"
            onPress={() => navigateTo("UserRoot", { screen: "ProductList" })}
          />
          <MenuItem
            icon="basket-outline"
            label="Carrito"
            onPress={() => navigateTo("CartScreen")}
          />
          <MenuItem
            icon="list-outline"
            label="Mis Pedidos"
            onPress={() => navigateTo("UserRoot", { screen: "OrderHistory" })}
          />
          <MenuItem
            icon="person-circle-outline"
            label="Mi Cuenta"
            onPress={() => navigateTo("UserRoot", { screen: "AccountScreen" })}
          />
          <MenuItem
            icon="log-out-outline"
            label="Cerrar Sesión"
            onPress={() => {
              closeMenu();
              signOut();
            }}
          />
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header
        onMenuPress={handleMenuPress}
        onProfilePress={handleProfilePress}
      />
      <View style={styles.content}>{children}</View>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Menú desplegable */}
      {menuVisible && (
        <Animated.View
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>MiniMarket</Text>
            <Text style={styles.drawerSubtitle}>
              {!authState.token
                ? "Invitado"
                : userRole &&
                  (userRole === "admin" ||
                    userRole.toLowerCase() === "admin" ||
                    userRole === "ADMIN")
                  ? "Administrador"
                  : "Cliente"}
            </Text>
          </View>
          <View style={styles.drawerContent}>{renderMenuItems()}</View>
        </Animated.View>
      )}
    </View>
  );
};

// Componente para cada elemento del menú
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#333" />
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FDFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F6FDFF",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#FFF",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: "#0077B6",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  drawerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
  },
  drawerContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
});

export default Layout;
