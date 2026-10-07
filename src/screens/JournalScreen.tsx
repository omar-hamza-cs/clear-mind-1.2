// ─────────────────────────────────────────────────────────────
// ClearMind — Journal Screen (Timeline + Search + Date Filter)
// app/(tabs)/journal.tsx
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, radii, palette, shadows } from '@/constants/theme';
import { JournalEntryScreen } from '@/screens/JournalEntryScreen';
import type { JournalEntry, MoodLevel } from '@/types';

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '\uD83D\uDE2B',
  2: '\uD83D\uDE1E',
  3: '\uD83D\uDE10',
  4: '\uD83D\uDE0A',
  5: '\uD83D\uDE04',
};

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

export function JournalScreen() {
  const { colors } = useTheme();
  const journal = useStore((s) => s.journal);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  const deleteJournalEntry = useStore((s) => s.deleteJournalEntry);

  const filteredEntries = useMemo(() => {
    let entries = [...journal];

    // Date filter
    if (filter !== 'all') {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const cutoff = new Date(now);
      if (filter === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (filter === 'week') cutoff.setDate(cutoff.getDate() - 7);
      else if (filter === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
      entries = entries.filter((e) => e.createdAt >= cutoff.getTime());
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q)
      );
    }

    return entries;
  }, [journal, filter, searchQuery]);

  // Group entries by date for timeline
  const groupedEntries = useMemo(() => {
    const groups: { label: string; entries: JournalEntry[] }[] = [];
    const labelMap: Record<string, number> = {};

    for (const entry of filteredEntries) {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      if (labelMap[label] === undefined) {
        labelMap[label] = groups.length;
        groups.push({ label, entries: [] });
      }
      groups[labelMap[label]].entries.push(entry);
    }

    return groups;
  }, [filteredEntries]);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deleteJournalEntry(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteJournalEntry]);

  const handleCloseEditor = useCallback(() => {
    setEditingEntry(null);
    setIsCreating(false);
  }, []);

  // ── Entry editor modal ──
  if (editingEntry || isCreating) {
    return (
      <JournalEntryScreen
        entry={editingEntry}
        onClose={handleCloseEditor}
      />
    );
  }

  const filterOptions: { key: FilterPeriod; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7 days' },
    { key: 'month', label: '30 days' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', padding: `${spacing.xl}px ${spacing.xl}px` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <h1
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.display,
              fontWeight: typography.weights.bold,
              color: colors.text,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Journal
          </h1>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              backgroundColor: palette.primary[600], border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={22} color={palette.neutral[50]} />
          </button>
        </div>

        {/* Search bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: spacing.md,
          }}
        >
          <Search
            size={18}
            color={colors.textMuted}
            style={{ position: 'absolute', left: spacing.md, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your entries..."
            style={{
              width: '100%',
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.text,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: `${spacing.md}px ${spacing.md}px ${spacing.md}px ${spacing.xl + spacing.sm}`,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = palette.primary[400])}
            onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: spacing.sm, top: '50%', transform: 'translateY(-50%)',
                width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
                backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} color={colors.textMuted} />
            </button>
          )}
        </div>

        {/* Date filter chips */}
        <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.xl, overflowX: 'auto' }}>
          {filterOptions.map((opt) => {
            const active = filter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.medium,
                  color: active ? palette.neutral[50] : colors.textSecondary,
                  backgroundColor: active ? palette.primary[600] : colors.surface,
                  border: `1px solid ${active ? palette.primary[600] : colors.border}`,
                  borderRadius: radii.full,
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Entries / Empty states */}
        {journal.length === 0 ? (
          <EmptyJournalState onCreate={() => setIsCreating(true)} />
        ) : filteredEntries.length === 0 ? (
          <NoResultsState query={searchQuery} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
            {groupedEntries.map((group) => (
              <div key={group.label}>
                {/* Date header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    marginBottom: spacing.md,
                  }}
                >
                  <Calendar size={14} color={colors.textMuted} />
                  <span
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                </div>

                {/* Entry cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {group.entries.map((entry) => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onEdit={() => handleEdit(entry)}
                      onDelete={() => setDeleteTarget(entry)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          entry={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Journal Card ────────────────────────────────────────────

function JournalCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const time = new Date(entry.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
      }}
      onClick={onEdit}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.borderStrong)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            {entry.mood > 0 && <span style={{ fontSize: 18 }}>{MOOD_EMOJIS[entry.mood]}</span>}
            <h3
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.title || 'Untitled'}
            </h3>
          </div>
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.caption,
              color: colors.textSecondary,
              margin: 0,
              lineHeight: typography.lineHeights.body,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.body || 'No content'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted }}>
              {time}
            </span>
            {entry.cravingLevel > 0 && (
              <span style={{ fontFamily: typography.fontFamily, fontSize: 11, color: palette.accent[400], fontWeight: typography.weights.medium }}>
                Craving: {entry.cravingLevel}/10
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: spacing.xs, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{
              width: 32, height: 32, borderRadius: radii.sm,
              backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Pencil size={14} color={colors.textSecondary} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              width: 32, height: 32, borderRadius: radii.sm,
              backgroundColor: colors.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={14} color={palette.error[500]} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty States ────────────────────────────────────────────

function EmptyJournalState({ onCreate }: { onCreate: () => void }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        textAlign: 'center',
        padding: `${spacing.xxl}px ${spacing.xl}`,
      }}
    >
      <div
        style={{
          width: 72, height: 72, borderRadius: '50%',
          backgroundColor: colors.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto', marginBottom: spacing.lg,
        }}
      >
        <BookOpen size={32} color={colors.textMuted} />
      </div>
      <h3
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.semibold,
          color: colors.text,
          margin: 0,
          marginBottom: spacing.sm,
        }}
      >
        No entries yet
      </h3>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.body,
          color: colors.textSecondary,
          margin: 0,
          marginBottom: spacing.xl,
          lineHeight: typography.lineHeights.body,
        }}
      >
        Writing helps process emotions and track patterns. Start your first reflection today.
      </p>
      <button
        onClick={onCreate}
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.semibold,
          color: palette.neutral[50],
          backgroundColor: palette.primary[600],
          border: 'none',
          borderRadius: radii.lg,
          padding: `${spacing.md}px ${spacing.xl}px`,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <Plus size={20} /> Write your first entry
      </button>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        textAlign: 'center',
        padding: `${spacing.xxl}px ${spacing.xl}`,
      }}
    >
      <div
        style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: colors.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto', marginBottom: spacing.lg,
        }}
      >
        <Search size={28} color={colors.textMuted} />
      </div>
      <h3
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.body,
          fontWeight: typography.weights.semibold,
          color: colors.text,
          margin: 0,
          marginBottom: spacing.xs,
        }}
      >
        No matching entries
      </h3>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.caption,
          color: colors.textSecondary,
          margin: 0,
        }}
      >
        {query ? `Nothing matches "${query}". Try a different search or filter.` : 'No entries in this time range. Try a wider filter.'}
      </p>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────

function DeleteConfirmModal({
  entry,
  onConfirm,
  onCancel,
}: {
  entry: JournalEntry;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: spacing.lg,
        animation: 'cm-fade-in 0.2s ease both',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          maxWidth: 400,
          width: '100%',
          boxShadow: shadows.xl,
          animation: 'cm-scale-in 0.25s ease both',
        }}
      >
        <div style={{ padding: spacing.xl, textAlign: 'center' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: palette.error[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', marginBottom: spacing.lg,
            }}
          >
            <Trash2 size={26} color={palette.error[500]} />
          </div>
          <h3
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.title,
              fontWeight: typography.weights.bold,
              color: colors.text,
              margin: 0,
              marginBottom: spacing.sm,
            }}
          >
            Delete this entry?
          </h3>
          <p
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.body,
              color: colors.textSecondary,
              margin: 0,
              marginBottom: spacing.xl,
              lineHeight: typography.lineHeights.body,
            }}
          >
            "{entry.title || 'Untitled'}" will be permanently removed. This can't be undone.
          </p>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: colors.text,
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.lg,
                padding: `${spacing.md}px`,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: palette.neutral[50],
                backgroundColor: palette.error[500],
                border: 'none',
                borderRadius: radii.lg,
                padding: `${spacing.md}px`,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
