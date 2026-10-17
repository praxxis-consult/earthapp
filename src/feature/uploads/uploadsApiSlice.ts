import { apiSlice } from '../../app/api/apiSlice'

/** SELFIE and PRODUCT_IMAGE are public (a URL comes back); CHAT_MEDIA is private to the conversation. */
export type UploadPurpose = 'SELFIE' | 'PRODUCT_IMAGE' | 'CHAT_MEDIA'

export interface UploadInput {
  file: File
  purpose: UploadPurpose
  /** Required for CHAT_MEDIA: the conversation the file belongs to. */
  conversationId?: string
}

/**
 * One file to the API's media store. Public images (JPEG/PNG up to 5 MiB) answer with a URL that
 * goes into a profile or listing; chat media (JPEG/PNG/WebP up to 10 MiB, MP4 up to 50 MiB) answers
 * with an id only, and the chat message that carries it is what makes it readable.
 */
export const uploadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ id: string; url: string | null; purpose: UploadPurpose }, UploadInput>({
      query: ({ file, purpose, conversationId }) => {
        const body = new FormData()
        body.append('file', file)
        body.append('purpose', purpose)
        if (conversationId) body.append('conversationId', conversationId)
        return { url: '/uploads', method: 'POST', body }
      },
    }),
  }),
})

export const { useUploadImageMutation } = uploadsApiSlice
