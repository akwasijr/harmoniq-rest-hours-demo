"use client";

import { createEntityStore } from "@/stores/create-entity-store";
import { mockCrewAssignments } from "@/mocks/maritime-data";
import type { VoyageCrewAssignment } from "@/types";

const store = createEntityStore<VoyageCrewAssignment>(
  "harmoniq_crew_assignments",
  mockCrewAssignments,
);

export const CrewAssignmentsProvider = store.Provider;
export const useCrewAssignmentsStore = store.useStore;
