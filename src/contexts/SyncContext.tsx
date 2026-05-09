import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AggregationResult,
  ClientMsg,
  PerClassAggregation,
  PublicRoomState,
  ReactionEmoji,
  ServerMsg,
} from '@shared/protocol';
import { ConnState, SyncClient, buildSyncUrl } from '@/lib/sync';
import { clearMyAnswers } from '@/lib/myAnswers';

const TEACHER_TOKEN_KEY = 'rune-carrer5:teacher-token';
const TEACHER_ROOM_KEY = 'rune-carrer5:teacher-room';
const STUDENT_SID_KEY = 'rune-carrer5:student-sid';
const STUDENT_ROOM_KEY = 'rune-carrer5:student-room';
const STUDENT_CLASS_KEY = 'rune-carrer5:student-class';

export interface ReactionBurst {
  id: string;
  emoji: ReactionEmoji;
  ts: number;
}

interface SyncContextValue {
  conn: ConnState;
  state: PublicRoomState | null;
  // 講師
  myRole: 'teacher' | 'student' | null;
  teacherToken: string | null;
  // 生徒
  mySid: string | null;
  myClass: string | null;
  // 集計
  lastAggregation: AggregationResult | null;
  stageSummary: { perClass: PerClassAggregation[]; overall: AggregationResult['overall'] } | null;
  // クエストカード集計
  questAgg: {
    total: number;
    perClass: Record<string, number>;
    growSkillCounts: Record<string, number>;
    gameActionCounts: Record<string, number>;
    schoolActionCounts: Record<string, number>;
    samples: Array<{ className: string; growSkill: string; gameAction: string; schoolAction: string }>;
  } | null;
  // スキル意見集計
  skillOpinions: {
    total: number;
    perClass: Record<string, number>;
    opinions: Array<{ className: string; text: string }>;
    wordCounts: Record<string, number>;
  } | null;
  // ゲームで得られる力（5短文）の集計
  gameSkills: {
    totalSubmissions: number;
    totalEntries: number;
    perClass: Record<string, number>;
    items: Array<{ text: string; count: number; classes: string[] }>;
  } | null;
  // 進捗（PROGRESSメッセージから）
  progress: {
    gameId: string | null;
    count: number;
    total: number;
    perClass: Record<string, number>;
    perClassTopType: Record<string, string | null>;
  };
  // リアクション
  reactionBursts: ReactionBurst[];
  // 操作
  createRoom: (classes: string[]) => void;
  resumeAsTeacher: (code: string, token: string) => void;
  peekRoom: (code: string) => void;
  joinAsStudent: (code: string, className: string, sid?: string) => void;
  send: (msg: ClientMsg) => boolean;
  reset: () => void;
  clearError: () => void;
  // ラスト受信のERROR
  lastError: { code: string; message: string } | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<SyncClient | null>(null);
  const [conn, setConn] = useState<ConnState>('idle');
  const [state, setState] = useState<PublicRoomState | null>(null);
  const [myRole, setMyRole] = useState<'teacher' | 'student' | null>(null);
  const [teacherToken, setTeacherToken] = useState<string | null>(() =>
    sessionStorage.getItem(TEACHER_TOKEN_KEY)
  );
  const [mySid, setMySid] = useState<string | null>(() =>
    sessionStorage.getItem(STUDENT_SID_KEY)
  );
  const [myClass, setMyClass] = useState<string | null>(() =>
    sessionStorage.getItem(STUDENT_CLASS_KEY)
  );
  const [lastAggregation, setLastAggregation] = useState<AggregationResult | null>(null);
  const [stageSummary, setStageSummary] = useState<SyncContextValue['stageSummary']>(null);
  const [questAgg, setQuestAgg] = useState<SyncContextValue['questAgg']>(null);
  const [skillOpinions, setSkillOpinions] = useState<SyncContextValue['skillOpinions']>(null);
  const [gameSkills, setGameSkills] = useState<SyncContextValue['gameSkills']>(null);
  const [progress, setProgress] = useState<SyncContextValue['progress']>({
    gameId: null,
    count: 0,
    total: 0,
    perClass: {},
    perClassTopType: {},
  });
  const [reactionBursts, setReactionBursts] = useState<ReactionBurst[]>([]);
  const [lastError, setLastError] = useState<SyncContextValue['lastError']>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const handleMessage = useCallback((msg: ServerMsg) => {
    switch (msg.type) {
      case 'ROOM_CREATED':
        setState(msg.state);
        setTeacherToken(msg.teacherToken);
        sessionStorage.setItem(TEACHER_TOKEN_KEY, msg.teacherToken);
        sessionStorage.setItem(TEACHER_ROOM_KEY, msg.code);
        setMyRole('teacher');
        break;
      case 'JOINED':
        setState(msg.state);
        setMySid(msg.sid);
        sessionStorage.setItem(STUDENT_SID_KEY, msg.sid);
        if (msg.state.code) {
          sessionStorage.setItem(STUDENT_ROOM_KEY, msg.state.code);
        }
        setMyRole('student');
        break;
      case 'PEEKED':
      case 'STATE':
      case 'PHASE_CHANGE':
        setState(msg.state);
        break;
      case 'STUDENT_COUNT':
        setState((prev) =>
          prev
            ? { ...prev, totalStudents: msg.total, perClassCount: msg.perClass }
            : prev
        );
        break;
      case 'PROGRESS':
        setProgress({
          gameId: msg.gameId,
          count: msg.count,
          total: msg.total,
          perClass: msg.perClass,
          perClassTopType: msg.perClassTopType ?? {},
        });
        break;
      case 'AGGREGATION':
        setLastAggregation(msg.result);
        break;
      case 'STAGE_SUMMARY':
        setStageSummary({ perClass: msg.perClass, overall: msg.overall });
        break;
      case 'QUEST_AGG':
        setQuestAgg({
          total: msg.total,
          perClass: msg.perClass,
          growSkillCounts: msg.growSkillCounts,
          gameActionCounts: msg.gameActionCounts,
          schoolActionCounts: msg.schoolActionCounts,
          samples: msg.samples,
        });
        break;
      case 'SKILL_OPINIONS_AGG':
        setSkillOpinions({
          total: msg.total,
          perClass: msg.perClass,
          opinions: msg.opinions,
          wordCounts: msg.wordCounts,
        });
        break;
      case 'GAME_SKILLS_AGG':
        setGameSkills({
          totalSubmissions: msg.totalSubmissions,
          totalEntries: msg.totalEntries,
          perClass: msg.perClass,
          items: msg.items,
        });
        break;
      case 'REACTION_BURST': {
        const id = `${msg.ts}-${Math.random().toString(36).slice(2, 8)}`;
        setReactionBursts((prev) => [...prev.slice(-30), { id, emoji: msg.emoji, ts: msg.ts }]);
        break;
      }
      case 'ERROR':
        setLastError({ code: msg.code, message: msg.message });
        break;
      case 'PONG':
        break;
    }
  }, []);

