import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../utils/socket';
import {
  GameRoom,
  Player,
  CreateRoomData,
  JoinRoomData,
  StartGameData,
  SubmitAnswerData,
  DrawingData,
  RoundResult,
} from '../types/game';

interface UseGameSocketReturn {
  gameRoom: GameRoom | null;
  players: Player[];
  isConnected: boolean;
  error: string | null;
  createRoom: (data: CreateRoomData) => void;
  joinRoom: (data: JoinRoomData) => void;
  leaveRoom: () => void;
  startGame: (data: StartGameData) => void;
  submitAnswer: (data: SubmitAnswerData) => void;
  sendDrawing: (data: DrawingData) => void;
  clearCanvas: (roomCode: string) => void;
}

export const useGameSocket = (): UseGameSocketReturn => {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = getSocket();
    socketRef.current = socket;

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (err: Error) => {
      setError('Connection failed. Please check your internet connection.');
      console.error('Socket connection error:', err);
    };

    // Game event handlers
    const handleRoomCreated = (data: { room: GameRoom }) => {
      setGameRoom(data.room);
      setPlayers(data.room.players);
      setError(null);
    };

    const handleRoomJoined = (data: { room: GameRoom }) => {
      setGameRoom(data.room);
      setPlayers(data.room.players);
      setError(null);
    };

    const handlePlayerJoined = (data: { player: Player; room: GameRoom }) => {
      setPlayers(data.room.players);
      setGameRoom(data.room);
    };

    const handlePlayerLeft = (data: { playerId: string; room: GameRoom }) => {
      setPlayers(data.room.players);
      setGameRoom(data.room);
    };

    const handleGameStarted = (data: { room: GameRoom }) => {
      setGameRoom(data.room);
    };

    const handleStateUpdate = (data: { room: GameRoom }) => {
      setGameRoom(data.room);
    };

    const handleRoundStart = (data: { room: GameRoom; word?: string }) => {
      setGameRoom(data.room);
    };

    const handleRoundEnd = (data: { room: GameRoom; result: RoundResult }) => {
      setGameRoom(data.room);
      // Update players with new scores
      if (data.result.scores) {
        setPlayers(prev => 
          prev.map(p => {
            const scoreData = data.result.scores.find(s => s.playerId === p.id);
            return scoreData ? { ...p, score: scoreData.totalScore } : p;
          })
        );
      }
    };

    const handleDrawingUpdate = (data: DrawingData) => {
      // This will be handled by the DrawingGame component
      // Just emit a custom event for components to listen to
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('game:room-created', handleRoomCreated);
    socket.on('game:room-joined', handleRoomJoined);
    socket.on('game:player-joined', handlePlayerJoined);
    socket.on('game:player-left', handlePlayerLeft);
    socket.on('game:started', handleGameStarted);
    socket.on('game:state-update', handleStateUpdate);
    socket.on('game:round-start', handleRoundStart);
    socket.on('game:round-end', handleRoundEnd);
    socket.on('game:drawing-update', handleDrawingUpdate);
    socket.on('game:error', handleError);

    setIsConnected(socket.connected);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('game:room-created', handleRoomCreated);
      socket.off('game:room-joined', handleRoomJoined);
      socket.off('game:player-joined', handlePlayerJoined);
      socket.off('game:player-left', handlePlayerLeft);
      socket.off('game:started', handleGameStarted);
      socket.off('game:state-update', handleStateUpdate);
      socket.off('game:round-start', handleRoundStart);
      socket.off('game:round-end', handleRoundEnd);
      socket.off('game:drawing-update', handleDrawingUpdate);
      socket.off('game:error', handleError);
    };
  }, []);

  // Action functions
  const createRoom = useCallback((data: CreateRoomData) => {
    if (socketRef.current) {
      socketRef.current.emit('game:create-room', data);
    }
  }, []);

  const joinRoom = useCallback((data: JoinRoomData) => {
    if (socketRef.current) {
      socketRef.current.emit('game:join-room', data);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current && gameRoom) {
      socketRef.current.emit('game:leave-room', { roomCode: gameRoom.roomCode });
      setGameRoom(null);
      setPlayers([]);
    }
  }, [gameRoom]);

  const startGame = useCallback((data: StartGameData) => {
    if (socketRef.current) {
      socketRef.current.emit('game:start-game', data);
    }
  }, []);

  const submitAnswer = useCallback((data: SubmitAnswerData) => {
    if (socketRef.current) {
      socketRef.current.emit('game:submit-answer', data);
    }
  }, []);

  const sendDrawing = useCallback((data: DrawingData) => {
    if (socketRef.current) {
      socketRef.current.emit('game:draw', data);
    }
  }, []);

  const clearCanvas = useCallback((roomCode: string) => {
    if (socketRef.current) {
      socketRef.current.emit('game:clear-canvas', { roomCode });
    }
  }, []);

  return {
    gameRoom,
    players,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    submitAnswer,
    sendDrawing,
    clearCanvas,
  };
};
