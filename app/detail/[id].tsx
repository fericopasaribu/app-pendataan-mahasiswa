import { globals } from "@/assets/styles";
import Page from "@/components/custom/Page";
import { Colors } from "@/constants/Colors";
import { String } from "@/constants/String";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  Dialog,
  IconButton,
  Portal,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { db } from "../../config/sqlite";

type Mahasiswa = {
  id: number;
  npm: string;
  nama: string;
  jurusan: string;
  foto: string;
};

export default function EditPage() {
  // ambil id
  const { id } = useLocalSearchParams();

  const [form, setForm] = useState({
    npm: "",
    nama: "",
    jurusan: "",
    foto: "",
  });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  //  detail data
  const getData = () => {
    // Ambil data berdasarkan npm
    // Ambil data berdasarkan npm
    const data = db.getFirstSync(
      `SELECT * FROM tb_mahasiswa WHERE id = '${id}'`
    ) as Mahasiswa;

    if (data) {
      setForm({
        npm: data.npm,
        nama: data.nama,
        jurusan: data.jurusan,
        foto: data.foto,
      });
    }
  };

  const setRefresh = () => {
    setRefreshing(true);
    // Simulasi refresh, misalnya ambil ulang data dari API
    setTimeout(() => {
      // setForm({ ...form, npm: "", nama: "", jurusan: "Informatika" });
      getData();
      setRefreshing(false);
    }, 1000);
  };

  const viewImage = () => {
    if (form.foto) {
      setDialogVisible(true);
    }
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
          Detail Data Mahasiswa
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
          <Pressable onPress={viewImage}>
            <Image
              source={
                form.foto != "" && `${FileSystem.documentDirectory}${form.foto}`
                  ? { uri: `${FileSystem.documentDirectory}${form.foto}` }
                  : require("../../assets/images/noimage.png")
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
            editable={false}
            style={[globals.component, globals.text]}
            contentStyle={{ paddingStart: 0, paddingEnd: 0 }}
            underlineColor={Colors.hitam}
            maxLength={8}
            keyboardType="numeric"
          />

          <Text style={{ marginTop: 20 }}>Nama</Text>
          <TextInput
            mode="flat"
            value={form.nama}
            editable={false}
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
              disabled={true}
            />
            <Text>Informatika</Text>
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
              disabled={true}
            />
            <Text>Sistem Informasi</Text>
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
              disabled={true}
            />
            <Text>Teknologi Informasi</Text>
          </View>

          <View style={{ marginTop: 50, flexDirection: "row" }}>
            <Button
              icon="chevron-left"
              mode="outlined"
              onPress={() => router.back()}
              labelStyle={{ color: Colors.hitam }}
              rippleColor={Colors.shadow} // warna saat diklik
              style={{
                flex: 1,
                marginStart: 10,
              }}
              contentStyle={globals.button}>
              {String.button.back}
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ backgroundColor: Colors.putih }}>
          <Dialog.Content>
            <View style={[globals.photo_area]}>
              <IconButton
                icon="close"
                iconColor={Colors.hitam}
                size={24}
                onPress={() => setDialogVisible(false)}
                style={globals.modal_close}
              />
              <Image
                source={{ uri: FileSystem.documentDirectory + form.foto }}
                style={globals.photo_image}
              />
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </Page>
  );
}
