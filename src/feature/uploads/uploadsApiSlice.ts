import { apiSlice } from '../../app/api/apiSlice'

export type UploadPurpose = 'SELFIE' | 'PRODUCT_IMAGE'

/** One JPEG/PNG (up to 5 MiB) to the API's image store; the URL goes into a profile or listing. */
export const uploadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ id: string; url: string; purpose: UploadPurpose }, { file: File; purpose: UploadPurpose }>({
      query: ({ file, purpose }) => {
        const body = new FormData()
        body.append('file', file)
        body.append('purpose', purpose)
        return { url: '/uploads', method: 'POST', body }
      },
    }),
  }),
})

export const { useUploadImageMutation } = uploadsApiSlice
