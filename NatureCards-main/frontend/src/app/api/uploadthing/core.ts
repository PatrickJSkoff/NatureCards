import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define a route for plant images
  plantImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // Allow anonymous uploads with no auth check
      // For public image uploads, this is fine
      return { userId: null };
    })
    .onUploadComplete(async ({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for anonymous user");
      console.log("File URL:", file.ufsUrl);

      // Return the file URL for client use
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 