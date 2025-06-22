import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PageProps = {
  children: ReactNode;
};

export default function Page({ children }: PageProps) {
  return (
    <View style={styles.page}>
      <StatusBar barStyle={"light-content"} backgroundColor={Colors.merah} />
      <SafeAreaView style={styles.safe_area}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.putih,
  },

  safe_area: {
    flex: 1,
  },
});
