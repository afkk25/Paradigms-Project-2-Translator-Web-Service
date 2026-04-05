import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { encode as b64encode } from "base-64";

const DEFAULT_ENDPOINT = "http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator";

async function translateText({ endpoint, username, password, text }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization: `Basic ${b64encode(`${username}:${password}`)}`,
    },
    body: text,
  });

  const translated = await response.text();

  if (!response.ok) {
    const err = new Error(response.statusText || "Request failed");
    err.status = response.status;
    err.body = translated;
    throw err;
  }

  return translated;
}

export default function App() {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canTranslate = useMemo(() => {
    return (
      endpoint.trim().length > 0 &&
      username.trim().length > 0 &&
      password.length > 0 &&
      sourceText.trim().length > 0 &&
      !isLoading
    );
  }, [endpoint, username, password, sourceText, isLoading]);

  const onTranslate = async () => {
    setErrorMessage("");
    setTranslatedText("");
    setIsLoading(true);

    try {
      const translated = await translateText({
        endpoint: endpoint.trim(),
        username: username.trim(),
        password,
        text: sourceText.trim(),
      });
      setTranslatedText(translated);
    } catch (error) {
      if (error.status === 401) {
        setErrorMessage("Credentials are wrong. Please check username and password.");
      } else {
        setErrorMessage(
          `Translation failed${error.status ? ` (${error.status})` : ""}. ` +
            "If using a phone/emulator, replace localhost with your machine LAN IP."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Darija Translator</Text>
          <Text style={styles.subtitle}>Mobile client for your existing translation web service.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>API Endpoint</Text>
            <TextInput
              style={styles.input}
              value={endpoint}
              onChangeText={setEndpoint}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://localhost:8080/.../api/translator"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="password"
            />

            <Text style={styles.label}>Text to Translate</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={sourceText}
              onChangeText={setSourceText}
              multiline
              textAlignVertical="top"
              placeholder="Enter text to translate to Darija..."
            />

            <Pressable
              style={[styles.button, !canTranslate && styles.buttonDisabled]}
              onPress={onTranslate}
              disabled={!canTranslate}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Translate</Text>
              )}
            </Pressable>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {translatedText ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Translation</Text>
              <Text style={styles.resultText}>{translatedText}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#111827",
  },
  multilineInput: {
    minHeight: 120,
  },
  button: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  errorBox: {
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    padding: 12,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },
  resultCard: {
    borderRadius: 12,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#67e8f9",
    padding: 14,
    marginBottom: 16,
  },
  resultLabel: {
    fontWeight: "700",
    color: "#0e7490",
    marginBottom: 8,
  },
  resultText: {
    color: "#164e63",
    fontSize: 15,
    lineHeight: 22,
  },
});
