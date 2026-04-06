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

function resolveEndpoint(rawEndpoint) {
  const value = rawEndpoint.trim();
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return { endpoint: value, isAdjusted: false };
  }

  const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (!isLoopback) {
    return { endpoint: parsed.toString(), isAdjusted: false };
  }

  if (Platform.OS === "android") {
    parsed.hostname = "10.0.2.2";
    return { endpoint: parsed.toString(), isAdjusted: true };
  }

  return { endpoint: parsed.toString(), isAdjusted: false };
}

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
  const [lastUsedEndpoint, setLastUsedEndpoint] = useState("");

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
    let resolvedEndpointForError = endpoint.trim();

    try {
      const { endpoint: resolvedEndpoint } = resolveEndpoint(endpoint);
      resolvedEndpointForError = resolvedEndpoint;
      setLastUsedEndpoint(resolvedEndpoint);

      const translated = await translateText({
        endpoint: resolvedEndpoint,
        username: username.trim(),
        password,
        text: sourceText.trim(),
      });
      setTranslatedText(translated);
    } catch (error) {
      if (error.status === 401) {
        setErrorMessage("Credentials are wrong. Please check username and password.");
      } else if (error.name === "TypeError") {
        setErrorMessage(
          `Cannot reach API endpoint (${resolvedEndpointForError}). ` +
            (Platform.OS === "web"
              ? "If your backend works in Postman but fails in browser, this is usually CORS. Add Access-Control-Allow-Origin for your Expo web origin and retry."
              : "Check that the host/port is reachable from this app runtime.")
        );
      } else {
        setErrorMessage(
          `Translation failed${error.status ? ` (${error.status})` : ""}. ` +
            `${error.body ? `Server response: ${error.body}` : "Please verify endpoint and server logs."}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    setSourceText("");
    setTranslatedText("");
    setErrorMessage("");
  };

  const statusText = useMemo(() => {
    if (isLoading) return "Translating...";
    if (translatedText) return "Translation complete.";
    return "Ready";
  }, [isLoading, translatedText]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.glowPrimary} />
          <View style={styles.glowAccent} />

          <View style={styles.card}>
            <Text style={styles.eyebrow}>Darija Translator</Text>
            <Text style={styles.title}>Mobile Translation</Text>
            <Text style={styles.subtitle}>Sign in and translate text with your existing API account.</Text>

            <Text style={styles.label}>API Endpoint</Text>
            <TextInput
              style={styles.input}
              value={endpoint}
              onChangeText={setEndpoint}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://localhost:8080/.../api/translator"
              placeholderTextColor="#8aa9a2"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter API username"
              placeholderTextColor="#8aa9a2"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter API password"
              placeholderTextColor="#8aa9a2"
            />

            <Text style={styles.label}>Text to Translate</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={sourceText}
              onChangeText={setSourceText}
              multiline
              textAlignVertical="top"
              placeholder="Enter English text..."
              placeholderTextColor="#8aa9a2"
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!canTranslate || pressed) && styles.primaryButtonMuted,
                !canTranslate && styles.buttonDisabled,
              ]}
              onPress={onTranslate}
              disabled={!canTranslate}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Translate</Text>
              )}
            </Pressable>

            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonMuted]} onPress={onReset}>
              <Text style={styles.secondaryButtonText}>Clear Text</Text>
            </Pressable>

            <Text style={styles.status}>{statusText}</Text>
            {lastUsedEndpoint ? <Text style={styles.endpointHint}>Request URL: {lastUsedEndpoint}</Text> : null}

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Authentication Error</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.resultGroup}>
              <Text style={styles.resultLabel}>Original</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{sourceText.trim() || "No text yet."}</Text>
              </View>
            </View>

            <View style={styles.resultGroup}>
              <Text style={styles.resultLabel}>Darija</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{translatedText || "Your translation will appear here."}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e8f5f2",
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    padding: 18,
    alignItems: "center",
    position: "relative",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#c8e6e0",
    backgroundColor: "#f8fffe",
    shadowColor: "#2d8b9d",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  glowPrimary: {
    position: "absolute",
    top: 10,
    right: 16,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(44, 189, 157, 0.18)",
  },
  glowAccent: {
    position: "absolute",
    bottom: 40,
    left: 6,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(232, 100, 155, 0.14)",
  },
  eyebrow: {
    marginBottom: 6,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#1d9b7f",
    fontWeight: "700",
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    color: "#1d1f24",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#5a8a81",
    marginBottom: 8,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#1d1f24",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4e9e3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#1d1f24",
  },
  multilineInput: {
    minHeight: 120,
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: "#2cbd9d",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#2cbd9d",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonMuted: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: "#e85a9f",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#e85a9f",
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  secondaryButtonMuted: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  status: {
    minHeight: 19,
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#1d9b7f",
  },
  endpointHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#5a8a81",
  },
  errorBox: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#fff4f4",
    borderWidth: 2,
    borderColor: "#f56a6a",
    padding: 12,
  },
  errorTitle: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorText: {
    color: "#5a8a81",
    fontSize: 13,
  },
  resultGroup: {
    marginTop: 12,
  },
  resultLabel: {
    marginBottom: 6,
    fontWeight: "700",
    color: "#1d1f24",
    fontSize: 14,
  },
  resultBox: {
    borderWidth: 1,
    borderColor: "#d4e9e3",
    borderRadius: 11,
    backgroundColor: "rgba(240, 250, 248, 0.6)",
    padding: 12,
    minHeight: 46,
  },
  resultText: {
    color: "#252832",
    fontSize: 15,
    lineHeight: 21,
  },
});
