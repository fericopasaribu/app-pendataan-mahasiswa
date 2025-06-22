import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const globals = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  component: {
    backgroundColor: Colors.putih,
  },
  button: {
    height: 50,
    justifyContent: "center",
  },
  snackbar: {
    marginBottom: 20,
  },
  image_area: {
    alignItems: "center",
  },
  image_circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: Colors.placeholder,
  },
  icon_area: {
    alignSelf: "center",
    paddingStart: 10
  },
  icon_circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  photo_area: {
    alignItems: "center",
  },
  photo_image: {
    width: "100%",
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: Colors.placeholder,
    aspectRatio: 3 / 4,
  },
  border_bottom: {
    borderBottomColor: Colors.putih,
  },
  modal_close: {
    position: "absolute",
    right: -15,
    top: -15,
    zIndex: 1,
    backgroundColor: Colors.putih,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
});