  const ensureClient = useCallback(
    (room: string, onConnected?: () => void) => {
      if (clientRef.current) {
        clientRef.current.stop();
      }
      pendingActionRef.current = onConnected ?? null;
      const client = new SyncClient({
        url: buildSyncUrl(room),
        onMessage: handleMessage,
        onState: (s) => {
          setConn(s);
          if (s === 'connected' && pendingActionRef.current) {
            const fn = pendingActionRef.current;
            pendingActionRef.current = null;
            fn();
          }
        },
      });
      clientRef.current = client;
      client.start();
    },
    [handleMessage]
  );

  const createRoom = useCallback(
    (classes: string[]) => {
      ensureClient('NEW', () => {
        clientRef.current?.send({ type: 'T_CREATE_ROOM', classes });
      });
    },
    [ensureClient]
  );

  const resumeAsTeacher = useCallback(
    (code: string, token: string) => {
      ensureClient(code, () => {
        clientRef.current?.send({ type: 'T_RESUME', teacherToken: token });
      });
      setMyRole('teacher');
    },
    [ensureClient]
  );

  const peekRoom = useCallback(
    (code: string) => {
      ensureClient(code, () => {
        clientRef.current?.send({ type: 'S_PEEK', code });
      });
    },
    [ensureClient]
  );

