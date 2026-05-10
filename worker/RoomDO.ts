import { DurableObject } from 'cloudflare:workers';
import type {
  AnswerPayload,
  ClientMsg,
  GameId,
  PerClassAggregation,
  Phase,
  PublicRoomState,
  ReactionEmoji,
  SeedType,
  ServerMsg,
} from '@shared/protocol';
import { REACTION_EMOJIS } from '@shared/protocol';
import {
  aggregateScores,
  emptyScores,
  scoreAnswer,
  topType,
  SEED_ORDER,
} from '@shared/scoring';
import { slideContextOf } from '@shared/slideContext';
import { phasesForSlide } from '@shared/slidePhases';

interface Env {
  ROOM: DurableObjectNamespace;
}

interface AttachmentTeacher {
  role: 'teacher';
  token: string;
}
interface AttachmentStudent {
  role: 'student';
  sid: string;
  className: string;
}
type Attachment = AttachmentTeacher | AttachmentStudent;

interface InternalState {
  code: string;
  classes: string[];
  phase: Phase;
  currentStage: number;
  currentGameId: GameId | null;
  introCountdownAt: number | null;
  activeStartedAt: number | null;
  activeDurationMs: number | null;
  teacherToken: string | null;
  // 生徒情報
  students: Map<string, { className: string; joinedAt: number }>;
  // 回答（gameId → sid → payload）。再挑戦は反映しない
  answers: Map<GameId, Map<string, AnswerPayload>>;
  // 個人スコア累計（sid → SeedTypeスコア）
  personalScores: Map<string, Record<SeedType, number>>;
  // クラス別sid（クラス→sid集合）
  classSids: Map<string, Set<string>>;
  // クエストカード（sid → 内容）
  questCards: Map<string, { growSkill: string; gameAction: string; schoolAction: string }>;
  // スキル意見（sid → text）
  skillOpinions: Map<string, string>;
  // ゲームで得られる力（sid → 5短文）
  gameSkills: Map<string, string[]>;
  // ステージ内サブステップ
  stageStep: number;
  // スライド進行（全クライアント共有）
  slideIndex: number;
  // スライドファイル名（manifest.json から取り込み、Stage/Game連動判定に使う）
  slideNames: string[];
  // スライド後フェーズステップ（0=スライド表示、>=1=フェーズ）
  postSlideStep: number;
  // 授業開始フラグ（true=スライド進行開始）
  classStarted: boolean;
}

interface SerializedState {
  code: string;
  classes: string[];
  phase: Phase;
  currentStage: number;
  currentGameId: GameId | null;
  introCountdownAt: number | null;
  activeStartedAt: number | null;
  activeDurationMs: number | null;
  teacherToken: string | null;
  students: Array<[string, { className: string; joinedAt: number }]>;
  answers: Array<[GameId, Array<[string, AnswerPayload]>]>;
  personalScores: Array<[string, Record<SeedType, number>]>;
  classSids: Array<[string, string[]]>;
  questCards: Array<[string, { growSkill: string; gameAction: string; schoolAction: string }]>;
  skillOpinions: Array<[string, string]>;
  gameSkills: Array<[string, string[]]>;
  stageStep: number;
  slideIndex: number;
  slideNames: string[];
  postSlideStep: number;
  classStarted: boolean;
}

