import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
    logoUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async () => {
            return {}
        })
        .onUploadComplete(async ({ file }) => {
            return { url: file.ufsUrl }
        }),

    productImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
        .middleware(async () => {
            return {}
        })
        .onUploadComplete(async ({ file }) => {
            return { url: file.ufsUrl }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter