import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { ApiClient } from '../api';
import type { RevealApplication } from '../types';
import { useT } from '../app/i18n';

interface TaskActionsValue {
  reveal: (relativePath: string, application: RevealApplication, line?: number | null) => void;
}

const TaskActionsContext = createContext<TaskActionsValue | null>(null);

export function useTaskActions(): TaskActionsValue | null {
  return useContext(TaskActionsContext);
}

// Bridges the right-click "open in editor / reveal in Finder" actions to the
// local backend for one task. Opening touches no task state; it hands a
// task-relative reference to the loopback server, which resolves it inside the
// task's own subtree. A failed open surfaces a transient notice rather than
// throwing into the render tree.
export function TaskActionsProvider({
  client,
  taskUid,
  children,
}: {
  client: ApiClient;
  taskUid: string;
  children: ReactNode;
}) {
  const t = useT();
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(
    (relativePath: string, application: RevealApplication, line?: number | null) => {
      client.revealPath(taskUid, relativePath, application, line ?? null).catch(() => {
        setNotice(t('revealFailed'));
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setNotice(null), 3200);
      });
    },
    [client, taskUid, t],
  );

  return (
    <TaskActionsContext.Provider value={{ reveal }}>
      {children}
      {notice ? (
        <div className="action-toast" role="alert">
          <span>{notice}</span>
        </div>
      ) : null}
    </TaskActionsContext.Provider>
  );
}
