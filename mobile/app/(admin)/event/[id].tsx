import { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  Platform,
  FlatList,
} from "react-native";
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
  Chip,
  IconButton,
  Surface,
  ProgressBar,
  HelperText,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "@/context/ToastContext";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { EventWithDetails } from "@/types/event.types";
import { Guest } from "@/types/guest.types";
import { CustomChip } from "@/components/CustomChip";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const titleOptions = [
  { label: "Sr.", value: "Sr." },
  { label: "Sra.", value: "Sra." },
  { label: "Mn.", value: "Mn." },
  { label: "Mna.", value: "Mna." },
  { label: "Não especificar", value: "" },
];

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const { user } = useAuth();

  const isWeb = width > 768 || Platform.OS === "web";

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    title: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  const [guestFilter, setGuestFilter] = useState<string>("all");
  const [guestSort, setGuestSort] = useState<string>("date_desc");

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        headers: { "user-id": user?.id || "" },
      });
      const data = await res.json();
      if (res.ok) {
        setEvent(data);
      } else {
        showToast(data.error || "Erro ao carregar evento", "error");
        router.back();
      }
    } catch (error) {
      showToast("Erro ao carregar evento:" + error, "error");
      router.back();
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [fetchEvent])
  );

  const handleAddGuest = async () => {
    let isValid = true;
    const newErrors = { name: "", email: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newGuest.name.trim()) {
      newErrors.name = "Nome obrigatório";
      isValid = false;
    }

    if (!newGuest.email.trim()) {
      newErrors.email = "Email obrigatório";
      isValid = false;
    } else if (!emailRegex.test(newGuest.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      showToast("Por favor corrige os erros no formulário", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user?.id || "",
        },
        body: JSON.stringify({
          ...newGuest,
          eventId: id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Convidado adicionado", "success");
        setAddModalVisible(false);
        setNewGuest({ name: "", email: "", title: "" });
        setErrors({ name: "", email: "" });
        fetchEvent();
      } else {
        showToast(data.error || "Erro ao adicionar convidado", "error");
      }
    } catch (error) {
      showToast("Erro ao adicionar convidado:" + error, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = (guest: Guest) => {
    showConfirm({
      title: "Confirmar remoção",
      message: `Tem certeza que deseja remover ${guest.name} da lista de convidados?`,
      confirmText: "Remover",
      cancelText: "Cancelar",
      destructive: true,
      onConfirm: () => confirmDelete(guest.id),
    });
  };

  const confirmDelete = async (guestId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/guests/${guestId}`, {
        method: "DELETE",
        headers: { "user-id": user?.id || "" },
      });

      if (res.ok) {
        showToast("Convidado removido", "success");
        fetchEvent();
      } else {
        const data = await res.json();
        showToast(data.error || "Erro ao remover convidado", "error");
      }
    } catch (error) {
      showToast("Erro ao remover convidado:" + error, "error");
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDeadlineStatus = () => {
    if (!event?.rsvpDeadline) return null;

    const now = new Date().getTime();
    const deadline = new Date(event.rsvpDeadline).getTime();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);

    if (hoursUntil < 0)
      return { text: "Prazo encerrado", color: theme.colors.error };
    if (hoursUntil < 24)
      return { text: `${Math.floor(hoursUntil)}h restantes`, color: "#FFA500" };
    const daysUntil = Math.floor(hoursUntil / 24);
    return { text: `${daysUntil} dias restantes`, color: theme.colors.outline };
  };

  const getFilteredAndSortedGuests = () => {
    if (!event) return [];

    let filtered = [...event.guests];

    if (guestFilter !== "all") {
      filtered = filtered.filter((g) => g.status === guestFilter);
    }

    filtered.sort((a, b) => {
      switch (guestSort) {
        case "date_asc":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "date_desc":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return filtered;
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
            <View style={styles.navbarRight}>
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
          <ActivityIndicator size='large' />
        </View>
      </View>
    );
  }

  if (!event) {
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
            <View style={styles.navbarRight}>
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
          <Text>Evento não encontrado</Text>
        </View>
      </View>
    );
  }

  const deadlineStatus = calculateDeadlineStatus();
  const totalYes = event.guests.filter((g) => g.status === "YES").length;
  const remainingCapacity = event.maxCapacity - totalYes;
  const capacityProgress = totalYes / event.maxCapacity;

  // Check if deadline has passed
  const isDeadlinePassed = event.rsvpDeadline
    ? new Date(event.rsvpDeadline).getTime() < new Date().getTime()
    : false;

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
          <View style={styles.navbarRight}>
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Banner */}
        {event.bannerBase64 && (
          <Image
            source={{ uri: event.bannerBase64 }}
            style={styles.banner}
            resizeMode='cover'
          />
        )}

        <View style={styles.content}>
          {/* Header Info */}
          <Text variant='headlineMedium' style={styles.title}>
            {event.title}
          </Text>

          {event.description && (
            <Text variant='bodyLarge' style={styles.description}>
              {event.description}
            </Text>
          )}

          {/* === MAIN LAYOUT GRID === */}
          <View
            style={[styles.contentGrid, !isWeb && styles.contentGridMobile]}
          >
            {/* --- COLUMN 1 --- */}
            <View style={[styles.columnMeta, isWeb && styles.columnMetaWeb]}>
              <Surface style={styles.cardSurface} elevation={1}>
                {/* Header */}
                <View style={styles.guestHeader}>
                  <Text variant='titleLarge'>Detalhes</Text>
                </View>

                <View style={styles.metadataRow}>
                  <IconButton icon='map-marker' size={20} />
                  <View style={styles.metadataContent}>
                    <Text variant='labelSmall' style={styles.metadataLabel}>
                      Local
                    </Text>
                    <Text variant='bodyMedium'>{event.location}</Text>
                  </View>
                </View>

                <View style={styles.metadataRow}>
                  <IconButton icon='calendar' size={20} />
                  <View style={styles.metadataContent}>
                    <Text variant='labelSmall' style={styles.metadataLabel}>
                      Data e Hora
                    </Text>
                    <Text variant='bodyMedium'>{formatDate(event.date)}</Text>
                  </View>
                </View>

                {event.rsvpDeadline && (
                  <View style={styles.metadataRow}>
                    <IconButton icon='clock-alert-outline' size={20} />
                    <View style={styles.metadataContent}>
                      <Text variant='labelSmall' style={styles.metadataLabel}>
                        Prazo RSVP
                      </Text>
                      <View style={styles.deadlineRow}>
                        <Text variant='bodyMedium'>
                          {formatDate(event.rsvpDeadline)}
                        </Text>
                        {deadlineStatus && (
                          <CustomChip
                            label={deadlineStatus.text}
                            color={deadlineStatus.color}
                            iconSource={"clock-outline"}
                            style={styles.deadlineChip}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.metadataRow}>
                  <IconButton icon='account-group' size={20} />
                  <View style={styles.metadataContent}>
                    <Text variant='labelSmall' style={styles.metadataLabel}>
                      Capacidade
                    </Text>
                    <Text variant='bodyMedium' style={styles.capacityText}>
                      {totalYes} / {event.maxCapacity} confirmados
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

                <View style={styles.metadataRow}>
                  <IconButton icon='calendar-clock' size={20} />
                  <View style={styles.metadataContent}>
                    <Text variant='labelSmall' style={styles.metadataLabel}>
                      Criado em
                    </Text>
                    <Text variant='bodyMedium'>
                      {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              </Surface>
            </View>

            {/* --- COLUMN 2--- */}
            <View
              style={[styles.columnGuests, isWeb && styles.columnGuestsWeb]}
            >
              {/* Wrapped in Surface for the "Card" look */}
              <Surface
                style={isWeb ? styles.cardSurfaceGuestList : styles.cardSurface}
                elevation={1}
              >
                {/* Header */}
                <View style={styles.guestHeader}>
                  <Text variant='titleLarge'>Convidados</Text>
                  <Button
                    mode='contained'
                    icon='plus'
                    onPress={() => {
                      if (isDeadlinePassed) {
                        showToast(
                          "Não é possível adicionar convidados após o prazo RSVP",
                          "error"
                        );
                      } else {
                        setAddModalVisible(true);
                      }
                    }}
                    compact
                    disabled={isDeadlinePassed}
                  >
                    Adicionar
                  </Button>
                </View>

                {/* Filters */}
                <View style={styles.filterSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterChips}>
                      <Chip
                        selected={guestFilter === "all"}
                        onPress={() => setGuestFilter("all")}
                        style={styles.filterChip}
                        showSelectedOverlay
                      >
                        Todos ({event.guests.length})
                      </Chip>
                      <Chip
                        selected={guestFilter === "YES"}
                        onPress={() => setGuestFilter("YES")}
                        style={styles.filterChip}
                        showSelectedOverlay
                      >
                        Confirmados (
                        {event.guests.filter((g) => g.status === "YES").length})
                      </Chip>
                      <Chip
                        selected={guestFilter === "PENDING"}
                        onPress={() => setGuestFilter("PENDING")}
                        style={styles.filterChip}
                        showSelectedOverlay
                      >
                        Pendentes (
                        {
                          event.guests.filter((g) => g.status === "PENDING")
                            .length
                        }
                        )
                      </Chip>
                      <Chip
                        selected={guestFilter === "NO"}
                        onPress={() => setGuestFilter("NO")}
                        style={styles.filterChip}
                        showSelectedOverlay
                      >
                        Não vão (
                        {event.guests.filter((g) => g.status === "NO").length})
                      </Chip>
                    </View>
                  </ScrollView>

                  {/* Sorters */}
                  <View style={{ marginTop: 12 }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.filterChips}>
                        <Chip
                          icon={guestSort === "date_desc" ? "check" : undefined}
                          selected={guestSort === "date_desc"}
                          onPress={() => setGuestSort("date_desc")}
                          style={styles.filterChip}
                        >
                          Recente
                        </Chip>
                        <Chip
                          icon={guestSort === "name_asc" ? "check" : undefined}
                          selected={guestSort === "name_asc"}
                          onPress={() => setGuestSort("name_asc")}
                          style={styles.filterChip}
                        >
                          A-Z
                        </Chip>
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* List - FlatList on web, regular View on mobile */}
                {isWeb ? (
                  <FlatList
                    data={getFilteredAndSortedGuests()}
                    keyExtractor={(item) => item.id}
                    style={styles.guestFlatList}
                    ListEmptyComponent={
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
                    }
                    renderItem={({ item: guest, index }) => (
                      <View
                        style={[
                          styles.guestRow,
                          index !== getFilteredAndSortedGuests().length - 1 &&
                            styles.guestBorder,
                        ]}
                      >
                        <View style={styles.guestInfo}>
                          <View style={styles.guestNameRow}>
                            {guest.title && (
                              <Text
                                variant='labelSmall'
                                style={styles.guestTitle}
                              >
                                {guest.title}
                              </Text>
                            )}
                            <Text variant='bodyLarge' style={styles.guestName}>
                              {guest.name}
                            </Text>
                          </View>
                          <Text
                            variant='bodySmall'
                            style={{ color: theme.colors.outline }}
                          >
                            {guest.email}
                          </Text>
                          <View style={styles.guestMeta}>
                            <CustomChip
                              label={getStatusLabel(guest.status)}
                              color={getStatusColor(guest.status)}
                              iconSource={getStatusIcon(guest.status)}
                              style={styles.statusChip}
                            />
                          </View>
                        </View>
                        <IconButton
                          icon='delete-outline'
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => handleDeleteGuest(guest)}
                        />
                      </View>
                    )}
                  />
                ) : // Mobile: Regular View rendering
                getFilteredAndSortedGuests().length === 0 ? (
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
                  <View>
                    {getFilteredAndSortedGuests().map((guest, index) => (
                      <View
                        key={guest.id}
                        style={[
                          styles.guestRow,
                          index !== getFilteredAndSortedGuests().length - 1 &&
                            styles.guestBorder,
                        ]}
                      >
                        <View style={styles.guestInfo}>
                          <View style={styles.guestNameRow}>
                            {guest.title && (
                              <Text
                                variant='labelSmall'
                                style={styles.guestTitle}
                              >
                                {guest.title}
                              </Text>
                            )}
                            <Text variant='bodyLarge' style={styles.guestName}>
                              {guest.name}
                            </Text>
                          </View>
                          <Text
                            variant='bodySmall'
                            style={{ color: theme.colors.outline }}
                          >
                            {guest.email}
                          </Text>
                          <View style={styles.guestMeta}>
                            <CustomChip
                              label={getStatusLabel(guest.status)}
                              color={getStatusColor(guest.status)}
                              iconSource={getStatusIcon(guest.status)}
                              style={styles.statusChip}
                            />
                          </View>
                        </View>
                        <IconButton
                          icon='delete-outline'
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => handleDeleteGuest(guest)}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </Surface>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Guest Modal */}
      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant='titleLarge' style={styles.modalTitle}>
            Adicionar Convidado
          </Text>

          <Text variant='labelLarge' style={styles.titleLabel}>
            Tratamento
          </Text>
          <View style={styles.titleOptions}>
            {titleOptions.map((option) => (
              <Chip
                key={option.value}
                selected={newGuest.title === option.value}
                onPress={() =>
                  setNewGuest({ ...newGuest, title: option.value })
                }
                style={styles.titleChip}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          <View style={{ marginBottom: 5 }}>
            <TextInput
              label='Nome *'
              value={newGuest.name}
              onChangeText={(text) => {
                setNewGuest({ ...newGuest, name: text });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              mode='outlined'
              style={styles.input}
              error={!!errors.name}
            />
            <View style={{ height: 24, justifyContent: "center" }}>
              {errors.name ? (
                <HelperText
                  type='error'
                  visible={true}
                  style={{ paddingVertical: 0 }}
                >
                  {errors.name}
                </HelperText>
              ) : null}
            </View>
          </View>

          <View style={{ marginBottom: 5 }}>
            <TextInput
              label='Email *'
              value={newGuest.email}
              onChangeText={(text) => {
                setNewGuest({ ...newGuest, email: text });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              mode='outlined'
              keyboardType='email-address'
              autoCapitalize='none'
              style={styles.input}
              error={!!errors.email}
            />
            <View style={{ height: 24, justifyContent: "center" }}>
              {errors.email ? (
                <HelperText
                  type='error'
                  visible={true}
                  style={{ paddingVertical: 0 }}
                >
                  {errors.email}
                </HelperText>
              ) : null}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button onPress={() => setAddModalVisible(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              mode='contained'
              onPress={handleAddGuest}
              loading={saving}
              disabled={saving}
            >
              Adicionar
            </Button>
          </View>
        </Modal>
      </Portal>
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
    justifyContent: "space-between",
  },
  navbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoText: {
    fontWeight: "bold",
  },
  scrollContent: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 20,
    lineHeight: 24,
  },

  /* --- GRID LAYOUT --- */
  contentGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
    marginTop: 10,
  },
  contentGridMobile: {
    flexDirection: "column",
    gap: 20,
  },

  /* --- COLUMNS --- */
  columnMeta: {
    width: "100%",
  },
  columnMetaWeb: {
    flex: 1,
  },

  columnGuests: {
    width: "100%",
  },
  columnGuestsWeb: {
    flex: 2,
    alignSelf: "stretch",
    maxHeight: 500,
  },

  /* --- CARDS --- */
  cardSurface: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
  },
  cardSurfaceGuestList: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  /* --- METADATA STYLES --- */
  metadataRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  metadataContent: {
    flex: 1,
    paddingTop: 8,
    marginLeft: 12,
  },
  metadataLabel: {
    opacity: 0.6,
    marginBottom: 4,
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

  /* --- GUEST LIST STYLES --- */
  guestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  guestFlatList: {
    flex: 1,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
  },
  filterChip: {
    height: 32,
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
    height: "auto",
  },
  guestBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
  statusChip: {
    height: 32,
  },

  /* --- MODAL --- */
  modal: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
  titleLabel: {
    marginBottom: 8,
    marginTop: 4,
  },
  titleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  titleChip: {
    height: 32,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
