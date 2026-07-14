<template>
  <v-dialog v-model="isOpen" max-width="440">
    <v-card class="settle-card">
      <div class="settle-head">
        <h3 class="settle-title">Settle up with {{ payeeName }}</h3>
      </div>

      <div class="settle-body">
        <v-text-field
          label="Amount"
          type="number"
          prefix="$"
          v-model.number="amount"
          :error-messages="amountError"
          density="comfortable"
        ></v-text-field>

        <v-text-field
          label="Note (optional)"
          v-model="note"
          density="comfortable"
        ></v-text-field>

        <v-alert v-if="error" type="error" density="compact" class="settle-alert">{{ error }}</v-alert>
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="secondary" :loading="isSaving" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useSettlementStore } from '../stores/Settlement'
import { roundToCents } from '../utils/money'

interface SettleUpDialogProps {
  modelValue: boolean
  payeeUserId: string
  payeeName: string
  maxAmount: number
}

export default defineComponent({
  name: 'eaSettleUpDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    payeeUserId: {
      type: String,
      required: true
    },
    payeeName: {
      type: String,
      required: true
    },
    maxAmount: {
      type: Number,
      required: true
    }
  },
  emits: ['update:modelValue', 'settled'],

  setup(props: SettleUpDialogProps, { emit }) {
    const settlementStore = useSettlementStore()

    const amount = ref(props.maxAmount)
    const note = ref('')

    const isOpen = computed({
      get: () => props.modelValue,
      set: (value: boolean) => emit('update:modelValue', value)
    })

    // Reset the form each time the dialog is (re)opened for a new row.
    watch(
      () => props.modelValue,
      (open) => {
        if (open) {
          amount.value = props.maxAmount
          note.value = ''
        }
      }
    )

    const isSaving = computed(() => settlementStore.isSaving)
    const error = computed(() => settlementStore.error)

    const amountError = computed(() => {
      const rounded = roundToCents(amount.value)
      if (rounded <= 0) return 'Amount must be greater than 0'
      if (rounded > roundToCents(props.maxAmount)) return `Amount cannot exceed $${props.maxAmount}`
      return ''
    })

    const cancel = () => {
      isOpen.value = false
    }

    const confirm = async () => {
      if (amountError.value) return
      try {
        await settlementStore.CreateSettlement({
          payeeUserId: props.payeeUserId,
          amount: roundToCents(amount.value),
          note: note.value || undefined
        })
        emit('settled')
        isOpen.value = false
      } catch {
        // store.error already holds the message for display
      }
    }

    return {
      isOpen,
      amount,
      note,
      isSaving,
      error,
      amountError,
      cancel,
      confirm
    }
  }
})
</script>

<style scoped>
.settle-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
}

.settle-head {
  margin-bottom: 16px;
}

.settle-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--ea-ink);
}

.settle-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settle-alert {
  margin-top: 8px;
}
</style>
