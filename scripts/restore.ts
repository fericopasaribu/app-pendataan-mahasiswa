import { db } from "@/config/sqlite";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { unzip } from "react-native-zip-archive";

export const restore = async () => {

    // 1. Pilih file ZIP dari pengguna
    const res = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
    });

    if (!res || !res.assets || res.assets.length === 0) {
        Alert.alert("Informasi", "Restore Data Dibatalkan !");
        return;
    }

    const sourceUri = res.assets[0].uri;
    const tempZip = `${FileSystem.documentDirectory}restore.zip`;

    // 2. Salin ke direktori aplikasi
    await FileSystem.copyAsync({
        from: sourceUri,
        to: tempZip,
    });

    // 3. Unzip isi ZIP ke folder sementara
    const unzipDest = `${FileSystem.documentDirectory}restore/`;
    const existed = await FileSystem.getInfoAsync(unzipDest);
    if (existed.exists) {
        await FileSystem.deleteAsync(unzipDest, { idempotent: true });
    }

    await unzip(tempZip.replace("file://", ""), unzipDest);

    // 4. Restore database
    const restoredDbPath = `${unzipDest}mahasiswa.db`;
    const dbTargetPath = `${FileSystem.documentDirectory}SQLite/mahasiswa.db`;

    const dbExists = await FileSystem.getInfoAsync(restoredDbPath);
    if (!dbExists.exists) {
        throw new Error("File Backup Tidak Ditemukan !");
    }

    await FileSystem.copyAsync({ from: restoredDbPath, to: dbTargetPath });

    // 5. Restore semua gambar
    const files = await FileSystem.readDirectoryAsync(unzipDest);
    const imageFiles = files.filter((f) =>
        [".jpg", ".jpeg", ".png"].some((ext) => f.toLowerCase().endsWith(ext))
    );

    for (const file of imageFiles) {
        await FileSystem.copyAsync({
            from: `${unzipDest}${file}`,
            to: `${FileSystem.documentDirectory}${file}`,
        });
    }

    Alert.alert("Informasi", "Data Berhasil di Restore");

};