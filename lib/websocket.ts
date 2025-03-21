import pako from 'pako';

export enum WebSocketMessageType {
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    NOTIFICATION = 'NOTIFICATION',
    ORDER_UPDATE = 'ORDER_UPDATE',
    PRODUCT_UPDATE = 'PRODUCT_UPDATE',
    USER_STATUS = 'USER_STATUS',
    HEARTBEAT = 'HEARTBEAT',
    BATCH = 'BATCH'
}

export enum WebSocketErrorType {
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    MESSAGE_ERROR = 'MESSAGE_ERROR',
    COMPRESSION_ERROR = 'COMPRESSION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
}

interface WebSocketMessage<T = unknown> {
    type: WebSocketMessageType;
    payload: T;
    timestamp: string;
    compressed?: boolean;
}

interface WebSocketOptions {
    url: string;
    compression?: boolean;
    batchInterval?: number;
    maxBatchSize?: number;
    reconnectAttempts?: number;
    reconnectDelay?: number;
    heartbeatInterval?: number;
}

export class WebSocketService {
    private socket: WebSocket | null = null;
    private messageHandlers: Map<WebSocketMessageType, ((data: unknown) => void)[]> = new Map();
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts: number;
    private readonly reconnectDelay: number;
    private readonly useCompression: boolean;
    private readonly batchInterval: number;
    private readonly maxBatchSize: number;
    private batchedMessages: WebSocketMessage[] = [];
    private batchTimeout: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private lastHeartbeat: number = Date.now();

    constructor(private readonly options: WebSocketOptions) {
        this.maxReconnectAttempts = options.reconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 1000;
        this.useCompression = options.compression || false;
        this.batchInterval = options.batchInterval || 100;
        this.maxBatchSize = options.maxBatchSize || 100;
    }

    /**
     * Connects to the WebSocket endpoint and sets up event listeners.
     * @remarks
     * When the connection is closed, the library will attempt to reconnect
     * up to `maxReconnectAttempts` times, with an exponential backoff time
     * between attempts.
     */
    connect() {
        if (this.socket?.readyState === WebSocket.OPEN) return;

        this.socket = new WebSocket(this.options.url);
        
        /**
         * Handles the WebSocket open event by logging the establishment of the connection.
         * 
         * @remarks
         * This event listener is triggered when the WebSocket connection is successfully 
         * established. It logs a message indicating the active connection along with the 
         * WebSocket URL.
         */
        this.socket.onopen = () => {
            console.log('WebSocket connection established:', this.options.url);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
        };
        // Handles WebSocket message event. The library expects the incoming
        // message to be a JSON object with a "type" field and a "payload" field.
        // The message is dispatched to all registered handlers for the given
        // message type.
        this.socket.onmessage = async (event) => {
            try {
                let data = event.data;
                if (this.useCompression && typeof data === 'string') {
                    data = await this.decompress(data);
                }

                const message: WebSocketMessage = JSON.parse(data);
                
                if (message.type === WebSocketMessageType.BATCH) {
                    (message.payload as WebSocketMessage[]).forEach(msg => this.handleMessage(msg));
                } else {
                    this.handleMessage(message);
                }
            } catch (error) {
                this.handleError(WebSocketErrorType.MESSAGE_ERROR, error);
            }
        };

        /**
         * Handles the WebSocket close event by logging the closure of the connection
         * and attempting to reconnect up to `maxReconnectAttempts` times, with an
         * exponential backoff time between attempts.
         */
        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed:', this.options.url);
            this.stopHeartbeat();
            
            if (!event.wasClean) {
                this.handleError(WebSocketErrorType.CONNECTION_ERROR, new Error('Connection closed unexpectedly'));
            }
            
            this.handleDisconnect();
        };

