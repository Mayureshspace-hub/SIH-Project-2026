import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinCentreQueue: (centreId: string) => void;
  joinCentreQueueRoom: (centreId: string) => void;
  joinFarmerQueue: (farmerId: string) => void;
  lastQueueUpdate: any;
  lastFarmerUpdate: any;
  lastFirestoreUpdate: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { farmer, operator } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastQueueUpdate, setLastQueueUpdate] = useState<any>(null);
  const [lastFarmerUpdate, setLastFarmerUpdate] = useState<any>(null);
  const [lastFirestoreUpdate, setLastFirestoreUpdate] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (farmer?.id) {
        socket.emit('join_farmer', farmer.id);
      }
      if (operator?.centreId) {
        socket.emit('join_centre_queue', operator.centreId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('queue_updated', (data) => {
      setLastQueueUpdate({ ...data, timestamp: Date.now() });
    });

    socket.on('farmer_queue_update', (data) => {
      setLastFarmerUpdate({ ...data, timestamp: Date.now() });
    });

    socket.on('firestore_updated', (data) => {
      setLastFirestoreUpdate({ ...data, timestamp: Date.now() });
    });

    socket.on('global_queue_updated', () => {
      // triggers generic refresh
      setLastQueueUpdate((prev: any) => ({ ...prev, timestamp: Date.now() }));
    });

    return () => {
      socket.disconnect();
    };
  }, [farmer?.id, operator?.centreId]);

  const joinCentreQueue = (centreId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_centre_queue', centreId);
    }
  };

  const joinFarmerQueue = (farmerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_farmer', farmerId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinCentreQueue,
        joinCentreQueueRoom: joinCentreQueue,
        joinFarmerQueue,
        lastQueueUpdate,
        lastFarmerUpdate,
        lastFirestoreUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
