import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { Alert } from "react-native";
import { zip } from "react-native-zip-archive";

export const backup = async () => {

    const dbPath = `${FileSystem.documentDirectory}SQLite/mahasiswa.db`;
    const documentDir = FileSystem.documentDirectory!;
    const backupDir = `${documentDir}backup/`;
    const zipPath = `${documentDir}backup.zip`;

    // 1. Bersihkan backup sebelumnya
    if ((await FileSystem.getInfoAsync(zipPath)).exists) {
        await FileSystem.deleteAsync(zipPath);
    }

    if ((await FileSystem.getInfoAsync(backupDir)).exists) {
        await FileSystem.deleteAsync(backupDir);
    }

    // 2. Buat folder sementara
    await FileSystem.makeDirectoryAsync(backupDir);

    // 3. Salin DB
    const dbBackupPath = `${backupDir}mahasiswa.db`;
    await FileSystem.copyAsync({ from: dbPath, to: dbBackupPath });

    // 4. Salin gambar
    const files = await FileSystem.readDirectoryAsync(documentDir);
    const imageFiles = files.filter((f) =>
        [".jpg", ".jpeg", ".png"].some((ext) => f.endsWith(ext))
    );

    for (const filename of imageFiles) {
        const from = `${documentDir}${filename}`;
        const to = `${backupDir}${filename}`;
        await FileSystem.copyAsync({ from, to });
    }

    // 5. ZIP semua
    const zipResult = await zip(backupDir, zipPath);
    const zipUri = `file://${zipResult}`;

    // 6. Pilih folder tujuan
    const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
        throw new Error("Akses Folder Ditolak User !");
    }

    const base64 = await FileSystem.readAsStringAsync(zipUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    // 7. Simpan file ke folder pilihan
    const fileName = `backup-${Date.now()}.zip`;
    const targetFileUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/zip"
    );

    await FileSystem.writeAsStringAsync(targetFileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert("Informasi", "Data Berhasil di Backup");

};