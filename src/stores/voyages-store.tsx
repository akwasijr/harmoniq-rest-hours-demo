"use client";

import { createEntityStore } from "@/stores/create-entity-store";
import { mockVoyages } from "@/mocks/maritime-data";
import type { Voyage } from "@/types";

const store = createEntityStore<Voyage>(
  "harmoniq_voyages",
  mockVoyages,
);

export const VoyagesProvider = store.Provider;
export const useVoyagesStore = store.useStore;
