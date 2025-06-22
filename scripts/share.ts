import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { zip } from "react-native-zip-archive";

export const share = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/mahasiswa.db`;
    const documentDir = FileSystem.documentDirectory!;
    const backupDir = `${documentDir}backup/`;
    const zipPath = `${documentDir}backup.zip`;

    // 1. Hapus backup lama jika ada
    const oldZip = await FileSystem.getInfoAsync(zipPath);
    if (oldZip.exists) {
        await FileSystem.deleteAsync(zipPath);
    }

    const oldBackupDir = await FileSystem.getInfoAsync(backupDir);
    if (oldBackupDir.exists) {
        await FileSystem.deleteAsync(backupDir);
    }

    // 2. Buat folder backup
    await FileSystem.makeDirectoryAsync(backupDir);

    // 3. Salin file database
    const dbBackupPath = `${backupDir}mahasiswa.db`;
    await FileSystem.copyAsync({ from: dbPath, to: dbBackupPath });

    // 4. Salin file gambar (JPG/JPEG/PNG) dari root documentDirectory
    const files = await FileSystem.readDirectoryAsync(documentDir);
    const imageFiles = files.filter(
        (f) => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")
    );

    for (const filename of imageFiles) {
        const from = `${documentDir}${filename}`;
        const to = `${backupDir}${filename}`;
        await FileSystem.copyAsync({ from, to });
    }

    // 5. Buat file ZIP dari folder backup
    const zipResult = await zip(backupDir, zipPath);
    const zipUri = `file://${zipResult}`;

    // 6. Bagikan file ZIP
    await Sharing.shareAsync(zipUri, {
        mimeType: "application/zip",
        // dialogTitle: "Bagikan Backup SQLite + Gambar",
    });

    // Alert.alert("Informasi", "Data Berhasil di Share");
};