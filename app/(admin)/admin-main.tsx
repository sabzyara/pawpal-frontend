import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
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
  status: "PENDING" | "ACTIVE" | "REJECTED";
};

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      const res = await api.get("/user-service/admin/users");

      setUsers(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id: number) => {
    try {
      await api.put(`/user-service/admin/users/${id}/approve`);

      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  const rejectUser = async (id: number) => {
    try {
      await api.put(`/user-service/admin/users/${id}/reject`);

      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteUser = async (id: number) => {
    Alert.alert("Delete user?", "This action cannot be undone", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/user-service/admin/users/${id}`);

            fetchUsers();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      <TextInput
        placeholder="Search email"
        placeholderTextColor={colors.text.secondary}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

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
            <Text style={styles.filterText}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/admin-user-profile",
                params: {
                  id: item.id.toString(),
                },
              })
            }
          >
            <View style={styles.rowTop}>
              <View>
                <Text style={styles.email}>{item.email}</Text>

                <Text style={styles.meta}>
                  {item.role} • {item.status}
                </Text>
              </View>

              <Text style={styles.open}>Open</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
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
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 16,
      color: colors.text.primary,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border.medium,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      color: colors.text.primary,
    },

    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },

    filterBtn: {
      borderWidth: 1,
      borderColor: colors.border.medium,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },

    filterBtnActive: {
      backgroundColor: colors.primary.main,
    },

    filterText: {
      color: colors.text.primary,
    },

    card: {
      backgroundColor: colors.card.default,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
    },

    email: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },

    meta: {
      marginTop: 4,
      color: colors.text.secondary,
    },

    btnText: {
      color: "white",
      fontWeight: "600",
    },

    rowTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    open: {
      color: colors.primary.main,
      fontWeight: "700",
    },
  });