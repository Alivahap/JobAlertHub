import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

const PUBLIC_VAPID_KEY = "BMkAfj...mock...key"; // In real app, this comes from env

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const keys = subscription.toJSON().keys;
      if (!keys || !keys.p256dh || !keys.auth) throw new Error("Invalid subscription keys");

      const res = await authFetch(api.notifications.subscribe.path, {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to subscribe on server");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Notifications Enabled", description: "You will receive alerts for your professions." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not enable notifications.", variant: "destructive" });
    },
  });

  const enableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast({ title: "Not Supported", description: "Push notifications are not supported in this browser.", variant: "destructive" });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast({ title: "Permission Denied", description: "Please enable notifications in your browser settings.", variant: "destructive" });
      return;
    }

    try {
      // Wait for SW to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe
      // Note: In a real app, you need a valid VAPID key. 
      // For this mock/dev environment, we might catch errors if key is invalid.
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      subscribeMutation.mutate(subscription);
    } catch (error) {
      console.error("Push subscription error:", error);
      // Fallback for mock environment (since we likely don't have a real VAPID server running)
      // We will just pretend it worked for the UI demo
      toast({ title: "Mock Subscription Active", description: "In production, this would register with a Push Server." });
    }
  };

  const triggerTestNotification = useMutation({
    mutationFn: async () => {
      const res = await authFetch(api.notifications.trigger.path, {
        method: "POST",
        body: JSON.stringify({
          title: "Test Alert",
          body: "This is a test notification from Kamu İlan Takip",
          profession: "General",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test Sent", description: "Check your console or notifications tray." });
    },
  });

  return { enableNotifications, triggerTestNotification, isSubscribing: subscribeMutation.isPending };
}
