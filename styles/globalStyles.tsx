import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF',
  error: '#FF3B30',
  text: '#000000',
  placeholder: '#999999',
  border: '#CCCCCC',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
};

export const fontSize = {
  small: 14,
  medium: 16,
  large: 18,
  title: 24,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 34,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 20,
    width: '100%',
    maxWidth: 300,
    boxShadow: '0px 4px 12px rgba(0, 122, 255, 0.3)',
    elevation: 8,
  },
  googleButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0px 4px 12px rgba(66, 133, 244, 0.3)',
    elevation: 8,
  },
  googleIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  linkText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  linkHighlight: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

});

export default globalStyles;