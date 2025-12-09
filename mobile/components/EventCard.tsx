// mobile/components/EventCard.tsx

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Text,
  Button,
  ProgressBar,
  useTheme,
  Icon,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { Event } from "@/types/event.types";

type EventCardProps = {
  item: Event & {
    organizer: { name: string };
    bannerBase64?: string;
    description?: string;
    guests?: any[];
    rsvpDeadline?: string;
  };
  currentUserId?: string;
  onPress?: (id: string) => void;
};

export function EventCard({ item, currentUserId, onPress }: EventCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(item.id);
    } else {
      // @ts-ignore - Dynamic route parameter
      router.push(`/(admin)/event/${item.id}`);
    }
  };

  // 1. Basic Date Formatting
  const eventDate = new Date(item.date);
  const day = eventDate.getDate();
  const month = eventDate
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const time = eventDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalSpots = item.maxCapacity || 0;
  const takenSpots = item.guests
    ? item.guests.filter((g: any) => g.status === "YES").length
    : 0;
  const progress = totalSpots > 0 ? takenSpots / totalSpots : 0;
  const spotsLeft = totalSpots - takenSpots;

  const getDeadlineStatus = () => {
    if (!item.rsvpDeadline) return null;

    const now = new Date();
    const deadline = new Date(item.rsvpDeadline);
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        label: "Inscrições Encerradas",
        color: theme.colors.error,
        icon: "lock",
      };
    }

    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);

    if (hoursLeft < 24) {
      return {
        label: `Encerra em ${hoursLeft}h`,
        color: "#F59E0B",
        icon: "clock-alert-outline",
      };
    }

    // Normal (> 1 day)
    return {
      label: `Encerra em ${daysLeft} dias`,
      color: "gray",
      icon: "calendar-clock",
    };
  };

  const deadlineInfo = getDeadlineStatus();

  return (
    <Card mode='elevated' style={styles.card} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{
            uri:
              item.bannerBase64 ||
              `https://ui-avatars.com/api/?name=${item.title}&background=random&size=512`,
          }}
          style={styles.cover}
        />
        {/* Floating Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
      </View>

      <Card.Content style={styles.content}>
        {/* Title & Organizer */}
        <View style={styles.header}>
          <Text variant='titleMedium' style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.organizerId !== currentUserId && (
            <Text variant='bodySmall' style={styles.organizer}>
              por {item.organizer.name}
            </Text>
          )}
        </View>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon source='clock-outline' size={16} color='gray' />
            <Text variant='bodySmall' style={styles.metaText}>
              {time}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon source='map-marker-outline' size={16} color='gray' />
            <Text variant='bodySmall' style={styles.metaText} numberOfLines={1}>
              {item.location || "Online"}
            </Text>
          </View>
        </View>

        {/* Capacity & Deadline Section */}
        <View style={styles.capacityContainer}>
          {/* NEW: RSVP Deadline Indicator */}
          {deadlineInfo && (
            <View style={styles.deadlineRow}>
              <Icon
                source={deadlineInfo.icon}
                size={14}
                color={deadlineInfo.color}
              />
              <Text
                variant='labelSmall'
                style={{ color: deadlineInfo.color, fontWeight: "600" }}
              >
                {deadlineInfo.label}
              </Text>
            </View>
          )}

          <View style={styles.capacityHeader}>
            <Text variant='labelSmall' style={{ color: theme.colors.primary }}>
              {spotsLeft > 0 ? `${spotsLeft} vagas restantes` : "Esgotado"}
            </Text>
            <Text variant='labelSmall' style={{ color: "gray" }}>
              {takenSpots}/{totalSpots}
            </Text>
          </View>

          <ProgressBar
            progress={progress}
            color={spotsLeft === 0 ? theme.colors.error : theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button mode='text' compact onPress={handlePress}>
          Ver Detalhes
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
    minWidth: 300,
  },
  imageContainer: {
    position: "relative",
  },
  cover: {
    height: 150,
    borderRadius: 0,
  },
  dateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  content: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  organizer: {
    color: "gray",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12, // Reduced margin to fit deadline closer
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    color: "#555",
  },
  capacityContainer: {
    marginTop: 4,
    backgroundColor: "#f9f9f9", // Slight background to group stats
    padding: 8,
    borderRadius: 8,
  },
  // New Styles for Deadline
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  actions: {
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 4,
  },
});
