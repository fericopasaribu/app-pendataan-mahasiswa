import { globals } from "@/assets/styles";
import Page from "@/components/custom/Page";
import { Colors } from "@/constants/Colors";
import { backup } from "@/scripts/backup";
import { restore } from "@/scripts/restore";
import { share } from "@/scripts/share";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Divider,
  FAB,
  IconButton,
  List,
  Menu,
  Portal,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { db, useDatabaseMigration } from "../config/sqlite";
import "../global.css";

export default function RootPage() {
  const [npm, setNPM] = useState("");
  const [foto, setFoto] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [textDialog, setTextDialog] = useState<React.ReactNode>(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(0);

  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [refreshing, setRefreshing] = useState(false);

  const [searchData, setSearchData] = useState("");
  const [filterData, setFilterData] = useState<any[]>([]);

  useEffect(() => {
    useDatabaseMigration();
    getData();
  }, []);

  const getData = () => {
    const rows = db.getAllSync("SELECT * FROM tb_mahasiswa ORDER BY id DESC");

    setUsers(rows);
    setFilterData(rows);
    setSearchData("");
  };

  const showDeleteDialog = (npm: string, nama: string, foto: string) => {
    setNPM(npm);
    setFoto(foto);
    setDialogVisible(true);
    setTextDialog(
      <Text>
        Data Mahasiswa: <Text style={{ fontWeight: "bold" }}>{nama}</Text> Ingin
        Dihapus?
      </Text>
    );
  };

  const deleteData = async () => {
    // cek jika "NPM" tidak ditemukan
    const checkData = db.getFirstSync(
      `SELECT npm FROM tb_mahasiswa WHERE npm = '${npm}'`
    );
    if (!checkData) {
      setSnackbarVisible(true);
      setSnackbarMessage("Data Gagal Dihapus !");
      setSnackbarError(1);
      setDialogVisible(false);
      return;
    }

    await deleteImage();

    db.execSync(`DELETE FROM tb_mahasiswa WHERE npm = '${npm}'`);
    setSnackbarVisible(true);
    setSnackbarMessage("Data Berhasil Dihapus");
    setSnackbarError(0);
    setDialogVisible(false);
    setTimeout(() => getData(), 1000);
  };

  const deleteImage = async () => {
    const location = `${FileSystem.documentDirectory}${foto}`;
    if (!foto) return;

    const fileInfo = await FileSystem.getInfoAsync(location);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(location);
    }
  };

  const setRefresh = () => {
    setRefreshing(true);
    // Simulasi refresh, misalnya ambil ulang data dari API
    setTimeout(() => {
      getData();
      setRefreshing(false);
    }, 1000);
  };

  const setSearch = (text: string) => {
    setSearchData(text);
    if (!text) {
      setFilterData(users); // kosongkan pencarian
      return;
    }

    const filtered = db.getAllSync(
      `SELECT * FROM tb_mahasiswa WHERE (npm LIKE '%${text}%' OR (REPLACE(nama,' ','') LIKE REPLACE('%${text}%',' ','')) OR jurusan LIKE '%${text}%') ORDER BY id DESC`
    );

    setFilterData(filtered);
  };

  return (
    <Page>
      <View
        style={{
          backgroundColor: Colors.hitam,
          paddingVertical: 18,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
        {/* Menu di kanan atas */}
        <View style={{ position: "absolute", right: 0 }}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            contentStyle={{ backgroundColor: Colors.putih, marginTop: 60 }}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor={Colors.putih}
                size={24}
                onPress={openMenu}
              />
            }>
            <Menu.Item
              onPress={async () => {
                closeMenu();
                await share();
              }}
              title="Share Data"
              leadingIcon="share"
            />
            <Menu.Item
              onPress={async () => {
                closeMenu();
                await backup();
              }}
              title="Backup Data"
              leadingIcon="upload"
            />
            <Menu.Item
              onPress={async () => {
                closeMenu();
                await restore();
                setRefresh();
              }}
              title="Restore Data"
              leadingIcon="download"
            />
          </Menu>
        </View>

        {/* Judul di tengah */}
        <Text
          style={{
            color: Colors.putih,
            fontSize: 18,
            // fontWeight: "bold",
          }}>
          Tampil Data Mahasiswa
        </Text>
      </View>

      <View style={{ margin: 20 }}>
        <View>
          <TextInput
            mode="outlined"
            placeholder="Cari Data"
            value={searchData}
            onChangeText={setSearch}
            style={{ backgroundColor: Colors.putih }}
            left={<TextInput.Icon icon="magnify" />}
          />
        </View>

        <FlatList
          style={{ marginTop: 10 }}
          data={filterData}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={setRefresh}
              colors={[Colors.merah, Colors.hitam]}
              // tintColor={Colors.merah}
              progressBackgroundColor={Colors.putih}
            />
          }
          renderItem={({ item }) => (
            <View style={{ padding: 0 }}>
              <List.Item
                title={item.nama}
                description={`${item.npm}\n${item.jurusan}`}
                titleStyle={{ fontSize: 18 }}
                descriptionStyle={{ fontSize: 14 }}
                descriptionNumberOfLines={2}
                left={() => (
                  <View style={[globals.icon_area]}>
                    <Image
                      source={
                        item.foto != "" &&
                        `${FileSystem.documentDirectory}${item.foto}`
                          ? { uri: FileSystem.documentDirectory + item.foto }
                          : require("../assets/images/noimage.png")
                      }
                      style={globals.icon_circle}
                    />
                  </View>
                )}
                right={() => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconButton
                      icon="pencil"
                      iconColor={Colors.hitam}
                      onPress={() => router.push(`/edit/${item.id}`)}
                    />
                    <IconButton
                      icon="delete"
                      iconColor={Colors.merah}
                      onPress={() =>
                        showDeleteDialog(item.npm, item.nama, item.foto)
                      }
                    />
                  </View>
                )}
                style={{ paddingEnd: 0, paddingBottom: 10 }}
                onPress={() => router.push(`/detail/${item.id}`)}
              />
              <Divider
                style={{ backgroundColor: Colors.placeholder, height: 1 }}
              />
            </View>
          )}
        />
      </View>

      <View style={styles.fab_area}>
        <FAB
          icon="plus"
          color={Colors.putih}
          style={styles.fab_object}
          onPress={() => router.push("/add")}
          // onPress={() => router.push("/backup")}
        />
      </View>

      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ backgroundColor: Colors.putih }}>
          <Dialog.Content>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}>
              <List.Icon icon="information" color={Colors.merah} />
              <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>
                Informasi
              </Text>
            </View>

            <Text style={{ fontSize: 16 }}>{textDialog}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={deleteData}>Ya</Button>
            <Button onPress={() => setDialogVisible(false)}>Tidak</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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

const styles = StyleSheet.create({
  fab_area: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fab_object: {
    backgroundColor: Colors.merah,
    shadowColor: "transparent",
  },
});
