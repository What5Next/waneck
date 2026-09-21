import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { capturePayPalOrder, createPayPalOrder } from '@/lib/api/paypal'
import { queryKeys } from '@/lib/api/query-keys'

export function useCreatePayPalOrderMutation() {
  return useMutation({
    mutationFn: createPayPalOrder,
    onError: () => {
      toast.error('Failed to start PayPal checkout.')
    },
  })
}

export function useCapturePayPalOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: capturePayPalOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
      toast.success('Nex has been added to your balance.')
    },
    onError: () => {
      toast.error('Payment could not be completed.')
    },
  })
}
