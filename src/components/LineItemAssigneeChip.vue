<template>
  <div class="chip-wrap">
    <button type="button" class="assignee-chip" :aria-label="`Assigned to ${label}`">
      <span class="avatar-stack">
        <span v-for="a in stackAvatars" :key="a.userId" class="friend-avatar chip-avatar">{{
          a.initial
        }}</span>
      </span>
      <span class="chip-label">{{ label }}</span>
    </button>

    <v-menu v-model="menuOpen" activator="parent" :close-on-content-click="false" location="bottom start">
      <v-card class="assignee-menu" min-width="240">
        <v-list density="compact" class="assignee-list">
          <v-list-item v-for="row in filteredRows" :key="row.userId" class="assignee-list-item">
            <v-tooltip
              :disabled="!isSoleAssignee(row.userId)"
              text="A line item needs at least one assignee"
              location="top"
            >
              <template v-slot:activator="{ props: tooltipProps }">
                <div v-bind="tooltipProps">
                  <v-checkbox
                    :model-value="isChecked(row.userId)"
                    :disabled="isSoleAssignee(row.userId)"
                    :label="row.userName"
                    hide-details
                    density="compact"
                    @update:model-value="(checked: boolean | null) => onToggle(row.userId, !!checked)"
                  ></v-checkbox>
                </div>
              </template>
            </v-tooltip>
          </v-list-item>
        </v-list>
        <v-text-field
          v-model="search"
          placeholder="Search friends…"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          class="assignee-search"
        ></v-text-field>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import type { LineItemAssigneeDto } from '@/models/LineItemDto'
import type { UserDto } from '@/models/UserDto'

const MAX_STACK_AVATARS = 3

export default defineComponent({
  name: 'eaLineItemAssigneeChip',

  props: {
    assignees: {
      type: Array as () => LineItemAssigneeDto[],
      required: true
    },
    friends: {
      type: Array as () => UserDto[],
      required: true
    },
    creatorUserId: {
      type: String,
      required: true
    },
    lineItemId: {
      type: String,
      required: true
    }
  },
  emits: ['toggle-assignee'],

  setup(props, { emit }) {
    const menuOpen = ref(false)
    const search = ref('')

    // Wireframe copy: "You" alone, "You + Priya" for two, "3 people" for three or more.
    // "You" is always ordered first when the current user is among the assignees.
    const label = computed(() => {
      const rawNames = props.assignees.map((a) =>
        a.userId === props.creatorUserId ? 'You' : a.userName
      )
      if (rawNames.length === 0) return 'Unassigned'
      const names = rawNames.includes('You')
        ? ['You', ...rawNames.filter((name) => name !== 'You')]
        : rawNames
      if (names.length === 1) return names[0]
      if (names.length === 2) return `${names[0]} + ${names[1]}`
      return `${names.length} people`
    })

    const stackAvatars = computed(() => {
      const shown = props.assignees.slice(0, MAX_STACK_AVATARS).map((a) => ({
        userId: a.userId,
        initial: a.userId === props.creatorUserId ? 'Y' : (a.userName || '?').charAt(0).toUpperCase()
      }))
      const overflow = props.assignees.length - shown.length
      if (overflow > 0) shown.push({ userId: '__overflow', initial: `+${overflow}` })
      return shown
    })

    // Checklist offers every friend plus a "You" row for the creator, since the
    // creator isn't necessarily present in the caller's own friends list.
    const checklistRows = computed(() => {
      const rows = [{ userId: props.creatorUserId, userName: 'You' }]
      for (const friend of props.friends) {
        const friendUserId = String(friend.id)
        if (friendUserId === props.creatorUserId) continue
        rows.push({ userId: friendUserId, userName: friend.username })
      }
      return rows
    })

    const filteredRows = computed(() => {
      const query = search.value.trim().toLowerCase()
      if (!query) return checklistRows.value
      return checklistRows.value.filter((row) => row.userName.toLowerCase().includes(query))
    })

    const isChecked = (userId: string): boolean =>
      props.assignees.some((a) => a.userId === userId)

    const isSoleAssignee = (userId: string): boolean =>
      props.assignees.length === 1 && props.assignees[0].userId === userId

    const onToggle = (userId: string, checked: boolean) => {
      if (!checked && isSoleAssignee(userId)) return
      emit('toggle-assignee', userId, checked)
    }

    return {
      menuOpen,
      search,
      label,
      stackAvatars,
      filteredRows,
      isChecked,
      isSoleAssignee,
      onToggle
    }
  }
})
</script>

<style scoped>
.chip-wrap {
  display: inline-block;
  position: relative;
}

.assignee-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--ea-border);
  background: var(--ea-surface);
  border-radius: 999px;
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.assignee-chip:hover {
  border-color: var(--ea-emerald);
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.friend-avatar.chip-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ea-ink);
  color: #fff;
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--ea-surface);
}

.avatar-stack .chip-avatar + .chip-avatar {
  margin-left: -8px;
}

.chip-label {
  font-size: 12px;
  color: var(--ea-muted);
  white-space: nowrap;
}

.assignee-menu {
  padding: 8px;
}

.assignee-list {
  max-height: 220px;
  overflow-y: auto;
}

.assignee-search {
  margin-top: 8px;
}
</style>
