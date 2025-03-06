import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const index = () => {
  useWarmUpBrowser();

  return (
    <LinearGradient colors={["#16222A", "#3A6073"]} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.image}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>UNIFY</Text>
        <Text style={styles.subtitle}>
          Unify your connections, simplify your workflow, and collaborate
          seamlessly.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => router.replace("/(auth)/loginScreen")}>
          <LinearGradient
            colors={["#16222A", "#3A6073","gray"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </LinearGradient>
        </TouchableOpacity>

        
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F3B8C",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "60%",
    height: "60%",
    resizeMode: "cover",
  },
  content: {
    alignItems: "center",
    marginTop: -40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 80,
    alignItems: "center",
  },
  loginButton: {
    width: 300,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  signupButton: {
    width: 300,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default index;
