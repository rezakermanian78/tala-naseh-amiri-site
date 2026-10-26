import { useEffect } from 'react'

// Which editors currently hold unsaved changes. Used for the tab-switch prompt and the
// browser's "leave site?" warning.
const dirty = new Set<string>()

export const hasUnsavedChanges = () => dirty.size > 0

export function useDirtyFlag(id: string, isDirty: boolean) {
  useEffect(() => {
    if (isDirty) dirty.add(id)
    else dirty.delete(id)
    return () => {
      dirty.delete(id)
    }
  }, [id, isDirty])
}
