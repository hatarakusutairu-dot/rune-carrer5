import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { ConnectionBadge } from '@/components/common/ConnectionBadge';
import { CodeEntry } from '@/components/student/CodeEntry';
import { ClassSelector } from '@/components/student/ClassSelector';
import { StudentPhaseBoard } from '@/components/student/StudentPhaseBoard';
import { restoreStudentSession, useSync } from '@/contexts/SyncContext';

export const StudentRoute = () => {
  const [params] = useSearchParams();
  const initialCode = params.get('code') ?? '';
  const {
    state,
    conn,
    myRole,
    mySid,
    myClass,
    peekRoom,
    joinAsStudent,
    lastError,
    clearError,
    reset,
  } = useSync();

  const [pendingCode, setPendingCode] = useState<string>('');

  // ページ復帰時のセッション復元
  useEffect(() => {
    if (state) return;
    const sess = restoreStudentSession();
    if (sess) {
      joinAsStudent(sess.code, sess.className, sess.sid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // QR経由の自動入室（コードが付いていれば即PEEK）
  useEffect(() => {
    if (initialCode && /^\d{6}$/.test(initialCode) && !state && !pendingCode) {
      setPendingCode(initialCode);
      peekRoom(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const handleCodeSubmit = (code: string) => {
    clearError();
    setPendingCode(code);
    peekRoom(code);
  };

  const handleClassConfirm = (className: string) => {
    if (!pendingCode) return;
    clearError();
    joinAsStudent(pendingCode, className);
  };

  const handleBack = () => {
    setPendingCode('');
    clearError();
    reset();
  };

  const inRoom = !!(state && mySid && myRole === 'student');
  const peeked = !!(state && !inRoom && pendingCode);

  const phase: 'enter' | 'choose_class' | 'in_room' = useMemo(() => {
    if (inRoom) return 'in_room';
    if (peeked) return 'choose_class';
    return 'enter';
  }, [inRoom, peeked]);

  return (
    <Layout title="生徒モード" subtitle={inRoom ? `クラス：${myClass}` : '参加コードで入室'}>
      <div className="absolute right-4 top-4">
        <ConnectionBadge state={conn} />
      </div>

      {phase === 'enter' && (
        <CodeEntry
          initialCode={initialCode}
          onSubmit={handleCodeSubmit}
          busy={conn === 'connecting' && !!pendingCode}
          errorMessage={lastError?.message}
        />
      )}

      {phase === 'choose_class' && state && (
        <div className="max-w-md mx-auto">
          <button onClick={handleBack} className="text-xs text-slate-500 hover:underline">
            ← コードを変更
          </button>
          <div className="mt-2">
            <ClassSelector
              classes={state.classes}
              onConfirm={handleClassConfirm}
              busy={conn === 'connecting'}
            />
          </div>
          {lastError && (
            <p className="mt-3 text-sm text-red-600">{lastError.message}</p>
          )}
        </div>
      )}

      {phase === 'in_room' && <StudentPhaseBoard />}

      {(phase === 'in_room' || phase === 'choose_class') && (
        <div className="mt-6 max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('入室を解除しますか？')) {
                handleBack();
              }
            }}
            className="text-red-700"
          >
            入室を解除
          </Button>
        </div>
      )}
    </Layout>
  );
};
