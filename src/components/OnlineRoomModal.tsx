import React, { useState } from 'react';
import { X, Wifi, Users, Copy, Check, Send, Trophy, Flag } from 'lucide-react';
import { webRTCService } from '../services/webrtcOnline';
import { ChatMessage, PieceColor } from '../types/chess';
import { soundService } from '../services/sound';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isHost: boolean;
  roomCode: string;
  onStartRoom: (code: string, isHost: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOfferDraw: () => void;
  onResign: () => void;
  myColor: PieceColor;
}

const QUICK_CHATS = [
  'Good game! 👏',
  'Good luck! 🤝',
  'Thank you for the match 🙏',
  'Care for a draw? 🤝',
  'Thinking for a minute... 🤔',
  'Brilliant move! 🔥'
];

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  isHost,
  roomCode,
  onStartRoom,
  messages,
  onSendMessage,
  onOfferDraw,
  onResign,
  myColor
}) => {
  const [inputCode, setInputCode] = useState('');
  const [chatText, setChatText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    setConnecting(true);
    setErrorMsg('');
    const newCode = webRTCService.generateRoomCode();
    await webRTCService.createRoom(
      newCode,
      (code) => {
        setConnecting(false);
        onStartRoom(code, true);
      },
      () => {
        soundService.playNotify();
      },
      () => {
        setConnecting(false);
        setErrorMsg('Failed to create room. Please verify network connection.');
      }
    );
  };

  const handleJoinRoom = async () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      setErrorMsg('Please enter a valid room code');
      return;
    }
    setConnecting(true);
    setErrorMsg('');
    await webRTCService.joinRoom(
      trimmed,
      () => {
        setConnecting(false);
        soundService.playNotify();
        onStartRoom(trimmed, false);
      },
      () => {
        setConnecting(false);
        setErrorMsg('Could not connect to room. Verify the code or host status.');
      }
    );
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    onSendMessage(chatText.trim());
    setChatText('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <Wifi className={`w-5 h-5 ${isConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
            <h3 className="font-bold text-zinc-100 text-base">
              Online Play via WebRTC (Serverless P2P)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Connection status banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="font-bold">
                {isConnected
                  ? `Connected as ${myColor === 'w' ? 'White ⚪' : 'Black ⚫'}`
                  : roomCode
                  ? 'Waiting for opponent to join...'
                  : 'Not connected to any room'}
              </span>
            </div>
            {roomCode && (
              <span className="font-mono font-bold text-sm bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700 text-amber-400">
                {roomCode}
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* If not connected yet: Create or Join */}
          {!isConnected && !roomCode && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center space-y-3">
                <Users className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-zinc-200 text-sm">Create New Room as Host</h4>
                <p className="text-zinc-400 text-xs">
                  Generate a 6-character room code to invite your friend directly. Game starts automatically once joined!
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={connecting}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-50"
                >
                  {connecting ? 'Establishing network...' : 'Create Room Code'}
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-4 text-zinc-500 font-bold">OR</span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-zinc-200 text-sm">Join Friend's Room</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. ABC123)"
                    maxLength={10}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={connecting || !inputCode.trim()}
                    className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold border border-zinc-600 disabled:opacity-40"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for guest */}
          {roomCode && !isConnected && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
              <h4 className="font-bold text-zinc-200 text-sm">Share this Room Code with your friend:</h4>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black text-amber-400 tracking-widest bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-700">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  title="Copy room code"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-zinc-500 text-xs">
                As soon as your opponent connects with this code, this modal will close and the game begins!
              </p>
            </div>
          )}

          {/* In-game Chat and Actions if connected */}
          {isConnected && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={onOfferDraw}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offer Draw</span>
                </button>
                <button
                  onClick={onResign}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/60 font-bold"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Resign</span>
                </button>
              </div>

              {/* Chat messages */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col h-44">
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {messages.length === 0 ? (
                    <div className="text-zinc-600 text-center py-8">
                      No messages yet. Send a message to your opponent!
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-1.5 px-2.5 rounded-lg max-w-[85%] ${
                          m.sender === 'You' || m.sender === 'أنت'
                            ? 'bg-amber-500/20 text-amber-200 ml-auto border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-200 mr-auto border border-zinc-700'
                        }`}
                      >
                        <div className="text-[10px] text-zinc-500 font-bold">{m.sender}</div>
                        <div>{m.text}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick chat chips */}
                <div className="flex gap-1 py-1.5 overflow-x-auto text-[10px] whitespace-nowrap">
                  {QUICK_CHATS.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(phrase)}
                      className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Send chat */}
                <form onSubmit={handleSendChat} className="flex gap-2 pt-1 border-t border-zinc-800">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
