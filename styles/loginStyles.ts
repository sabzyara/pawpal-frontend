import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const colors = {
  primary: "#7A2E4D",      // бордовый (главный)
  secondary: "#E06387",    // розовый (акцент)
  background: "#FDF7F9",   // светлый розоватый
  card: "#FFFFFF",
  text: "#2A1A22",
  gray: "#9A8A92",
  border: "#F1D6DF",
  error: "#FF6B6B",
  button: "#7A2E4D",
};

 export const styles = StyleSheet.create({
  header: {
    height: 260,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },

  logoWrapper: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: '#FFFFFF', // 💥 ВАЖНО
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,

  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 15,
  elevation: 6,
},

logo: {
  width: 70,
  height: 70,
},

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  subtitle: {
    fontSize: 14,
    color: '#E0E0FF',
    textAlign: 'center',
  },

  card: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: -60,
  },

  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  passwordContainer: {
    position: 'relative',
  },

  eye: {
    position: 'absolute',
    right: 15,
    top: 15,
  },

  button: {
    backgroundColor: '#7A2E4D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  registerText: {
    color: '#999',
  },

  registerLink: {
    color: '#7A2E4D',
    fontWeight: '600',
  },

  errorBox: {
    backgroundColor: '#FF6B6B20',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  
});