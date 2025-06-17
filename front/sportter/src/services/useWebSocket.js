import { useCallback, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
brokerURL: 'http://Localhost:8080';


export const useWebSocket = (onMessageReceived, conversacionId) => {
    const stompClient = useRef(null);

    const connect = useCallback(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                client.subscribe(`/topic/mensajes/${conversacionId}`, (message) => {
                    onMessageReceived(JSON.parse(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            client.deactivate();
        };
    }, [conversacionId, onMessageReceived]);

    useEffect(() => {
        if (conversacionId) {
            return connect();
        }
    }, [connect, conversacionId]);

    const sendMessage = (mensaje) => {
        if (stompClient.current && stompClient.current.connected) {
            stompClient.current.publish({
                destination: `/app/chat/${conversacionId}`,
                body: JSON.stringify(mensaje),
            });
        }
    };

    return { sendMessage };
};