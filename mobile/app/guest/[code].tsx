// mobile/app/guest/[code].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Chip,
  useTheme,
  Divider,
  Surface,
  IconButton,
  ProgressBar,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Head from "expo-router/head";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { EventWithDetails } from "@/types/event.types";
import { Guest } from "@/types/guest.types";
import { CustomChip } from "@/components/CustomChip";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type GuestWithEvent = Guest & { event: EventWithDetails };

export default function GuestRSVP() {
  const { code } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [guestData, setGuestData] = useState<GuestWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [guestFilter, setGuestFilter] = useState<string>("all");

  // 1. Validar Código ao carregar
  useEffect(() => {
    if (!code) return;

    fetch(`${API_URL}/api/guests/rsvp/${code}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Código inválido");
        return res.json();
      })
      .then((data) => setGuestData(data))
      .catch(() => {
        showToast("Código de convite inválido ou expirado", "error");
        router.replace("/");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // 2. Enviar Resposta (RSVP)
  const handleRSVP = async (status: "YES" | "NO" | "MAYBE") => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/guests/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: code,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Erro ao atualizar", "error");
      } else {
        // Atualizar estado do convidado e recalcular lista
        setGuestData((prev) => {
          if (!prev) return null;

          // Atualizar o status do convidado atual
          const updatedGuests = prev.event.guests.map((g) =>
            g.id === prev.id ? { ...g, status: status } : g
          );

          return {
            ...prev,
            status: status,
            event: {
              ...prev.event,
              guests: updatedGuests,
            },
          };
        });

        if (status === "YES") {
          showToast("A tua presença foi confirmada!", "success");
        } else if (status === "NO") {
          showToast(
            "Resposta registada. Esperamos ver-te numa próxima!",
            "info"
          );
        } else {
          showToast("Resposta registada como talvez", "info");
        }
      }
    } catch (error) {
      showToast("Falha na conexão: " + error, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Navbar */}
        <Surface style={styles.navbar} elevation={2}>
          <View style={styles.navbarContent}>
            {user && (
              <IconButton
                icon='arrow-left'
                size={24}
                onPress={() => router.push("/(admin)/dashboard")}
              />
            )}
            <View style={styles.navbarCenter}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
              />
              <Text
                variant='titleLarge'
                style={[styles.logoText, { color: theme.colors.primary }]}
              >
                Invito
              </Text>
            </View>
          </View>
        </Surface>

        <View style={styles.centered}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={{ marginTop: 20 }}>A validar convite...</Text>
        </View>
      </View>
    );
  }

  if (!guestData) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "YES":
        return theme.colors.primary;
      case "NO":
        return theme.colors.error;
      case "MAYBE":
        return "#FFA500";
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "YES":
        return "check-circle";
      case "NO":
        return "close-circle";
      case "MAYBE":
        return "help-circle";
      default:
        return "clock-outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "YES":
        return "Confirmado";
      case "NO":
        return "Não vai";
      case "MAYBE":
        return "Talvez";
      default:
        return "Pendente";
    }
  };

  const formatCreatedDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDeadlineStatus = () => {
    if (!guestData?.event.rsvpDeadline) return null;

    const now = new Date().getTime();
    const deadline = new Date(guestData.event.rsvpDeadline).getTime();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);

    if (hoursUntil < 0)
      return { text: "Prazo encerrado", color: theme.colors.error };
    if (hoursUntil < 24)
      return {
        text: `${Math.floor(hoursUntil)}h restantes`,
        color: "#FFA500",
      };
    const daysUntil = Math.floor(hoursUntil / 24);
    return { text: `${daysUntil} dias restantes`, color: theme.colors.outline };
  };

  const getFilteredGuests = () => {
    if (!guestData?.event.guests) return [];

    let filtered = [...guestData.event.guests];

    if (guestFilter !== "all") {
      filtered = filtered.filter((g) => g.status === guestFilter);
    }

    return filtered;
  };

  if (!guestData) return null;

  const totalYes =
    guestData.event.guests?.filter((g) => g.status === "YES").length || 0;
  const totalNo =
    guestData.event.guests?.filter((g) => g.status === "NO").length || 0;
  const totalMaybe =
    guestData.event.guests?.filter((g) => g.status === "MAYBE").length || 0;
  const totalPending =
    guestData.event.guests?.filter((g) => g.status === "PENDING").length || 0;
  const remainingCapacity = guestData.event.maxCapacity - totalYes;
  const capacityProgress = totalYes / guestData.event.maxCapacity;
  const deadlineStatus = calculateDeadlineStatus();

  // Calcular se a capacidade está cheia
  const isFull = totalYes >= guestData.event.maxCapacity;

  const isDeadlinePassed = guestData.event.rsvpDeadline
    ? new Date(guestData.event.rsvpDeadline).getTime() < new Date().getTime()
    : false;

  return (
    <View style={styles.container}>
      <Head>
        <title>Invito - {guestData.event.title}</title>
      </Head>

      {/* Navbar */}
      <Surface style={styles.navbar} elevation={2}>
        <View style={styles.navbarContent}>
          {user && (
            <IconButton
              icon='arrow-left'
              size={24}
              onPress={() => router.push("/(admin)/dashboard")}
            />
          )}
          <View style={styles.navbarCenter}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
            />
            <Text
              variant='titleLarge'
              style={[styles.logoText, { color: theme.colors.primary }]}
            >
              Invito
            </Text>
          </View>
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Banner */}
        {guestData.event.bannerBase64 && (
          <Image
            source={{ uri: guestData.event.bannerBase64 }}
            style={styles.banner}
            resizeMode='cover'
          />
        )}

        <View style={styles.content}>
          {/* Event Title */}
          <Text variant='headlineMedium' style={styles.title}>
            {guestData.event.title}
          </Text>

          {guestData.event.description && (
            <Text variant='bodyLarge' style={styles.description}>
              {guestData.event.description}
            </Text>
          )}

          {/* Event Details Card */}
          <Surface style={styles.card} elevation={1}>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Detalhes do Evento
            </Text>

            <View style={styles.detailRow}>
              <IconButton icon='map-marker' size={20} />
              <View style={styles.detailContent}>
                <Text variant='labelSmall' style={styles.detailLabel}>
                  Local
                </Text>
                <Text variant='bodyMedium'>{guestData.event.location}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <IconButton icon='calendar' size={20} />
              <View style={styles.detailContent}>
                <Text variant='labelSmall' style={styles.detailLabel}>
                  Data e Hora
                </Text>
                <Text variant='bodyMedium'>
                  {formatDate(guestData.event.date)}
                </Text>
              </View>
            </View>

            {guestData.event.rsvpDeadline && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <IconButton icon='clock-alert-outline' size={20} />
                  <View style={styles.detailContent}>
                    <Text variant='labelSmall' style={styles.detailLabel}>
                      Prazo RSVP
                    </Text>
                    <View style={styles.deadlineRow}>
                      <Text variant='bodyMedium'>
                        {formatDate(guestData.event.rsvpDeadline)}
                      </Text>
                      {deadlineStatus && (
                        <CustomChip
                          label={deadlineStatus.text}
                          color={deadlineStatus.color}
                          iconSource='clock-outline'
                          style={styles.deadlineChip}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <IconButton icon='account-group' size={20} />
              <View style={styles.detailContent}>
                <Text variant='labelSmall' style={styles.detailLabel}>
                  Capacidade
                </Text>
                <Text variant='bodyMedium' style={styles.capacityText}>
                  {totalYes} / {guestData.event.maxCapacity} confirmados
                </Text>
                <ProgressBar
                  progress={capacityProgress}
                  color={
                    capacityProgress >= 0.9
                      ? theme.colors.error
                      : capacityProgress >= 0.7
                      ? "#FFA500"
                      : theme.colors.primary
                  }
                  style={styles.progressBar}
                />
                {remainingCapacity > 0 && (
                  <Text
                    variant='labelSmall'
                    style={[
                      styles.remainingText,
                      {
                        color:
                          remainingCapacity <= 5
                            ? theme.colors.error
                            : theme.colors.outline,
                      },
                    ]}
                  >
                    {remainingCapacity} vagas restantes
                  </Text>
                )}
              </View>
            </View>

            {guestData.event.organizer?.name && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <IconButton icon='account' size={20} />
                  <View style={styles.detailContent}>
                    <Text variant='labelSmall' style={styles.detailLabel}>
                      Organizador
                    </Text>
                    <Text variant='bodyMedium'>
                      {guestData.event.organizer.name}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Surface>

          {/* Guest Status Card */}
          <Surface style={styles.card} elevation={1}>
            <Text variant='titleMedium' style={styles.cardTitle}>
              Olá, {guestData.title && `${guestData.title} `}
              {guestData.name}!
            </Text>
            <Text variant='bodyMedium' style={styles.inviteMessage}>
              Foste convidado(a) para este evento exclusivo. Por favor confirma
              a tua presença.
            </Text>

            <Divider style={styles.divider} />

            <View style={styles.statusSection}>
              <Text variant='labelLarge' style={styles.statusLabel}>
                O teu estado atual:
              </Text>
              <CustomChip
                label={getStatusLabel(guestData.status)}
                color={getStatusColor(guestData.status)}
                iconSource={getStatusIcon(guestData.status)}
                style={styles.guestStatusChip}
              />
            </View>
          </Surface>

          {/* Action Buttons or Deadline Message */}
          {isDeadlinePassed ? (
            <Surface style={styles.deadlinePassedCard} elevation={1}>
              <IconButton icon='clock-alert' size={32} iconColor='#c62828' />
              <View style={styles.deadlinePassedContent}>
                <Text variant='titleMedium' style={styles.deadlinePassedTitle}>
                  Prazo de resposta encerrado
                </Text>
                <Text variant='bodyMedium' style={styles.deadlinePassedText}>
                  O prazo para responder a este convite já expirou. Já não é
                  possível alterar a tua resposta.
                </Text>
                {guestData.status !== "PENDING" && (
                  <View style={{ marginTop: 12 }}>
                    <Text variant='bodySmall' style={{ color: "#666" }}>
                      A tua resposta atual é:{" "}
                      <Text
                        style={{
                          fontWeight: "600",
                          color:
                            getStatusColor(guestData.status) === "#e8f5e9"
                              ? "#2e7d32"
                              : getStatusColor(guestData.status) === "#ffebee"
                              ? "#c62828"
                              : "#f57c00",
                        }}
                      >
                        {getStatusLabel(guestData.status)}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>
            </Surface>
          ) : isFull && guestData.status !== "YES" ? (
            <Surface style={styles.capacityFullCard} elevation={1}>
              <IconButton
                icon='account-group-outline'
                size={32}
                iconColor='#f57c00'
              />
              <View style={styles.capacityFullContent}>
                <Text variant='titleMedium' style={styles.capacityFullTitle}>
                  Capacidade máxima atingida
                </Text>
                <Text variant='bodyMedium' style={styles.capacityFullText}>
                  Este evento já atingiu a sua capacidade máxima de{" "}
                  {guestData.event.maxCapacity} confirmações. Já não é possível
                  confirmar presença.
                </Text>
                <View style={{ marginTop: 12 }}>
                  <Text variant='bodySmall' style={{ color: "#666" }}>
                    {`Podes responder "Talvez" ou "Não posso ir" se quiseres
                    atualizar o teu estado.`}
                  </Text>
                </View>
              </View>
            </Surface>
          ) : (
            <View style={styles.actionButtons}>
              <Button
                mode={guestData.status === "YES" ? "contained" : "outlined"}
                icon='check-circle'
                onPress={() => handleRSVP("YES")}
                loading={updating}
                disabled={(isFull && guestData.status !== "YES") || updating}
                style={[
                  styles.actionButton,
                  { borderColor: theme.colors.primary },
                ]}
                contentStyle={styles.buttonContent}
              >
                Vou! (Confirmar)
              </Button>

              <Button
                mode={guestData.status === "MAYBE" ? "contained" : "outlined"}
                icon='help-circle'
                onPress={() => handleRSVP("MAYBE")}
                loading={updating}
                disabled={updating}
                buttonColor={
                  guestData.status === "MAYBE" ? "#ff9800" : undefined
                }
                textColor={guestData.status === "MAYBE" ? "white" : "#ff9800"}
                style={[styles.actionButton, { borderColor: "#ff9800" }]}
                contentStyle={styles.buttonContent}
              >
                Talvez
              </Button>

              <Button
                mode={guestData.status === "NO" ? "contained" : "outlined"}
                icon='close-circle'
                onPress={() => handleRSVP("NO")}
                loading={updating}
                disabled={updating}
                buttonColor={guestData.status === "NO" ? "#f44336" : undefined}
                textColor={guestData.status === "NO" ? "white" : "#f44336"}
                style={[styles.actionButton, { borderColor: "#f44336" }]}
                contentStyle={styles.buttonContent}
              >
                Não posso ir
              </Button>
            </View>
          )}

          {/* Capacity Warning - Only show if deadline not passed and capacity full */}
          {!isDeadlinePassed && isFull && guestData.status !== "YES" && (
            <View style={styles.actionButtons}>
              <Button
                mode={guestData.status === "MAYBE" ? "contained" : "outlined"}
                icon='help-circle'
                onPress={() => handleRSVP("MAYBE")}
                loading={updating}
                disabled={updating}
                buttonColor={
                  guestData.status === "MAYBE" ? "#ff9800" : undefined
                }
                textColor={guestData.status === "MAYBE" ? "white" : "#ff9800"}
                style={[styles.actionButton, { borderColor: "#ff9800" }]}
                contentStyle={styles.buttonContent}
              >
                Talvez
              </Button>

              <Button
                mode={guestData.status === "NO" ? "contained" : "outlined"}
                icon='close-circle'
                onPress={() => handleRSVP("NO")}
                loading={updating}
                disabled={updating}
                buttonColor={guestData.status === "NO" ? "#f44336" : undefined}
                textColor={guestData.status === "NO" ? "white" : "#f44336"}
                style={[styles.actionButton, { borderColor: "#f44336" }]}
                contentStyle={styles.buttonContent}
              >
                Não posso ir
              </Button>
            </View>
          )}

          {/* Guest List */}
          <Surface style={styles.card} elevation={1}>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Lista de Convidados ({guestData.event.guests?.length || 0})
            </Text>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                <Chip
                  selected={guestFilter === "all"}
                  onPress={() => setGuestFilter("all")}
                  style={styles.filterChip}
                  showSelectedOverlay
                >
                  Todos ({guestData.event.guests?.length || 0})
                </Chip>
                <Chip
                  selected={guestFilter === "YES"}
                  onPress={() => setGuestFilter("YES")}
                  style={styles.filterChip}
                  showSelectedOverlay
                >
                  Confirmados ({totalYes})
                </Chip>
                <Chip
                  selected={guestFilter === "PENDING"}
                  onPress={() => setGuestFilter("PENDING")}
                  style={styles.filterChip}
                  showSelectedOverlay
                >
                  Pendentes ({totalPending})
                </Chip>
                <Chip
                  selected={guestFilter === "MAYBE"}
                  onPress={() => setGuestFilter("MAYBE")}
                  style={styles.filterChip}
                  showSelectedOverlay
                >
                  Talvez ({totalMaybe})
                </Chip>
                <Chip
                  selected={guestFilter === "NO"}
                  onPress={() => setGuestFilter("NO")}
                  style={styles.filterChip}
                  showSelectedOverlay
                >
                  Não vão ({totalNo})
                </Chip>
              </View>
            </ScrollView>

            {/* Guest List */}
            <View style={styles.guestListContainer}>
              {getFilteredGuests().length === 0 ? (
                <View style={styles.emptyState}>
                  <Text
                    variant='bodyMedium'
                    style={{ color: theme.colors.outline }}
                  >
                    {guestFilter === "all"
                      ? "Nenhum convidado ainda"
                      : "Nenhum convidado neste filtro"}
                  </Text>
                </View>
              ) : (
                getFilteredGuests().map((guest, index) => (
                  <View
                    key={guest.id}
                    style={[
                      styles.guestRow,
                      index !== getFilteredGuests().length - 1 &&
                        styles.guestBorder,
                      guest.id === guestData.id && styles.currentGuestRow,
                    ]}
                  >
                    <View style={styles.guestInfo}>
                      <View style={styles.guestNameRow}>
                        {guest.title && (
                          <Text variant='bodyMedium' style={styles.guestTitle}>
                            {guest.title}
                          </Text>
                        )}
                        <Text variant='bodyLarge' style={styles.guestName}>
                          {guest.name}
                          {guest.id === guestData.id && " (Tu)"}
                        </Text>
                      </View>
                      <View style={styles.guestMeta}>
                        <CustomChip
                          label={getStatusLabel(guest.status)}
                          color={getStatusColor(guest.status)}
                          iconSource={getStatusIcon(guest.status)}
                          style={styles.guestStatusChip}
                        />
                        {guest.createdAt && (
                          <Text
                            variant='bodySmall'
                            style={{ color: theme.colors.outline }}
                          >
                            Convidado em {formatCreatedDate(guest.createdAt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Surface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  navbar: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  navbarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navbarCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
    marginRight: "auto",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoText: {
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  banner: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    marginBottom: 20,
    lineHeight: 24,
    textAlign: "center",
    color: "#666",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  inviteMessage: {
    color: "#666",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  detailContent: {
    flex: 1,
    paddingTop: 8,
    marginLeft: 12,
  },
  detailLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  statusSection: {
    alignItems: "center",
    paddingTop: 8,
  },
  statusLabel: {
    marginBottom: 12,
  },
  statusChip: {
    height: 32,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  deadlineChip: {
    height: 28,
  },
  capacityText: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  remainingText: {
    marginTop: 4,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  filterChip: {
    height: 32,
  },
  guestListContainer: {
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    borderRadius: 12,
  },
  guestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  guestBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  currentGuestRow: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginHorizontal: -4,
  },
  guestInfo: {
    flex: 1,
    gap: 2,
  },
  guestNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  guestTitle: {
    opacity: 0.6,
  },
  guestName: {
    fontWeight: "600",
  },
  guestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  guestStatusChip: {
    height: 32,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    color: "#c62828",
    lineHeight: 20,
  },
  deadlinePassedCard: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#ffebee",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  deadlinePassedContent: {
    flex: 1,
  },
  deadlinePassedTitle: {
    color: "#c62828",
    fontWeight: "600",
    marginBottom: 8,
  },
  deadlinePassedText: {
    color: "#c62828",
    lineHeight: 22,
  },
  capacityFullCard: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff3e0",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  capacityFullContent: {
    flex: 1,
  },
  capacityFullTitle: {
    color: "#e65100",
    fontWeight: "600",
    marginBottom: 8,
  },
  capacityFullText: {
    color: "#e65100",
    lineHeight: 22,
  },
});
