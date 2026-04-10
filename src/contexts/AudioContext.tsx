"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

interface AudioParticipant {
  uid: string;
  username: string;
}

interface PeerConnection {
  peerId: string;
  peer: Peer.Instance;
  username: string;
}

interface AudioContextType {
  inCall: boolean;
  isMuted: boolean;
  participants: AudioParticipant[];
  joinCall: () => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  noteId: string;
  children: React.ReactNode;
}

export function AudioProvider({ noteId, children }: AudioProviderProps) {
  const { user, userProfile } = useAuth();
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<AudioParticipant[]>([]);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<PeerConnection[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const signalUnsubRef = useRef<Unsubscribe | null>(null);
  const participantsUnsubRef = useRef<Unsubscribe | null>(null);

  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach((p) => {
      try { p.peer.destroy(); } catch {}
    });
    peersRef.current = [];
    audioElementsRef.current.forEach((audio) => {
      audio.srcObject = null;
      audio.remove();
    });
    audioElementsRef.current.clear();
  }, []);

  const removePeer = useCallback((uid: string) => {
    const idx = peersRef.current.findIndex((p) => p.peerId === uid);
    if (idx !== -1) {
      try { peersRef.current[idx].peer.destroy(); } catch {}
      peersRef.current.splice(idx, 1);
    }
    const audio = audioElementsRef.current.get(uid);
    if (audio) { 
      audio.srcObject = null; 
      audio.remove(); 
      audioElementsRef.current.delete(uid); 
    }
  }, []);

  const createPeer = useCallback((remoteUid: string, username: string, initiator: boolean, stream: MediaStream) => {
    if (peersRef.current.find((p) => p.peerId === remoteUid)) return;

    const peer = new Peer({
      initiator, 
      trickle: true, 
      stream,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] },
    });

    peer.on("signal", async (signalData) => {
      if (!user) return;
      const signalRef = doc(collection(db, "notes", noteId, "signals"));
      await setDoc(signalRef, { 
        from: user.uid, 
        to: remoteUid, 
        signal: JSON.parse(JSON.stringify(signalData)), 
        createdAt: Date.now() 
      });
    });

    peer.on("stream", (remoteStream) => {
      const audio = document.createElement("audio");
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
      audioElementsRef.current.set(remoteUid, audio);
    });

    peer.on("close", () => removePeer(remoteUid));
    peer.on("error", () => removePeer(remoteUid));

    peersRef.current.push({ peerId: remoteUid, peer, username });
  }, [user, noteId, removePeer]);

  const joinCall = async () => {
    if (!user) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const participantRef = doc(db, "notes", noteId, "participants", user.uid);
      await setDoc(participantRef, {
        uid: user.uid,
        username: userProfile?.username || user.displayName || user.email?.split('@')[0] || "Anonymous",
        joinedAt: Date.now(),
      });

      setInCall(true);

      const partsRef = collection(db, "notes", noteId, "participants");
      participantsUnsubRef.current = onSnapshot(partsRef, (snapshot) => {
        const current: AudioParticipant[] = [];
        snapshot.forEach((doc) => current.push(doc.data() as any));
        setParticipants(current);

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.uid !== user.uid) {
              const isInitiator = user.uid < data.uid;
              createPeer(data.uid, data.username, isInitiator, stream);
            }
          }
          if (change.type === "removed") {
            const data = change.doc.data();
            removePeer(data.uid);
          }
        });
      });

      const signalsRef = collection(db, "notes", noteId, "signals");
      const signalQuery = query(signalsRef, where("to", "==", user.uid));
      signalUnsubRef.current = onSnapshot(signalQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const existingPeer = peersRef.current.find((p) => p.peerId === data.from);
            if (existingPeer) {
              try { existingPeer.peer.signal(data.signal); } catch (err) {
                console.error("Signal error:", err);
              }
            }
            await deleteDoc(change.doc.ref);
          }
        });
      });
    } catch (err) {
      console.error("Failed to join call:", err);
    }
  };

  const leaveCall = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "notes", noteId, "participants", user.uid));
    } catch (err) {}
    
    cleanupPeers();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    
    if (signalUnsubRef.current) signalUnsubRef.current();
    if (participantsUnsubRef.current) participantsUnsubRef.current();
    
    setInCall(false);
    setParticipants([]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, []);

  return (
    <AudioContext.Provider value={{ inCall, isMuted, participants, joinCall, leaveCall, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
}
