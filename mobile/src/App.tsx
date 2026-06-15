/** Expo mobile mirror of the dashboard. Wired to ApiClient. DESKTOP: set
 *  EXPO_PUBLIC_API_URL, `expo start`. Structure + data flow complete. */
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { ApiClient, type AgentStateView, type ConfigView } from "../lib/apiClient";
import { pct, money } from "../lib/format";

const api = new ApiClient(process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080");

export default function App() {
  const [state, setState] = useState<AgentStateView | null>(null);
  const [config, setConfig] = useState<ConfigView | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try { const [s, c] = await Promise.all([api.state(), api.config()]); setState(s); setConfig(c); }
    finally { setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#38bdf8" />}>
        <Text style={styles.h1}>QUANT AGENT</Text>
        <Text style={styles.mode}>{config?.aiMode ?? "—"} {config?.dryRun ? "· dry-run" : "· live"}</Text>
        <Stat label="Equity" value={state ? money(state.state.equity) : "—"} />
        <Stat label="Cumulative PnL" value={state ? money(state.state.cumulativePnl) : "—"} />
        <Stat label="Drawdown" value={state ? pct(state.drawdown) : "—"} />
        <Stat label="Settled" value={state ? String(state.state.settledCount) : "—"} />
        <Stat label="Status" value={state?.state.halted ? "HALTED" : "RUNNING"} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card} testID={`stat-${label}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0e12", paddingHorizontal: 20 },
  h1: { color: "#e6edf3", fontSize: 18, letterSpacing: 3, marginTop: 20, fontWeight: "600" },
  mode: { color: "#7d8da0", marginTop: 4, marginBottom: 20, textTransform: "uppercase" },
  card: { backgroundColor: "#121821", borderColor: "#1e2a36", borderWidth: 1, borderRadius: 10, padding: 18, marginBottom: 12 },
  label: { color: "#7d8da0", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  value: { color: "#e6edf3", fontSize: 24, fontWeight: "600", marginTop: 8 }
});
