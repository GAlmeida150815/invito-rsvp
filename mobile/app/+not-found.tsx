// mobile/app/+not-found.tsx
// React & Core
import React from "react";

// Third Party
import { Redirect } from "expo-router";

/*
 * Main Component
 */
export default function NotFoundScreen() {
  return <Redirect href='/' />;
}
