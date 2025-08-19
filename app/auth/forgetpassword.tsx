import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import StyledButton from "@/components/ui/StyledButton";
import StyledInput from "@/components/ui/StyledInput";
import api from "@/services/api";
import React, { useState } from "react";
import { Alert, StyleSheet } from "react-native";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await api.forgetPassword(email);
      Alert.alert("Reset Password", "A password reset link has been sent to your email address.");
    } catch (error: any) {
      Alert.alert("Reset Password Failed", error.message || "Failed to send password reset link.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Forget Password
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Enter your email address to reset your password.
      </ThemedText>
      <StyledInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <StyledButton title="Reset Password" onPress={handleResetPassword} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
});

export default ForgetPassword;
