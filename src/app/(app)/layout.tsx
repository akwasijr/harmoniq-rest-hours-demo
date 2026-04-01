import { AuthProvider } from "@/hooks/use-auth";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "sonner";
import { NetworkStatusProvider } from "@/components/shared/network-status";
import { AppDataProvider } from "@/stores/app-data-provider";
import { SyncProvider } from "@/hooks/use-sync";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { AnalyticsTracker } from "@/components/marketing/analytics-tracker";
import { I18nProvider } from "@/i18n";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <AppDataProvider>
        <Toaster richColors position="top-right" />
        <AuthProvider>
          <SyncProvider>
            <ToastProvider>
              <NetworkStatusProvider>
                <OfflineIndicator />
                {children}
                <AnalyticsTracker />
              </NetworkStatusProvider>
            </ToastProvider>
          </SyncProvider>
        </AuthProvider>
      </AppDataProvider>
    </I18nProvider>
  );
}
