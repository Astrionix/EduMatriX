"use client"

import { useEffect, useState } from "react";
import { app } from "@/lib/firebase";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { useToast } from "@/components/ui/use-toast";

export function useFcm() {
    const [token, setToken] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const setupFCM = async () => {
            try {
                const supported = await isSupported();
                if (!supported) {
                    console.log("Firebase Messaging not supported in this browser.");
                    return;
                }

                const messaging = getMessaging(app);
                const permission = await Notification.requestPermission();

                if (permission === "granted") {
                    const currentToken = await getToken(messaging, {
                        vapidKey: "BBe5RpBNRlXaJvkQmAiV9epveLJ46NqUoB9GjuF_qOkiLKVwIcgwso8ioFxl0X4Tl9uMnmw6-cqLNjjg8Q1cliM"
                    });

                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        setToken(currentToken);
                    } else {
                        console.log("No registration token available.");
                    }

                    // Foreground message listener
                    onMessage(messaging, (payload) => {
                        console.log("Message received. ", payload);
                        toast({
                            title: payload.notification?.title || "New Message",
                            description: payload.notification?.body || "You have a new notification",
                        });
                    });

                } else {
                    console.log("Unable to get permission to notify.");
                }
            } catch (error) {
                console.log("An error occurred while setting up FCM. ", error);
            }
        };

        setupFCM();
    }, [toast]);

    return { token };
}