const serializeState = (s: InternalState): SerializedState => ({
  code: s.code,
  classes: s.classes,
  phase: s.phase,
  currentStage: s.currentStage,
  currentGameId: s.currentGameId,
  introCountdownAt: s.introCountdownAt,
  activeStartedAt: s.activeStartedAt,
  activeDurationMs: s.activeDurationMs,
  teacherToken: s.teacherToken,
  students: Array.from(s.students.entries()),
  answers: Array.from(s.answers.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
  personalScores: Array.from(s.personalScores.entries()),
  classSids: Array.from(s.classSids.entries()).map(([k, v]) => [k, Array.from(v)]),
  questCards: Array.from(s.questCards.entries()),
  skillOpinions: Array.from(s.skillOpinions.entries()),
  gameSkills: Array.from(s.gameSkills.entries()),
  stageStep: s.stageStep,
  slideIndex: s.slideIndex,
  slideNames: s.slideNames,
  postSlideStep: s.postSlideStep,
  classStarted: s.classStarted,
});

const deserializeState = (o: SerializedState): InternalState => ({
  code: o.code,
  classes: o.classes,
  phase: o.phase,
  currentStage: o.currentStage,
  currentGameId: o.currentGameId,
  introCountdownAt: o.introCountdownAt,
  activeStartedAt: o.activeStartedAt,
  activeDurationMs: o.activeDurationMs,
  teacherToken: o.teacherToken,
  students: new Map(o.students ?? []),
  answers: new Map((o.answers ?? []).map(([k, v]) => [k, new Map(v)])),
  personalScores: new Map(o.personalScores ?? []),
  classSids: new Map((o.classSids ?? []).map(([k, v]) => [k, new Set(v)])),
  questCards: new Map(o.questCards ?? []),
  skillOpinions: new Map(o.skillOpinions ?? []),
  gameSkills: new Map(o.gameSkills ?? []),
  stageStep: o.stageStep ?? 0,
  slideIndex: o.slideIndex ?? 0,
  slideNames: o.slideNames ?? [],
  postSlideStep: o.postSlideStep ?? 0,
  classStarted: o.classStarted ?? false,
});

const generateToken = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const generateSid = (): string => {
  return crypto.randomUUID();
};

export class RoomDO extends DurableObject<Env> {
  private state: InternalState;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = this.createInitialState();
    // Hibernation時のメモリ消失に備え、storageから復元
    this.ctx.blockConcurrencyWhile(async () => {
      await this.loadFromStorage();
    });
  }

  // ─────────── 永続化 ───────────
  private async loadFromStorage(): Promise<void> {
    try {
      const obj = await this.ctx.storage.get<SerializedState>('state');
      if (obj) {
        this.state = deserializeState(obj);
      }
    } catch {
      // 失敗時は初期状態のまま
    }
  }

  private async persist(): Promise<void> {
    try {
      await this.ctx.storage.put('state', serializeState(this.state));
    } catch {
      // ignore
    }
  }

  private createInitialState(): InternalState {
    return {
      code: '',
      classes: [],
      phase: 'lobby',
      currentStage: 0,
      currentGameId: null,
      introCountdownAt: null,
      activeStartedAt: null,
      activeDurationMs: null,
      teacherToken: null,
      students: new Map(),
      answers: new Map(),
      personalScores: new Map(),
      classSids: new Map(),
      questCards: new Map(),
      skillOpinions: new Map(),
      gameSkills: new Map(),
      stageStep: 0,
      slideIndex: 0,
      slideNames: [],
      postSlideStep: 0,
      classStarted: false,
    };
  }

  // 公開ステート（クライアント送信用）
  private publicState(): PublicRoomState {
    const perClassCount: Record<string, number> = {};
    for (const cls of this.state.classes) {
      perClassCount[cls] = this.state.classSids.get(cls)?.size ?? 0;
    }
    return {
      code: this.state.code,
      classes: this.state.classes,
      phase: this.state.phase,
      currentStage: this.state.currentStage,
      currentGameId: this.state.currentGameId,
      introCountdownAt: this.state.introCountdownAt,
      activeStartedAt: this.state.activeStartedAt,
      activeDurationMs: this.state.activeDurationMs,
      totalStudents: this.state.students.size,
      perClassCount,
      serverTime: Date.now(),
      stageStep: this.state.stageStep,
      slideIndex: this.state.slideIndex,
      postSlideStep: this.state.postSlideStep,
      classStarted: this.state.classStarted,
    };
  }

  // ─────────── HTTP entry ───────────
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      const code = url.searchParams.get('room') ?? '';
      if (!code) return new Response('Missing room', { status: 400 });
      // 初回コネクションでコードを採用（永続化）
      if (!this.state.code) {
        this.state.code = code;
        await this.persist();
      } else if (this.state.code !== code) {
        return new Response('Room code mismatch', { status: 409 });
      }
      const upgrade = request.headers.get('Upgrade');
      if (upgrade !== 'websocket') {
        return new Response('Expected websocket', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  // ─────────── WebSocket handlers (Hibernation API) ───────────
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw));
    } catch {
      this.sendErr(ws, 'BAD_JSON', 'メッセージのJSON解釈に失敗しました');
      return;
    }
    try {
      await this.handleMessage(ws, msg);
      // ステート変更が発生し得るメッセージのみ永続化
      if (this.shouldPersist(msg.type)) {
        await this.persist();
      }
    } catch (e) {
      this.sendErr(ws, 'INTERNAL', String((e as Error).message ?? e));
    }
  }

  private shouldPersist(type: ClientMsg['type']): boolean {
    switch (type) {
      case 'PING':
      case 'REACTION':
      case 'S_PEEK':
      case 'T_RESUME':
        return false;
      default:
        // T_*, S_ANSWER, S_QUEST など
        return true;
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    const att = this.getAttachment(ws);
    if (att?.role === 'student') {
      // 生徒のWS切断は通知のみ。状態は維持（再接続のため）
      this.broadcastStudentCount();
    }
  }

  async webSocketError(ws: WebSocket, _err: unknown): Promise<void> {
    try {
      ws.close(1011, 'error');
    } catch {
      // ignore
    }
  }

  // ─────────── Message dispatch ───────────
  private async handleMessage(ws: WebSocket, msg: ClientMsg): Promise<void> {
    switch (msg.type) {
      case 'PING':
        this.send(ws, { type: 'PONG' });
        return;

      case 'T_CREATE_ROOM':
        return this.tCreateRoom(ws, msg.classes);

      case 'T_RESUME':
        return this.tResume(ws, msg.teacherToken);

      case 'T_START_GAME':
        return this.tStartGame(ws, msg.gameId, msg.durationMs);

      case 'T_END_GAME':
        return this.tEndGame(ws);

      case 'T_NEXT_GAME':
        return this.tNextGame(ws);

      case 'T_SKIP_GAME':
        return this.tSkipGame(ws, msg.gameId);

      case 'T_END_STAGE':
        return this.tEndStage(ws);

      case 'T_NEXT_STAGE':
        return this.tNextStage(ws);

      case 'T_NEXT_STEP':
        return this.tNextStep(ws);

      case 'T_PREV_STEP':
        return this.tPrevStep(ws);

      case 'T_GOTO_STEP':
        return this.tGotoStep(ws, msg.step);

      case 'T_NEXT_SLIDE':
        return this.tNextSlide(ws);

      case 'T_PREV_SLIDE':
        return this.tPrevSlide(ws);

      case 'T_GOTO_SLIDE':
        return this.tGotoSlide(ws, msg.index);

      case 'T_SET_SLIDE_DECK':
        return this.tSetSlideDeck(ws, msg.names);

      case 'T_START_CLASS':
        return this.tStartClass(ws);

      case 'T_CLOSE_ROOM':
        return this.tCloseRoom(ws);

      case 'S_PEEK':
        return this.sPeek(ws, msg.code);

      case 'S_JOIN':
        return this.sJoin(ws, msg.code, msg.className, msg.sid);

      case 'S_ANSWER':
        return this.sAnswer(ws, msg.gameId, msg.payload);

      case 'S_QUEST':
        return this.sQuest(ws, msg.growSkill, msg.gameAction, msg.schoolAction);

      case 'S_SKILL_OPINION':
        return this.sSkillOpinion(ws, msg.text);

      case 'S_GAME_SKILLS':
        return this.sGameSkills(ws, msg.texts);

      case 'S_RETRY':
        // 再挑戦：集計には影響しない、クライアント側で再表示するためのフラグ通知のみ
        this.send(ws, { type: 'STATE', state: this.publicState() });
        return;

      case 'REACTION':
        return this.handleReaction(msg.emoji);

      default:
        this.sendErr(ws, 'UNKNOWN_TYPE', '未知のメッセージタイプです');
    }
  }

  // ─────────── Teacher commands ───────────
  private tCreateRoom(ws: WebSocket, classes: string[]): void {
    if (this.state.teacherToken) {
      // 既にルーム作成済み → 既存講師に再接続要求
      this.sendErr(ws, 'ROOM_EXISTS', 'このルームは既に作成済みです。再接続してください');
      return;
    }
    // codeはfetchで既に設定済み（Workerから渡される）
    this.state.classes = (classes ?? [])
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .slice(0, 20);
    if (this.state.classes.length === 0) {
      this.state.classes = ['全員'];
    }
    for (const cls of this.state.classes) {
      this.state.classSids.set(cls, new Set());
    }
    this.state.teacherToken = generateToken();
    this.attach(ws, { role: 'teacher', token: this.state.teacherToken });
    this.send(ws, {
      type: 'ROOM_CREATED',
      code: this.state.code,
      teacherToken: this.state.teacherToken,
      state: this.publicState(),
    });
  }

  private tResume(ws: WebSocket, token: string): void {
    if (token !== this.state.teacherToken) {
      this.sendErr(ws, 'BAD_TOKEN', '講師トークンが一致しません');
      return;
    }
    this.attach(ws, { role: 'teacher', token });
    this.send(ws, { type: 'STATE', state: this.publicState() });
  }

  private requireTeacher(ws: WebSocket): boolean {
    const att = this.getAttachment(ws);
    if (att?.role !== 'teacher') {
      this.sendErr(ws, 'NOT_TEACHER', '講師のみ操作できます');
      return false;
    }
    return true;
  }

  private tStartGame(ws: WebSocket, gameId: GameId, durationMs: number): void {
    if (!this.requireTeacher(ws)) return;
    this.state.currentGameId = gameId;
    this.state.phase = 'intro';
    this.state.introCountdownAt = Date.now();
    this.state.activeStartedAt = Date.now() + 3000; // 3秒カウントダウン後
    this.state.activeDurationMs = durationMs;
    this.broadcastPhase();
    // 3秒後に active へ自動遷移
    void this.ctx.storage.setAlarm(this.state.activeStartedAt);
  }

  private tEndGame(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.transitionToResults();
  }

  private tNextGame(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.phase = 'lobby';
    this.state.currentGameId = null;
    this.state.introCountdownAt = null;
    this.state.activeStartedAt = null;
    this.state.activeDurationMs = null;
    this.broadcastPhase();
  }

  private tSkipGame(ws: WebSocket, gameId: GameId): void {
    if (!this.requireTeacher(ws)) return;
    // 集計は記録しない（誰もプレイしていない or プレイ中で打ち切り）
    if (this.state.currentGameId === gameId) {
      this.transitionToResults();
    } else {
      // 未開始のスキップ：何もしない（クライアント側がカーソル進める）
      this.broadcastPhase();
    }
  }

  private tEndStage(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.phase = 'stage_summary';
    this.state.currentGameId = null;
    this.broadcastPhase();
    const summary = this.computeStageSummary();
    this.broadcast({
      type: 'STAGE_SUMMARY',
      perClass: summary.perClass,
      overall: summary.overall,
    });
  }

  private tNextStage(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.currentStage = Math.min(this.state.currentStage + 1, 6);
    this.state.phase = 'lobby';
    this.state.stageStep = 0;
    this.broadcastPhase();
  }

  private tNextStep(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.stageStep += 1;
    this.broadcastPhase();
  }

  private tGotoStep(ws: WebSocket, step: number): void {
    if (!this.requireTeacher(ws)) return;
    this.state.stageStep = Math.max(0, Math.floor(step));
    this.broadcastPhase();
  }

  private tPrevStep(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.stageStep = Math.max(0, this.state.stageStep - 1);
    this.broadcastPhase();
  }

  // 「授業開始」ボタン → スライド表示モードに突入
  private tStartClass(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    if (this.state.classStarted) return;
    this.state.classStarted = true;
    this.state.slideIndex = 0;
    this.state.postSlideStep = 0;
    this.broadcastPhase();
  }

  // 講師起動時にスライドファイル一覧をサーバー側に登録（manifest.json から）
  private tSetSlideDeck(ws: WebSocket, names: string[]): void {
    if (!this.requireTeacher(ws)) return;
    this.state.slideNames = Array.isArray(names) ? names.slice() : [];
    if (this.state.slideIndex >= this.state.slideNames.length) {
      this.state.slideIndex = Math.max(0, this.state.slideNames.length - 1);
    }
    this.broadcastPhase();
  }

  // ▶ 次へ：まずスライド後フェーズを進め、フェーズが終われば次のスライドへ
  private tNextSlide(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    const currentName = this.state.slideNames[this.state.slideIndex] ?? '';
    const phases = phasesForSlide(currentName);
    if (this.state.postSlideStep < phases.length) {
      this.state.postSlideStep += 1;
      const enteredPhase = phases[this.state.postSlideStep - 1];
      // 意見入力フェーズに入った時は5分タイマーを起動
      if (enteredPhase === 'opinion-input') {
        this.state.activeStartedAt = Date.now();
        this.state.activeDurationMs = 300_000;
      } else {
        this.state.activeStartedAt = null;
        this.state.activeDurationMs = null;
      }
      // 全ゲーム総合分析フェーズに入った時はクラス集計をブロードキャスト
      if (enteredPhase === 'stage2-summary') {
        this.state.phase = 'stage_summary';
        this.broadcastPhase();
        const summary = this.computeStageSummary();
        this.broadcast({
          type: 'STAGE_SUMMARY',
          perClass: summary.perClass,
          overall: summary.overall,
        });
        return;
      }
      this.broadcastPhase();
      return;
    }
    this.tGotoSlide(ws, this.state.slideIndex + 1);
  }

  // ◀ 戻る：フェーズ中ならフェーズを戻す
  private tPrevSlide(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    if (this.state.postSlideStep > 0) {
      this.state.postSlideStep -= 1;
      this.state.activeStartedAt = null;
      this.state.activeDurationMs = null;
      this.broadcastPhase();
      return;
    }
    this.tGotoSlide(ws, this.state.slideIndex - 1);
  }

  // スライド遷移（▶ 次へボタンの中核）
  // ファイル名から slide context を取り、Stage / Game ID をヒントとして同期する
  // ゲームは自動開始しない（講師が「開始ボタン」で明示的に始める）
  private tGotoSlide(ws: WebSocket, rawIndex: number): void {
    if (!this.requireTeacher(ws)) return;
    const total = this.state.slideNames.length;
    if (total === 0) {
      // スライド未登録でも index は動かす
      this.state.slideIndex = Math.max(0, rawIndex);
      this.state.postSlideStep = 0;
      this.broadcastPhase();
      return;
    }
    const idx = Math.max(0, Math.min(total - 1, rawIndex));
    if (idx === this.state.slideIndex && this.state.postSlideStep === 0) return;
    this.state.slideIndex = idx;
    this.state.postSlideStep = 0;

    // スライド変更時はフェーズを lobby に戻す（ゲーム中なら強制停止）
    this.state.phase = 'lobby';
    this.state.introCountdownAt = null;
    this.state.activeStartedAt = null;
    this.state.activeDurationMs = null;

    // ファイル名から context を取得して Stage / GameId を更新（自動開始はしない）
    const name = this.state.slideNames[idx] ?? '';
    const ctx = slideContextOf(name);
    if (ctx.stage !== undefined && ctx.stage !== this.state.currentStage) {
      this.state.currentStage = ctx.stage;
      this.state.stageStep = 0;
    }
    // ゲームスライドの場合: currentGameId をヒントとしてセット（active にはしない）
    if (ctx.gameId) {
      this.state.currentGameId = ctx.gameId;
    } else {
      this.state.currentGameId = null;
    }
    this.broadcastPhase();
  }

  private sSkillOpinion(ws: WebSocket, textIn: string): void {
    const att = this.getAttachment(ws);
    if (att?.role !== 'student') {
      this.sendErr(ws, 'NOT_STUDENT', '生徒のみ送信できます');
      return;
    }
    const text = (textIn ?? '').trim().slice(0, 80);
    if (!text) return;
    this.state.skillOpinions.set(att.sid, text);
    this.broadcastSkillOpinions();
  }

  private sGameSkills(ws: WebSocket, textsIn: string[]): void {
    const att = this.getAttachment(ws);
    if (att?.role !== 'student') {
      this.sendErr(ws, 'NOT_STUDENT', '生徒のみ送信できます');
      return;
    }
    if (!Array.isArray(textsIn)) return;
    const texts = textsIn
      .map((t) => (typeof t === 'string' ? t.trim().slice(0, 30) : ''))
      .filter((t) => t.length > 0)
      .slice(0, 8);
    // 空送信は無視（誤クリック対策）
    if (texts.length === 0) {
      return;
    }
    this.state.gameSkills.set(att.sid, texts);
    this.broadcastGameSkills();
  }

  private broadcastGameSkills(): void {
    // 全提出を flatten。正規化した text でグルーピングしてカウント
    const groups = new Map<string, { text: string; count: number; classes: Set<string> }>();
    let totalSubmissions = 0;
    let totalEntries = 0;
    const perClass: Record<string, number> = {};
    for (const cls of this.state.classes) perClass[cls] = 0;

    for (const [sid, texts] of this.state.gameSkills) {
      const info = this.state.students.get(sid);
      const cls = info?.className ?? '不明';
      perClass[cls] = (perClass[cls] ?? 0) + 1;
      totalSubmissions++;
      for (const text of texts) {
        totalEntries++;
        const norm = text.toLowerCase().replace(/\s+/g, '');
        const existing = groups.get(norm);
        if (existing) {
          existing.count++;
          existing.classes.add(cls);
        } else {
          groups.set(norm, { text, count: 1, classes: new Set([cls]) });
        }
      }
    }

    const items = Array.from(groups.values())
      .map((g) => ({ text: g.text, count: g.count, classes: Array.from(g.classes) }))
      .sort((a, b) => b.count - a.count);

    this.broadcast({
      type: 'GAME_SKILLS_AGG',
      totalSubmissions,
      totalEntries,
      perClass,
      items,
    });
  }

  private broadcastSkillOpinions(): void {
    const opinions: Array<{ className: string; text: string }> = [];
    const perClass: Record<string, number> = {};
    for (const cls of this.state.classes) perClass[cls] = 0;
    const wordCounts: Record<string, number> = {};

    for (const [sid, text] of this.state.skillOpinions) {
      const info = this.state.students.get(sid);
      const cls = info?.className ?? '不明';
      perClass[cls] = (perClass[cls] ?? 0) + 1;
      if (opinions.length < 100) opinions.push({ className: cls, text });
      // 簡易単語カウント：句読点・空白で分割、2文字以上のみ
      const tokens = text.split(/[\s、。,.!?！？・\/／]+/).filter((t) => t.length >= 2);
      for (const t of tokens) {
        wordCounts[t] = (wordCounts[t] ?? 0) + 1;
      }
    }

    this.broadcast({
      type: 'SKILL_OPINIONS_AGG',
      total: this.state.skillOpinions.size,
      perClass,
      opinions,
      wordCounts,
    });
  }

  private tCloseRoom(ws: WebSocket): void {
    if (!this.requireTeacher(ws)) return;
    this.state.phase = 'closed';
    this.broadcastPhase();
    // 全WS閉じる
    for (const sock of this.ctx.getWebSockets()) {
      try {
        sock.close(1000, 'room closed');
      } catch {
        // ignore
      }
    }
    // 状態リセット
    this.state = this.createInitialState();
  }

  // ─────────── Student commands ───────────
  private sPeek(ws: WebSocket, code: string): void {
    if (!this.state.code || !this.state.teacherToken) {
      this.sendErr(ws, 'NO_ROOM', 'このコードのルームはまだ作られていません');
      return;
    }
    if (code !== this.state.code) {
      this.sendErr(ws, 'BAD_CODE', 'ルームコードが違います');
      return;
    }
    if (this.state.phase === 'closed') {
      this.sendErr(ws, 'ROOM_CLOSED', 'このルームは終了しました');
      return;
    }
    this.send(ws, { type: 'PEEKED', state: this.publicState() });
  }

  private sJoin(ws: WebSocket, code: string, className: string, sidIn?: string): void {
    if (!this.state.code || !this.state.teacherToken) {
      this.sendErr(ws, 'NO_ROOM', 'このコードのルームはまだ作られていません');
      return;
    }
    if (code !== this.state.code) {
      this.sendErr(ws, 'BAD_CODE', 'ルームコードが違います');
      return;
    }
    if (this.state.phase === 'closed') {
      this.sendErr(ws, 'ROOM_CLOSED', 'このルームは終了しました');
      return;
    }
    if (!this.state.classes.includes(className)) {
      this.sendErr(ws, 'BAD_CLASS', 'クラスが選択肢にありません');
      return;
    }
    const sid = sidIn && this.state.students.has(sidIn) ? sidIn : generateSid();
    if (!this.state.students.has(sid)) {
      this.state.students.set(sid, { className, joinedAt: Date.now() });
      let set = this.state.classSids.get(className);
      if (!set) {
        set = new Set();
        this.state.classSids.set(className, set);
      }
      set.add(sid);
    }
    this.attach(ws, { role: 'student', sid, className });
    this.send(ws, { type: 'JOINED', sid, state: this.publicState() });
    this.broadcastStudentCount();
  }

  private sQuest(ws: WebSocket, growSkill: string, gameAction: string, schoolAction: string): void {
    const att = this.getAttachment(ws);
    if (att?.role !== 'student') {
      this.sendErr(ws, 'NOT_STUDENT', '生徒のみ送信できます');
      return;
    }
    // テキストの長さ制限（個人情報混入防止）
    const trim = (s: string, max: number) => s.trim().slice(0, max);
    this.state.questCards.set(att.sid, {
      growSkill: trim(growSkill, 30),
      gameAction: trim(gameAction, 40),
      schoolAction: trim(schoolAction, 40),
    });
    this.broadcastQuestAggregation();
  }

  private broadcastQuestAggregation(): void {
    const cards = Array.from(this.state.questCards.entries());
    const perClass: Record<string, number> = {};
    const growCount: Record<string, number> = {};
    const gameCount: Record<string, number> = {};
    const schoolCount: Record<string, number> = {};
    const samples: Array<{ className: string; growSkill: string; gameAction: string; schoolAction: string }> = [];

    for (const cls of this.state.classes) perClass[cls] = 0;

    for (const [sid, card] of cards) {
      const info = this.state.students.get(sid);
      const cls = info?.className ?? '不明';
      perClass[cls] = (perClass[cls] ?? 0) + 1;
      growCount[card.growSkill] = (growCount[card.growSkill] ?? 0) + 1;
      gameCount[card.gameAction] = (gameCount[card.gameAction] ?? 0) + 1;
      schoolCount[card.schoolAction] = (schoolCount[card.schoolAction] ?? 0) + 1;
      if (samples.length < 500) {
        samples.push({ className: cls, ...card });
      }
    }

    this.broadcast({
      type: 'QUEST_AGG',
      total: cards.length,
      perClass,
      growSkillCounts: growCount,
      gameActionCounts: gameCount,
      schoolActionCounts: schoolCount,
      samples,
    });
  }

  private sAnswer(ws: WebSocket, gameId: GameId, payload: AnswerPayload): void {
    const att = this.getAttachment(ws);
    if (att?.role !== 'student') {
      this.sendErr(ws, 'NOT_STUDENT', '生徒のみ回答できます');
      return;
    }
    let map = this.state.answers.get(gameId);
    if (!map) {
      map = new Map();
      this.state.answers.set(gameId, map);
    }
    if (!map.has(att.sid)) {
      // 初回のみ集計対象
      map.set(att.sid, payload);
      // 個人スコア累積
      const prev = this.state.personalScores.get(att.sid) ?? emptyScores();
      const add = scoreAnswer(payload);
      const merged = { ...prev };
      for (const k of SEED_ORDER) merged[k] = (merged[k] ?? 0) + add[k];
      this.state.personalScores.set(att.sid, merged);
    }
    this.broadcastProgress(gameId);
  }

  // ─────────── Reactions ───────────
  private handleReaction(emoji: ReactionEmoji): void {
    if (!REACTION_EMOJIS.includes(emoji)) return;
    this.broadcast({ type: 'REACTION_BURST', emoji, ts: Date.now() });
  }

  // ─────────── Aggregation ───────────
  private transitionToResults(): void {
    this.state.phase = 'results';
    this.broadcastPhase();
    if (this.state.currentGameId) {
      const result = this.computeAggregation(this.state.currentGameId);
      this.broadcast({ type: 'AGGREGATION', result });
    }
  }

  private computeAggregation(gameId: GameId) {
    const map = this.state.answers.get(gameId) ?? new Map<string, AnswerPayload>();
    const allScores: Array<Record<SeedType, number>> = [];
    const perClassMap = new Map<string, Array<Record<SeedType, number>>>();
    for (const [sid, payload] of map) {
      const score = scoreAnswer(payload);
      allScores.push(score);
      const info = this.state.students.get(sid);
      if (info) {
        const arr = perClassMap.get(info.className) ?? [];
        arr.push(score);
        perClassMap.set(info.className, arr);
      }
    }
    const overallAvg = aggregateScores(allScores);
    const perClass: PerClassAggregation[] = this.state.classes.map((cls) => {
      const arr = perClassMap.get(cls) ?? [];
      const avg = aggregateScores(arr);
      return {
        className: cls,
        count: arr.length,
        scoresAvg: avg,
        topType: arr.length > 0 ? topType(avg) : null,
      };
    });
    return {
      gameId,
      totalAnswers: map.size,
      perClass,
      overall: {
        scoresAvg: overallAvg,
        topType: allScores.length > 0 ? topType(overallAvg) : null,
      },
    };
  }

  private computeStageSummary() {
    // 全ゲームの個人スコアからクラス別平均
    const perClassMap = new Map<string, Array<Record<SeedType, number>>>();
    const allScores: Array<Record<SeedType, number>> = [];
    for (const [sid, score] of this.state.personalScores) {
      allScores.push(score);
      const info = this.state.students.get(sid);
      if (info) {
        const arr = perClassMap.get(info.className) ?? [];
        arr.push(score);
        perClassMap.set(info.className, arr);
      }
    }
    const overallAvg = aggregateScores(allScores);
    const perClass: PerClassAggregation[] = this.state.classes.map((cls) => {
      const arr = perClassMap.get(cls) ?? [];
      const avg = aggregateScores(arr);
      return {
        className: cls,
        count: arr.length,
        scoresAvg: avg,
        topType: arr.length > 0 ? topType(avg) : null,
      };
    });
    return {
      perClass,
      overall: {
        scoresAvg: overallAvg,
        topType: allScores.length > 0 ? topType(overallAvg) : null,
      },
    };
  }

  // ─────────── Alarm (intro -> active 自動遷移) ───────────
  async alarm(): Promise<void> {
    if (this.state.phase === 'intro') {
      this.state.phase = 'active';
      this.broadcastPhase();
      // 時間切れで results へ自動遷移
      if (this.state.activeStartedAt && this.state.activeDurationMs) {
        const endAt = this.state.activeStartedAt + this.state.activeDurationMs;
        await this.ctx.storage.setAlarm(endAt);
      }
    } else if (this.state.phase === 'active') {
      this.transitionToResults();
    }
  }

  // ─────────── Broadcast helpers ───────────
  private broadcast(msg: ServerMsg): void {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(JSON.stringify(msg));
      } catch {
        // ignore
      }
    }
  }

  private broadcastPhase(): void {
    this.broadcast({ type: 'PHASE_CHANGE', state: this.publicState() });
  }

  private broadcastStudentCount(): void {
    const perClass: Record<string, number> = {};
    for (const cls of this.state.classes) {
      perClass[cls] = this.state.classSids.get(cls)?.size ?? 0;
    }
    this.broadcast({
      type: 'STUDENT_COUNT',
      total: this.state.students.size,
      perClass,
    });
  }

  private broadcastProgress(gameId: GameId): void {
    const map = this.state.answers.get(gameId) ?? new Map<string, AnswerPayload>();
    const perClass: Record<string, number> = {};
    for (const cls of this.state.classes) perClass[cls] = 0;
    for (const sid of map.keys()) {
      const info = this.state.students.get(sid);
      if (info) perClass[info.className] = (perClass[info.className] ?? 0) + 1;
    }
    // 累積スコアからクラス別の現時点トップタイプを算出
    const perClassScores = new Map<string, Array<Record<SeedType, number>>>();
    for (const [sid, score] of this.state.personalScores) {
      const info = this.state.students.get(sid);
      if (!info) continue;
      const arr = perClassScores.get(info.className) ?? [];
      arr.push(score);
      perClassScores.set(info.className, arr);
    }
    const perClassTopType: Record<string, SeedType | null> = {};
    for (const cls of this.state.classes) {
      const arr = perClassScores.get(cls) ?? [];
      perClassTopType[cls] = arr.length > 0 ? topType(aggregateScores(arr)) : null;
    }
    this.broadcast({
      type: 'PROGRESS',
      gameId,
      count: map.size,
      total: this.state.students.size,
      perClass,
      perClassTopType,
    });
  }

  // ─────────── Send helpers ───────────
  private send(ws: WebSocket, msg: ServerMsg): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // ignore
    }
  }

  private sendErr(ws: WebSocket, code: string, message: string): void {
    this.send(ws, { type: 'ERROR', code, message });
  }

  // ─────────── Attachment ───────────
  private attach(ws: WebSocket, att: Attachment): void {
    ws.serializeAttachment(att);
  }

  private getAttachment(ws: WebSocket): Attachment | null {
    try {
      return (ws.deserializeAttachment() as Attachment | null) ?? null;
    } catch {
      return null;
    }
  }
}
