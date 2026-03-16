export const en = {
  app: {
    title: 'Habit Tracker',
    loading: 'Loading...',
    error: 'Error: {error}',
    initError: 'Failed to initialize application',
    loadHabitsError: 'Failed to load habits',
    toggleCompletionError: 'Failed to toggle habit completion',
    deleteHabitError: 'Failed to delete habit',
  },
  habitForm: {
    title: {
      create: 'Create New Habit',
      edit: 'Edit Habit',
    },
    labels: {
      name: 'Name',
      description: 'Description',
      required: '*',
    },
    buttons: {
      create: 'Create Habit',
      update: 'Update Habit',
      cancel: 'Cancel',
      saving: 'Saving...',
    },
    validation: {
      nameRequired: 'Name is required',
    },
    success: {
      created: 'Habit created successfully!',
      updated: 'Habit updated successfully!',
    },
    error: {
      saveFailed: 'Failed to save habit. Please try again.',
      saveFailedGeneric: 'Failed to save habit',
    },
    aria: {
      createForm: 'Create habit form',
      editForm: 'Edit habit form',
    },
  },
  habitList: {
    loading: 'Loading habits...',
    error: 'Error loading habits: {error}',
    empty: 'No habits yet. Start by creating your first habit!',
    unnamedHabit: 'Unnamed Habit',
    thisHabit: 'this habit',
    buttons: {
      markDone: 'Mark as done',
      completed: '✓ Completed',
      updating: 'Updating...',
      edit: 'Edit',
      delete: 'Delete',
    },
    aria: {
      markCompleted: 'Mark as completed today',
      markNotCompleted: 'Mark as not completed today',
      editHabit: 'Edit {name}',
      deleteHabit: 'Delete {name}',
      habitNameFallback: 'habit',
      list: 'List of habits',
    },
    deleteModal: {
      title: 'Delete Habit',
      message: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
      confirm: 'Delete',
      cancel: 'Cancel',
      confirming: 'Deleting...',
    },
  },
  confirmationModal: {
    defaultConfirm: 'Confirm',
    defaultCancel: 'Cancel',
    defaultProcessing: 'Processing...',
  },
  installPrompt: {
    button: 'Install',
    ariaLabel: 'Install Habit Tracker app',
    title: 'Install Habit Tracker app',
  },
  offlineIndicator: {
    badge: 'offline',
    ariaLabel: 'Offline status indicator',
  },
  streakBadge: {
    ariaLabel: '{streak}-day streak',
  },
  annualCalendar: {
    ariaLabel: 'Annual completion calendar for {name}',
    nameFallback: 'habit',
    today: 'Today, {date}',
    date: '{date}',
  },
  errorFallback: {
    reloadButton: 'Reload Page',
  },
  errorBoundary: {
    reactRenderError: 'Something went wrong. Please refresh the page.',
  },
} as const
