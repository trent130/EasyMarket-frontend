"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import type { Message } from "@/types/message";
import DashboardLayout from "@/components/DashboardLayout";
//import { /* fetchMessages, */ sendMessage } from "./actions"; // Import server actions
import { authApi } from '@/services/api/auth';
import { messagesApi } from '@/services/api/messages';
import { myProductsApi } from '@/services/api/my-products';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

interface Message {
    id: string;
    productId: string;
    content: string;
    sender: string;
    timestamp: Date;
}

export default function MessageList() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast()
    const router = useRouter()


    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            setError(null);
            setMessages([])
            try {
              return true;
            } catch (e: any) {
              setError(e.message || "message was error on loading")
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "loadMessages",
              })
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [router]);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center space-x-4 mb-8">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Product Messages</h2>
                </div>

                <div className="space-y-8">
                    {!messages.length && !loading && !error && <p>There are no messages</p>}
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
        </DashboardLayout>
    );
}