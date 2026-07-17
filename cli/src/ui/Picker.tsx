import React, { useState } from 'react';
import { Box, Text, render, useApp, useInput } from 'ink';
import { Skill } from '../core/skills.js';

interface PickerProps {
  skills: Skill[];
  mode: string;
  onDone: (selected: string[] | null) => void;
}

function Picker({ skills, mode, onDone }: PickerProps) {
  const { exit } = useApp();
  const [cursor, setCursor] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(() => new Set(skills.map((s) => s.name)));

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setCursor((c) => (c + skills.length - 1) % skills.length);
    } else if (key.downArrow || input === 'j') {
      setCursor((c) => (c + 1) % skills.length);
    } else if (input === ' ') {
      const name = skills[cursor].name;
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    } else if (input === 'a') {
      setChecked(new Set(skills.map((s) => s.name)));
    } else if (input === 'n') {
      setChecked(new Set());
    } else if (key.return) {
      onDone(skills.map((s) => s.name).filter((n) => checked.has(n)));
      exit();
    } else if (key.escape || (key.ctrl && input === 'c') || input === 'q') {
      onDone(null);
      exit();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          longrein install
        </Text>
        <Text dimColor> — {mode} · space toggle · a all · n none · enter confirm · q cancel</Text>
      </Box>
      {skills.map((skill, i) => {
        const active = i === cursor;
        const isChecked = checked.has(skill.name);
        return (
          <Box key={skill.name}>
            <Text color={active ? 'cyan' : undefined}>{active ? '❯ ' : '  '}</Text>
            <Text color={isChecked ? 'green' : 'gray'}>{isChecked ? '◉' : '◯'}</Text>
            <Text bold={active}> {skill.name.padEnd(14)}</Text>
            <Text dimColor>{skill.description.slice(0, 64)}</Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>
          {checked.size}/{skills.length} selected
        </Text>
      </Box>
    </Box>
  );
}

export function pickSkills(skills: Skill[], mode: string): Promise<string[] | null> {
  return new Promise((resolve) => {
    const app = render(<Picker skills={skills} mode={mode} onDone={resolve} />);
    void app.waitUntilExit();
  });
}