        // Handles WebSocket errors, logging the error to the console.
        this.socket.onerror = (error) => {
            this.handleError(WebSocketErrorType.CONNECTION_ERROR, error);
        };
    }

    private async compress(data: string): Promise<string> {
        try {
            const compressed = pako.deflate(data);
            return Buffer.from(compressed).toString('base64');
        } catch (error) {
            this.handleError(WebSocketErrorType.COMPRESSION_ERROR, error);
            return data;
        }
    }

    private async decompress(data: string): Promise<string> {
        try {
            const compressed = Buffer.from(data, 'base64');
            const decompressed = pako.inflate(compressed);
            return new TextDecoder().decode(decompressed);
        } catch (error) {
            this.handleError(WebSocketErrorType.COMPRESSION_ERROR, error);
            return data;
        }
    }

    /**
     * Handles incoming WebSocket messages by dispatching them to the appropriate handlers.
     *
     * @param message - The WebSocket message containing a type and payload.
     * @remarks
     * This function retrieves all handlers registered for the message type and executes
     * them with the message payload.
     */
    private handleMessage(message: WebSocketMessage) {
        if (message.type === WebSocketMessageType.HEARTBEAT) {
            this.lastHeartbeat = Date.now();
            return;
        }

        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach(handler => {
            try {
                handler(message.payload);
            } catch (error) {
                this.handleError(WebSocketErrorType.MESSAGE_ERROR, error);
            }
        });
    }

    private handleError(type: WebSocketErrorType, error: any) {
        console.error(`WebSocket ${type}:`, error);
        // Here you could add error reporting to a monitoring service
    }

    /**
     * Handles the WebSocket disconnection event by attempting to reconnect.
     *
     * @remarks
     * This function checks if the current number of reconnection attempts is less
     * than the maximum allowed. If so, it schedules a reconnection after a delay
     * using exponential backoff. The delay increases with each failed attempt.
     */
    private handleDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        }
    }

    /**
     * Subscribes to incoming WebSocket messages of the given type.
     *
     * @param type - The type of WebSocket message to subscribe to.
     * @param handler - The function to execute when a message of the given type is received.
     * @template T - The expected type of the message payload.
     */
    subscribe<T>(type: WebSocketMessageType, handler: (data: T) => void) {
        const handlers = this.messageHandlers.get(type) || [];
        handlers.push(handler as (data: unknown) => void);
        this.messageHandlers.set(type, handlers);
    }

    /**
     * Unsubscribes from incoming WebSocket messages of the given type.
     *
     * @param type - The type of WebSocket message to unsubscribe from.
     * @param handler - The function to remove from the subscription list.
     */
    unsubscribe<T>(type: WebSocketMessageType, handler: (data: T) => void) {
        const handlers = this.messageHandlers.get(type) || [];
        this.messageHandlers.set(
            type,
            handlers.filter(h => h !== handler)
        );
    }

    /**
     * Sends a WebSocket message of the given type with the given payload.
     *
     * @param type - The type of WebSocket message to send.
     * @param payload - The payload of the message to send.
     * @remarks
     * This function will only send a message if the WebSocket connection is open.
     * If the connection is not open, the message will not be sent and this function
     * will not throw an error.
     */
    async send(type: WebSocketMessageType, payload: unknown) {
        const message: WebSocketMessage = {
            type,
            payload,
            timestamp: new Date().toISOString()
        };

        if (this.batchedMessages.length < this.maxBatchSize) {
            this.batchedMessages.push(message);

            if (!this.batchTimeout) {
                this.batchTimeout = setTimeout(() => this.sendBatch(), this.batchInterval);
            }
        } else {
            await this.sendBatch();
            this.batchedMessages.push(message);
            this.batchTimeout = setTimeout(() => this.sendBatch(), this.batchInterval);
        }
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (Date.now() - this.lastHeartbeat > 30000) { // 30 seconds
                this.socket?.close();
                return;
            }
            this.send(WebSocketMessageType.HEARTBEAT, { timestamp: Date.now() });
        }, 15000); // 15 seconds
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private async sendBatch() {
        if (this.batchedMessages.length === 0) return;

        const batch: WebSocketMessage = {
            type: WebSocketMessageType.BATCH,
            payload: this.batchedMessages,
            timestamp: new Date().toISOString()
        };

        let data = JSON.stringify(batch);
        if (this.useCompression) {
            data = await this.compress(data);
        }

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }

        this.batchedMessages = [];
        this.batchTimeout = null;
    }

    /**
     * Disconnects from the WebSocket endpoint, closing the connection and clearing
     * all registered message handlers.
     */
    disconnect() {
        this.stopHeartbeat();
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        this.socket?.close();
        this.socket = null;
        this.messageHandlers.clear();
        this.batchedMessages = [];
    }
}
