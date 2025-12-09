// mobile/app/(admin)/dashboard.tsx
// React & Core
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Platform,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

// Third Party
import {
  Text,
  Card,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import PagerView from "@/components/native/AdaptivePager";
import { useRouter, useFocusEffect } from "expo-router";
import Head from "expo-router/head";

// Project Imports
import { MobileHeader } from "@/components/ui/MobileHeader";
import { MobileBottomBar } from "@/components/ui/MobileBottomBar";
import { WebSidebar } from "@/components/ui/WebSidebar";
import { FilterBar } from "@/components/FilterBar";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { EventWithDetails } from "@/types/event.types";
import { SortOption, Tab } from "@/types/ui.types";

/*
 * Constants
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TABS: Tab[] = [
  { key: "created", icon: "pencil-box-outline", label: "Criados" },
  { key: "pending", icon: "email-outline", label: "Convites" },
  { key: "going", icon: "check-circle-outline", label: "Vou" },
  { key: "not_going", icon: "close-circle-outline", label: "Não Vou" },
];

/*
 * Main Component
 */
export default function Dashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, signOut, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const pagerRef = useRef<any>(null);

  // Data States
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_asc");

  // Create Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);
  const [capacity, setCapacity] = useState("");
  const [hoursBefore, setHoursBefore] = useState("24");
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<"date" | "time">("date");
  const [showPicker, setShowPicker] = useState(false);

  const isWeb = width > 768 || Platform.OS === "web";

  /*
   * ROUTE PROTECTION
   */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  /*
   * Logic: Fetching
   */
  const fetchEvents = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/events?userId=${user.id}&email=${user.email}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      showToast(`Erro ao carregar eventos: ${error}`, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  /*
   * Logic: Filtering & Sorting
   */
  const getProcessedEvents = (tabKey: string) => {
    if (!user) return [];

    let result = events.filter((e) => {
      if (tabKey === "created") return e.organizerId === user.id;
      const myGuestEntry = e.guests.find((g) => g.email === user.email);
      if (tabKey === "going") return myGuestEntry?.status === "YES";
      if (tabKey === "not_going") return myGuestEntry?.status === "NO";
      if (tabKey === "pending")
        return (
          myGuestEntry?.status === "PENDING" || myGuestEntry?.status === "MAYBE"
        );
      return false;
    });

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          (e.location && e.location.toLowerCase().includes(lowerQuery))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      switch (sortBy) {
        case "date_asc":
          return dateA - dateB;
        case "date_desc":
          return dateB - dateA;
        case "alpha_asc":
          return a.title.localeCompare(b.title);
        case "alpha_desc":
          return b.title.localeCompare(a.title);
        case "capacity_asc":
          return a.maxCapacity - b.maxCapacity;
        case "capacity_desc":
          return b.maxCapacity - a.maxCapacity;
        default:
          return 0;
      }
    });

    return result;
  };

  // Calculate pending count for badge
  const pendingCount = getProcessedEvents("pending").length;

  // Create tabs array with badge
  const tabsWithBadges = TABS.map((tab) =>
    tab.key === "pending" ? { ...tab, badge: pendingCount } : tab
  );

  /*
   * Logic: Actions
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Precisamos de permissão para aceder à galeria", "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setBannerBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !capacity || !hoursBefore) {
      showToast("Preenche os campos obrigatórios", "error");
      return;
    }
    setSubmitting(true);
    try {
      const deadline = new Date(date);
      deadline.setHours(deadline.getHours() - Number(hoursBefore));

      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          bannerBase64,
          date: date.toISOString(),
          rsvpDeadline: deadline.toISOString(),
          maxCapacity: Number(capacity),
          organizerId: user?.id,
        }),
      });

      if (response.ok) {
        showToast("Evento criado!", "success");
        setModalVisible(false);
        resetForm();
        fetchEvents();
      } else {
        showToast("Erro ao criar evento", "error");
      }
    } catch (e) {
      showToast(`Erro de conexão: ${e}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setBannerBase64(null);
    setCapacity("");
    setHoursBefore("24");
    setDate(new Date());
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === "android") setShowPicker(false);
    setDate(currentDate);
  };

  /*
   * Renderers
   */
  const renderEventCard = ({ item }: { item: EventWithDetails }) => {
    const isCreatedByMe = item.organizerId === user?.id;
    const myGuestEntry = item.guests.find((g) => g.email === user?.email);

    return (
      <EventCard
        item={item}
        currentUserId={user?.id}
        onPress={(id) => {
          if (isCreatedByMe) {
            // @ts-ignore - Dynamic route parameter
            router.push(`/(admin)/event/${id}`);
          } else {
            if (myGuestEntry?.inviteCode) {
              // @ts-ignore - Dynamic route parameter
              router.push(`/guest/${myGuestEntry.inviteCode}`);
            }
          }
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Head>
        <title>Invito - Dashboard</title>
      </Head>

      <View
        style={{
          flex: 1,
          flexDirection: isWeb ? "row" : "column",
          width: "100%",
        }}
      >
        {/* Desktop Sidebar */}
        {isWeb && (
          <WebSidebar
            userName={user?.name}
            userEmail={user?.email}
            tabs={tabsWithBadges}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            onLogout={() => {
              signOut();
              router.replace("/");
            }}
          />
        )}

        {/* Content Area */}
        <View style={{ flex: 1 }}>
          {!isWeb && (
            <MobileHeader
              userName={user?.name}
              onLogout={() => {
                signOut();
                router.replace("/");
              }}
            />
          )}

          {/* === FILTER BAR COMPONENT === */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <ActivityIndicator animating={true} style={{ marginTop: 50 }} />
          ) : isWeb ? (
            // WEB LIST
            <FlatList
              data={getProcessedEvents(TABS[activeTab].key)}
              keyExtractor={(item) => item.id}
              renderItem={renderEventCard}
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchEvents}
                />
              }
              contentContainerStyle={{ padding: 20 }}
              numColumns={width > 1400 ? 3 : width > 1000 ? 2 : 1}
              key={width > 1400 ? "3col" : width > 1000 ? "2col" : "1col"}
              columnWrapperStyle={
                width > 1000 ? { gap: 16, marginBottom: 0 } : undefined
              }
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", marginTop: 20, color: "gray" }}
                >
                  {searchQuery ? "Nenhum evento encontrado." : "Sem eventos."}
                </Text>
              }
            />
          ) : (
            // MOBILE SWIPE
            <PagerView
              ref={pagerRef}
              style={{ flex: 1 }}
              initialPage={0}
              onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
            >
              {TABS.map((tab) => (
                <View key={tab.key} style={{ flex: 1 }}>
                  <FlatList
                    data={getProcessedEvents(tab.key)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventCard}
                    scrollEventThrottle={16}
                    removeClippedSubviews={true}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchEvents}
                      />
                    }
                    ListEmptyComponent={
                      <Text
                        style={{
                          textAlign: "center",
                          marginTop: 20,
                          color: "gray",
                        }}
                      >
                        {searchQuery
                          ? "Nenhum evento encontrado."
                          : "Sem eventos."}
                      </Text>
                    }
                  />
                </View>
              ))}
            </PagerView>
          )}
        </View>
      </View>

      {!isWeb && (
        <MobileBottomBar
          tabs={tabsWithBadges}
          activeTab={activeTab}
          onTabPress={(index) => {
            setActiveTab(index);
            pagerRef.current?.setPage(index);
          }}
        />
      )}

      <FAB
        icon='plus'
        style={[styles.fab, { bottom: isWeb ? 30 : 90 }]}
        color='white'
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text
              variant='headlineSmall'
              style={{ marginBottom: 20, fontWeight: "bold" }}
            >
              Novo Evento
            </Text>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {bannerBase64 ? (
                <Card.Cover
                  source={{ uri: bannerBase64 }}
                  style={{ height: 150, width: "100%", borderRadius: 0 }}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconButton icon='camera' size={40} />
                  <Text>Adicionar Banner</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              label='Título *'
              value={title}
              onChangeText={setTitle}
              mode='outlined'
              style={{ marginBottom: 10 }}
            />
            <TextInput
              label='Descrição'
              value={description}
              onChangeText={setDescription}
              mode='outlined'
              multiline
              numberOfLines={3}
              style={{ marginBottom: 10 }}
            />
            <TextInput
              label='Localização'
              value={location}
              onChangeText={setLocation}
              mode='outlined'
              right={<TextInput.Icon icon='map-marker' />}
              style={{ marginBottom: 10 }}
            />

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => {
                    setMode("date");
                    setShowPicker(true);
                  }}
                >
                  <TextInput
                    label='Data'
                    value={date.toLocaleDateString()}
                    mode='outlined'
                    editable={false}
                    right={<TextInput.Icon icon='calendar' />}
                    style={{ pointerEvents: "none" }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => {
                    setMode("time");
                    setShowPicker(true);
                  }}
                >
                  <TextInput
                    label='Hora'
                    value={date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    mode='outlined'
                    editable={false}
                    right={<TextInput.Icon icon='clock' />}
                    style={{ pointerEvents: "none" }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode={mode}
                display='default'
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            <TextInput
              label='Prazo de Resposta (Horas antes)'
              value={hoursBefore}
              onChangeText={setHoursBefore}
              mode='outlined'
              keyboardType='numeric'
              style={{ marginBottom: 20 }}
            />
            <TextInput
              label='Capacidade *'
              value={capacity}
              onChangeText={setCapacity}
              keyboardType='numeric'
              mode='outlined'
              style={{ marginBottom: 20 }}
            />

            <Button
              mode='contained'
              onPress={handleCreateEvent}
              loading={submitting}
            >
              Criar Evento
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    maxHeight: "90%",
  },
  imagePicker: {
    height: 150,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
});