  const joinAsStudent = useCallback(
    (code: string, className: string, sid?: string) => {
      sessionStorage.setItem(STUDENT_CLASS_KEY, className);
      setMyClass(className);
      // 既に同じルームに接続中ならそのままJOINだけ送る
      if (clientRef.current && conn === 'connected') {
        clientRef.current.send({ type: 'S_JOIN', code, className, sid });
        return;
      }
      ensureClient(code, () => {
        clientRef.current?.send({ type: 'S_JOIN', code, className, sid });
      });
    },
    [conn, ensureClient]
  );

  const clearError = useCallback(() => setLastError(null), []);

  const send = useCallback((msg: ClientMsg) => {
    return clientRef.current?.send(msg) ?? false;
  }, []);

  const reset = useCallback(() => {
    clientRef.current?.stop();
    clientRef.current = null;
    setConn('idle');
    setState(null);
    setMyRole(null);
    setTeacherToken(null);
    setMySid(null);
    setMyClass(null);
    setLastAggregation(null);
    setStageSummary(null);
    setQuestAgg(null);
    setSkillOpinions(null);
    setGameSkills(null);
    setReactionBursts([]);
    setLastError(null);
    sessionStorage.removeItem(TEACHER_TOKEN_KEY);
    sessionStorage.removeItem(TEACHER_ROOM_KEY);
    sessionStorage.removeItem(STUDENT_SID_KEY);
    sessionStorage.removeItem(STUDENT_ROOM_KEY);
    sessionStorage.removeItem(STUDENT_CLASS_KEY);
    clearMyAnswers();
  }, []);

  useEffect(() => {
    return () => {
      clientRef.current?.stop();
    };
  }, []);

  // リアクションバーストの自動退場
  useEffect(() => {
    if (reactionBursts.length === 0) return;
    const t = window.setTimeout(() => {
      const cutoff = Date.now() - 4000;
      setReactionBursts((prev) => prev.filter((b) => b.ts > cutoff));
    }, 500);
    return () => clearTimeout(t);
  }, [reactionBursts]);

  const value: SyncContextValue = useMemo(
    () => ({
      conn,
      state,
      myRole,
      teacherToken,
      mySid,
      myClass,
      lastAggregation,
      stageSummary,
      questAgg,
      skillOpinions,
      gameSkills,
      progress,
      reactionBursts,
      createRoom,
      resumeAsTeacher,
      peekRoom,
      joinAsStudent,
      send,
      reset,
      clearError,
      lastError,
    }),
    [
      conn,
      state,
      myRole,
      teacherToken,
      mySid,
      myClass,
      lastAggregation,
      stageSummary,
      questAgg,
      skillOpinions,
      gameSkills,
      progress,
      reactionBursts,
      createRoom,
      resumeAsTeacher,
      peekRoom,
      joinAsStudent,
      send,
      reset,
      clearError,
      lastError,
    ]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextValue => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
};

export const restoreTeacherSession = (): { code: string; token: string } | null => {
  const code = sessionStorage.getItem(TEACHER_ROOM_KEY);
  const token = sessionStorage.getItem(TEACHER_TOKEN_KEY);
  if (code && token) return { code, token };
  return null;
};

export const restoreStudentSession = (): { code: string; className: string; sid: string } | null => {
  const code = sessionStorage.getItem(STUDENT_ROOM_KEY);
  const className = sessionStorage.getItem(STUDENT_CLASS_KEY);
  const sid = sessionStorage.getItem(STUDENT_SID_KEY);
  if (code && className && sid) return { code, className, sid };
  return null;
};
