import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type User = {
  id: number;
  email: string;
  role: "OWNER" | "VET" | "SERVICE";
  status: string;
  createdAt: string;
};

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/user-service/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔎 FILTER
  useEffect(() => {
    let result = users;

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (query) {
      result = result.filter((u) =>
        u.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFiltered(result);
  }, [query, roleFilter, users]);

  const handleOpenUser = (user: User) => {
    router.push({
        pathname: "/admin-user-profile",
        params: {
            id: String(user.id),
            role: String(user.role),
        },
        } as any
    );
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search by email"
        placeholderTextColor={colors.text.tertiary}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {/* 🎯 FILTER */}
      <View style={styles.filters}>
        {["ALL", "OWNER", "VET", "SERVICE"].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterBtn,
              roleFilter === role && styles.filterBtnActive,
            ]}
            onPress={() => setRoleFilter(role)}
          >
            <Text
              style={
                roleFilter === role
                  ? styles.filterTextActive
                  : styles.filterText
              }
            >
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 TABLE */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleOpenUser(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>
                {item.role} • {item.status}
              </Text>
            </View>

            <Text style={styles.link}>Open</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background.primary,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background.primary,
    },

    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 16,
    },

    input: {
      backgroundColor: colors.input.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.input.border,
      color: colors.text.primary,
    },

    filters: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap",
    },

    filterBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.medium,
    },

    filterBtnActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },

    filterText: {
      color: colors.text.primary,
      fontSize: 12,
    },

    filterTextActive: {
      color: colors.text.inverse,
      fontSize: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.card.default,
      marginBottom: 10,
    },

    email: {
      fontWeight: "600",
      color: colors.text.primary,
    },

    meta: {
      fontSize: 12,
      color: colors.text.secondary,
    },

    link: {
      color: colors.primary.main,
      fontWeight: "600",
    },
  });