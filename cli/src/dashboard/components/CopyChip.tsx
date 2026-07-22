import { useCallback, useRef, useState } from 'react';
import { Icon } from './Icon';
import { ContextMenu, type MenuItem } from './ContextMenu';
import { useTaskActions } from './TaskActions';
import { parseReference } from '../reference';
import { useT } from '../app/i18n';

// A code reference (file:line, path, identifier) that copies its own text on
// click. The dashboard is read-only and has no editor bridge, so left-click
// resolves to the honest, useful action: put the locator on the clipboard.
// Right-click opens a menu — for file-like references it also offers Open in VS
// Code (jumping to the line) and Reveal in Finder via the local backend. None of
// these touch task state.
export function CopyChip({ value }: { value: string }) {
  const t = useT();
  const actions = useTaskActions();
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(() => {
    const done = () => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    };
    try {
      navigator.clipboard?.writeText(value).then(done, done);
    } catch {
      done();
    }
  }, [value]);

  const reference = parseReference(value);
  const items: MenuItem[] = [];
  if (reference && actions) {
    items.push({
      label: t('openInVscode'),
      icon: 'external-link',
      onSelect: () => actions.reveal(reference.file, 'vscode', reference.line),
    });
    items.push({
      label: t('revealInFinder'),
      icon: 'folder',
      onSelect: () => actions.reveal(reference.file, 'finder', reference.line),
    });
  }
  items.push({ label: t('copyPath'), icon: 'copy', onSelect: copy });

  return (
    <>
      <button
        type="button"
        className={`ref-chip ref-chip-copy${copied ? ' is-copied' : ''}`}
        onClick={copy}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
        title={copied ? t('copied') : `${t('copyPath')} · ${value}`}
        aria-label={`${t('copyPath')}: ${value}`}
      >
        <Icon name={copied ? 'check' : 'copy'} size={12} className="ref-chip-icon" />
        <span className="ref-chip-text">{value}</span>
      </button>
      {menu ? <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} /> : null}
    </>
  );
}
