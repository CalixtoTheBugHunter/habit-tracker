export const ptBR = {
  app: {
    title: 'Rastreador de Hábitos',
    loading: 'Carregando...',
    error: 'Erro: {error}',
    initError: 'Falha ao inicializar o aplicativo',
    loadHabitsError: 'Falha ao carregar hábitos',
    toggleCompletionError: 'Falha ao marcar conclusão do hábito',
    updateHabitError: 'Falha ao atualizar hábito',
    deleteHabitError: 'Falha ao excluir hábito',
  },
  habitForm: {
    title: {
      create: 'Criar Novo Hábito',
      edit: 'Editar Hábito',
    },
    labels: {
      name: 'Nome',
      description: 'Descrição',
      required: '*',
    },
    buttons: {
      create: 'Criar Hábito',
      update: 'Atualizar Hábito',
      cancel: 'Cancelar',
      saving: 'Salvando...',
    },
    validation: {
      nameRequired: 'O nome é obrigatório',
    },
    success: {
      created: 'Hábito criado com sucesso!',
      updated: 'Hábito atualizado com sucesso!',
    },
    error: {
      saveFailed: 'Falha ao salvar hábito. Tente novamente.',
      saveFailedGeneric: 'Falha ao salvar hábito',
    },
    aria: {
      createForm: 'Formulário de criação de hábito',
      editForm: 'Formulário de edição de hábito',
    },
    stacking: {
      label: 'Cadeia de hábitos',
      placeholder: 'Digite para buscar hábitos...',
      empty: 'Nenhum hábito para adicionar.',
      addNewStepHint: 'Pressione Adicionar ou Enter para criar como nova etapa',
      addAria: 'Adicionar hábito à cadeia',
      addButton: 'Adicionar',
      removeAria: 'Remover {name} da cadeia de hábitos',
    },
  },
  habitList: {
    loading: 'Carregando hábitos...',
    error: 'Erro ao carregar hábitos: {error}',
    empty: 'Ainda não há hábitos. Comece criando seu primeiro hábito!',
    unnamedHabit: 'Hábito Sem Nome',
    thisHabit: 'este hábito',
    buttons: {
      markDone: 'Marcar como feito',
      completed: '✓ Concluído',
      updating: 'Atualizando...',
      edit: 'Editar',
      delete: 'Excluir',
    },
    aria: {
      markCompleted: 'Marcar como concluído hoje',
      markNotCompleted: 'Marcar como não concluído hoje',
      editHabit: 'Editar {name}',
      deleteHabit: 'Excluir {name}',
      habitNameFallback: 'hábito',
      list: 'Lista de hábitos',
    },
    deleteModal: {
      title: 'Excluir Hábito',
      message:
        'Tem certeza de que deseja excluir "{name}"? Esta ação não pode ser desfeita.',
      confirm: 'Excluir',
      cancel: 'Cancelar',
      confirming: 'Excluindo...',
    },
    stacking: {
      title: 'Cadeia de hábitos',
      expandAria: 'Expandir cadeia de hábitos de {name}',
      collapseAria: 'Encolher cadeia de hábitos de {name}',
      regionAria: 'Cadeia de hábitos de {name}',
      unknownHabit: 'Hábito desconhecido',
      checkboxAria: 'Marcar {name} como feito hoje',
      removeModal: {
        title: 'Remover da sequência',
        message: 'Remover "{name}" dos hábitos em sequência?',
        confirm: 'Remover',
        cancel: 'Cancelar',
        confirming: 'Removendo...',
      },
      removeButtonAria: 'Remover {name} da sequência',
    },
  },
  confirmationModal: {
    defaultConfirm: 'Confirmar',
    defaultCancel: 'Cancelar',
    defaultProcessing: 'Processando...',
  },
  installPrompt: {
    button: 'Instalar',
    ariaLabel: 'Instalar aplicativo Rastreador de Hábitos',
    title: 'Instalar aplicativo Rastreador de Hábitos',
  },
  offlineIndicator: {
    badge: 'offline',
    ariaLabel: 'Indicador de status offline',
  },
  streakBadge: {
    ariaLabel: 'Dias de sequência: {streak}',
  },
  annualCalendar: {
    ariaLabel: 'Calendário anual de conclusão para {name}',
    nameFallback: 'hábito',
    today: 'Hoje, {date}',
    date: '{date}',
  },
  errorFallback: {
    reloadButton: 'Recarregar Página',
  },
  errorBoundary: {
    reactRenderError: 'Algo deu errado. Atualize a página.',
  },
  appHeader: {
    menuButtonOpenAria: 'Abrir menu',
    menuButtonCloseAria: 'Fechar menu',
  },
  sideMenu: {
    navigationAria: 'Navegação principal',
    home: 'Início',
    statistics: 'Estatísticas',
    settings: 'Configurações',
  },
  statistics: {
    title: 'Estatísticas',
    empty: 'Ainda não há hábitos. Crie um hábito para ver estatísticas!',
    currentStreak: 'Sequência atual',
    longestStreak: 'Maior sequência',
    completionRate: 'Taxa de conclusão',
    weeklyRate: 'Últimos 7 dias',
    monthlyRate: 'Últimos 30 dias',
    totalDaysTracked: 'Dias rastreados',
    daysUnit: 'dias',
  },
  settings: {
    title: 'Configurações',
    close: 'Fechar configurações',
    preferredLanguage: 'Idioma',
    languageSelectAria: 'Idioma',
    changelogTitle: 'Atualizações',
    changelogBack: 'Voltar às configurações',
    changelogLoadError:
      'Não foi possível carregar as atualizações. Verifique a conexão e tente novamente.',
    changelogRetry: 'Tentar novamente',
    changelogExternalLinkSuffix: ', abre em nova aba',
    items: {
      changelog: 'Atualizações',
    },
  },
} as const
