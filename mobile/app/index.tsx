// mobile/app/index.tsx
// React & Core
import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";

// Third Party
import {
  Text,
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  HelperText,
  Portal,
  Modal,
  IconButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import Head from "expo-router/head";

// Project Imports
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

/*
 * Helper Components
 */
const KeyboardWrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === "web") return <>{children}</>;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

const InputGroup = ({
  children,
  errorMsg,
}: {
  children: React.ReactNode;
  errorMsg: string;
}) => (
  <View style={{ marginBottom: 5, width: "100%" }}>
    {children}
    <View style={{ height: 24, justifyContent: "center" }}>
      {errorMsg ? (
        <HelperText type='error' visible={true} style={{ paddingVertical: 0 }}>
          {errorMsg}
        </HelperText>
      ) : null}
    </View>
  </View>
);

/*
 * Main Component
 */
export default function AuthScreen() {
  /*
   * Contexts & Hooks
   */
  const theme = useTheme();
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  /*
   * States
   */
  // Auth States
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  // Guest States
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestCode, setGuestCode] = useState("");

  /*
   * ROUTE PROTECTION
   */
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  /*
   * Validation Logic
   */
  const validate = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email obrigatório";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password obrigatória";
      isValid = false;
    } else if (mode === "register" && password.length < 6) {
      newErrors.password = "Min. 6 caracteres";
      isValid = false;
    }

    if (mode === "register" && !name) {
      newErrors.name = "Nome obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /*
   * Handlers
   */
  const handleAuthSubmit = async () => {
    if (!validate()) {
      showToast("Por favor corrige os erros no formulário.", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(name, email, password);
      router.replace("/(admin)/dashboard");
    } catch (error) {
      console.log("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = () => {
    if (guestCode.length > 2) {
      setGuestModalVisible(false);
      router.push(`/guest/${guestCode.toUpperCase()}`);
      setGuestCode("");
    }
  };

  /*
   * Render
   */
  return (
    <ScreenContainer withScroll={false}>
      <Head>
        <title>Invito - Login</title>
      </Head>
      <KeyboardWrapper>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            justifyContent: "center",
            alignSelf: "center",
            width: "100%",
            maxWidth: 400,
          }}
        >
          {/* Header Section */}
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={{
                width: 100,
                height: 100,
                borderRadius: 22,
                marginBottom: 15,
              }}
            />
            <Text
              variant='headlineMedium'
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              Invito
            </Text>
            <Text
              variant='bodyMedium'
              style={{ color: "gray", textAlign: "center" }}
            >
              Cria eventos inesquecíveis ou confirma a tua presença.
            </Text>
          </View>
          {/* Auth Toggle */}
          <SegmentedButtons
            value={mode}
            onValueChange={(val) => {
              setMode(val);
              setErrors({ name: "", email: "", password: "" });
            }}
            buttons={[
              { value: "login", label: "Entrar" },
              { value: "register", label: "Registar" },
            ]}
            style={{ marginBottom: 20 }}
          />
          {/* Form Section */}
          <View>
            {mode === "register" && (
              <InputGroup errorMsg={errors.name}>
                <TextInput
                  label='Nome'
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  mode='outlined'
                  autoCapitalize='words'
                  error={!!errors.name}
                />
              </InputGroup>
            )}

            <InputGroup errorMsg={errors.email}>
              <TextInput
                label='Email'
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                mode='outlined'
                keyboardType='email-address'
                autoCapitalize='none'
                error={!!errors.email}
              />
            </InputGroup>

            <InputGroup errorMsg={errors.password}>
              <TextInput
                label='Password'
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                mode='outlined'
                secureTextEntry={!showPassword}
                error={!!errors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </InputGroup>

            <Button
              mode='contained'
              onPress={handleAuthSubmit}
              loading={loading}
              style={{ marginTop: 5 }}
            >
              {mode === "login"
                ? "Entrar como Organizador"
                : "Criar Conta Grátis"}
            </Button>
          </View>
          {/* Guest Section */}
          <View style={{ marginTop: 30, alignItems: "center" }}>
            <Text
              variant='bodySmall'
              style={{ color: "gray", marginBottom: 10 }}
            >
              — OU —
            </Text>

            <Button
              mode='outlined'
              icon='ticket-confirmation'
              onPress={() => setGuestModalVisible(true)}
              style={{ width: "100%", borderColor: theme.colors.outline }}
              textColor={theme.colors.secondary}
            >
              Tenho um código de convite
            </Button>
          </View>
        </KeyboardAvoidingView>
      </KeyboardWrapper>
      {/* Guest Modal */}
      <Portal>
        <Modal
          visible={guestModalVisible}
          onDismiss={() => setGuestModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 12,
            maxWidth: 600,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text variant='headlineSmall' style={{ fontWeight: "bold" }}>
              Validar Convite
            </Text>
            <IconButton
              icon='close'
              size={20}
              onPress={() => setGuestModalVisible(false)}
            />
          </View>

          <Text style={{ marginBottom: 15, color: "gray" }}>
            Insere o código de 6 caracteres que recebeste no convite.
          </Text>

          <TextInput
            label='Código (ex: AB12CD)'
            value={guestCode}
            onChangeText={setGuestCode}
            mode='outlined'
            autoCapitalize='characters'
            maxLength={6}
            style={{ marginBottom: 20, fontSize: 18, textAlign: "center" }}
          />

          <Button
            mode='contained'
            onPress={handleGuestSubmit}
            disabled={guestCode.length < 3}
          >
            Aceder ao Evento
          </Button>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
}
