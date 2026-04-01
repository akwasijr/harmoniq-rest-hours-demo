"use client";

import { createEntityStore } from "@/stores/create-entity-store";
import { mockRestHoursRecords } from "@/mocks/maritime-data";
import type { RestHoursRecord } from "@/types";

const store = createEntityStore<RestHoursRecord>(
  "harmoniq_rest_hours_records_v8",
  mockRestHoursRecords,
);

export const RestHoursRecordsProvider = store.Provider;
export const useRestHoursRecordsStore = store.useStore;
