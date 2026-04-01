"use client";

import { createEntityStore } from "@/stores/create-entity-store";
import { mockVessels } from "@/mocks/maritime-data";
import type { Vessel } from "@/types";

const store = createEntityStore<Vessel>(
  "harmoniq_vessels",
  mockVessels,
);

export const VesselsProvider = store.Provider;
export const useVesselsStore = store.useStore;
