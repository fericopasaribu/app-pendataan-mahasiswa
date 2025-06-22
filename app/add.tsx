import { globals } from "@/assets/styles";
import Page from "@/components/custom/Page";
import { setOnlyNumber, setOnlyText } from "@/config/general";
import { Colors } from "@/constants/Colors";
import { String } from "@/constants/String";
import * as FileSystem from "expo-file-system";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Button,
  IconButton,
  RadioButton,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { db } from "../config/sqlite";

export default function AddPage() {
  const [form, setForm] = useState({
    npm: "",
    nama: "",
    jurusan: "",
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);

  const setRefresh = () => {
    setRefreshing(true);
    // Simulasi refresh, misalnya ambil ulang data dari API
    setTimeout(() => {
      setForm({ ...form, npm: "", nama: "", jurusan: "" });
      setRefreshing(false);
    }, 1000);
  };

  //   save data
  const addUser = async (npm: string, nama: string, jurusan: string) => {
    if (npm == "" || nama == "" || jurusan == "") {
      setSnackbarVisible(true);
      setSnackbarMessage("Seluruh Data Harus Diisi !");
      setSnackbarError(1);
      return;
    }
    // cek jika "NPM" ditemukan
    const checkData = db.getFirstSync(
      `SELECT npm FROM tb_mahasiswa WHERE npm = '${npm}'`
    );
    if (checkData) {
      setSnackbarVisible(true);
      setSnackbarMessage("Data Gagal Disimpan !");
      setSnackbarError(1);
      return;
    }

    const fileName = await saveImage();

    db.execSync(
      `INSERT INTO tb_mahasiswa VALUES (null, '${npm}', '${nama}','${jurusan}','${fileName}')`
    );

    setSnackbarVisible(true);
    setSnackbarMessage("Data Berhasil Disimpan");
    setSnackbarError(0);
    setTimeout(() => router.back(), 1000);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setImageUri(pickedUri); // hanya diset ke state, belum disimpan
    }
  };

  const saveImage = async () => {
    if (!imageUri) return "";

    // kompres file
    // const compressed = await ImageManipulator.manipulateAsync(imageUri, [], {
    //   compress: 0.5, // 0.0 - 1.0 (semakin kecil, semakin terkompres)
    //   format: ImageManipulator.SaveFormat.JPEG,
    // });

    // const compressed = await manipulateAsync(imageUri, [], {
    //   compress: 0.2,
    //   format: SaveFormat.JPEG,
    // });

    // Ambil ukuran gambar asli
    const { width, height } = await Image.getSize(imageUri);

    // Resize (maksimal sisi terpanjang 800px)
    const maxSize = 600;
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);

    // Kompres gambar
    const compressed = await manipulateAsync(
      imageUri,
      [
        {
          resize: { width: newWidth, height: newHeight },
        },
      ],
      {
        compress: 0.5, // Kompres semaksimal mungkin
        format: SaveFormat.JPEG,
      }
    );

    const fileExt = imageUri.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    // const fileName = `${Date.now()}.jpg`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: compressed.uri,
      to: newPath,
    });

    return fileName;
  };

  return (
    <Page>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.hitam,
        }}>
        <IconButton
          icon="arrow-left"
          iconColor={Colors.putih}
          size={24}
          onPress={() => router.back()} // atau navigation.goBack()
          style={{
            position: "absolute",
            left: 0,
          }}
        />
        <Text
          className="text-white text-xl py-5 text-center"
          style={{ backgroundColor: Colors.hitam }}>
          Tambah Data Mahasiswa
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={setRefresh}
            colors={[Colors.merah, Colors.hitam]}
            // tintColor={Colors.merah}
            progressBackgroundColor={Colors.putih}
          />
        }>
        <View style={[globals.image_area, { margin: 20 }]}>
          <Pressable onPress={pickImage}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : require("../assets/images/noimage.png")
              }
              style={globals.image_circle}
            />
          </Pressable>
        </View>

        <View style={{ margin: 20 }}>
          <Text>NPM</Text>
          <TextInput
            mode="flat"
            value={form.npm}
            onChangeText={(text) => {
              const result = setOnlyNumber(text);
              setForm({ ...form, npm: result });
            }}
            style={[globals.component, globals.text, globals.border_bottom]}
            contentStyle={{ paddingStart: 0, paddingEnd: 0 }}
            underlineColor={Colors.hitam}
            maxLength={8}
            keyboardType="numeric"
          />

          <Text style={{ marginTop: 20 }}>Nama</Text>
          <TextInput
            mode="flat"
            value={form.nama}
            onChangeText={(text) => {
              const result = setOnlyText(text);
              setForm({ ...form, nama: result });
            }}
            style={[globals.component, globals.text]}
            contentStyle={{ paddingStart: 0, paddingEnd: 0 }}
            underlineColor={Colors.hitam}
            maxLength={100}
            keyboardType="default"
          />

          <Text style={{ marginTop: 20, marginBottom: 10 }}>Jurusan</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: -8,
            }}>
            <RadioButton
              value="Informatika"
              status={form.jurusan === "Informatika" ? "checked" : "unchecked"}
              onPress={() => setForm({ ...form, jurusan: "Informatika" })}
            />
            <Text onPress={() => setForm({ ...form, jurusan: "Informatika" })}>
              Informatika
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: -8,
            }}>
            <RadioButton
              value="Sistem Informasi"
              status={
                form.jurusan === "Sistem Informasi" ? "checked" : "unchecked"
              }
              onPress={() => setForm({ ...form, jurusan: "Sistem Informasi" })}
            />
            <Text
              onPress={() => setForm({ ...form, jurusan: "Sistem Informasi" })}>
              Sistem Informasi
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: -8,
            }}>
            <RadioButton
              value="Teknologi Informasi"
              status={
                form.jurusan === "Teknologi Informasi" ? "checked" : "unchecked"
              }
              onPress={() =>
                setForm({ ...form, jurusan: "Teknologi Informasi" })
              }
            />
            <Text
              onPress={() =>
                setForm({ ...form, jurusan: "Teknologi Informasi" })
              }>
              Teknologi Informasi
            </Text>
          </View>

          <View style={{ marginTop: 50, flexDirection: "row" }}>
            <Button
              icon="check"
              mode="contained"
              onPress={() => addUser(form.npm, form.nama, form.jurusan)}
              style={{ flex: 1, marginEnd: 10 }}
              contentStyle={globals.button}>
              {String.button.save}
            </Button>

            <Button
              icon="close"
              mode="outlined"
              onPress={() => router.back()}
              labelStyle={{ color: Colors.hitam }}
              rippleColor={Colors.shadow} // warna saat diklik
              style={{
                flex: 1,
                marginStart: 10,
              }}
              contentStyle={globals.button}>
              {String.button.cancel}
            </Button>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1000}
        style={[
          globals.snackbar,
          snackbarError == 0
            ? { backgroundColor: Colors.hitam }
            : { backgroundColor: Colors.merah },
        ]}>
        <Text
          style={{ textAlign: "center", color: Colors.putih, width: "100%" }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </Page>
  );
}
