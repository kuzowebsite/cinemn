import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadTaskSnapshot } from "firebase/storage"
import { db, storage } from "./firebase"

export interface Movie {
  id?: string
  title: string
  description: string
  coverImage: string
  detailImages: string[]
  videoUrl: string
  createdAt: Date
}

const MOVIES_COLLECTION = "movies"

// Upload file to Firebase Storage with real progress tracking
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  console.log("[v0] Starting file upload:", file.name, "to path:", path)
  console.log("[v0] File size:", (file.size / (1024 * 1024)).toFixed(2), "MB")

  try {
    const storageRef = ref(storage, path)

    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
      },
    })

    return new Promise((resolve, reject) => {
      // Set up timeout for very large files (30 minutes)
      const timeout = setTimeout(
        () => {
          uploadTask.cancel()
          reject(new Error("Upload timeout - файл хэт том эсвэл сүлжээний холболт удаан байна"))
        },
        30 * 60 * 1000,
      ) // 30 minutes

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          // Calculate real progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(
            `[v0] Upload progress: ${progress.toFixed(1)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`,
          )

          // Call progress callback if provided
          if (onProgress) {
            onProgress(progress)
          }

          // Log state changes
          switch (snapshot.state) {
            case "paused":
              console.log("[v0] Upload is paused")
              break
            case "running":
              console.log("[v0] Upload is running")
              break
          }
        },
        (error) => {
          clearTimeout(timeout)
          console.error("[v0] Upload error:", error)
          console.error("[v0] Failed to upload file:", file.name, "Size:", (file.size / (1024 * 1024)).toFixed(2), "MB")

          // Provide more specific error messages
          let errorMessage = "Файл хуулахад алдаа гарлаа"
          if (error.code === "storage/canceled") {
            errorMessage = "Файл хуулах үйлдэл цуцлагдлаа"
          } else if (error.code === "storage/quota-exceeded") {
            errorMessage = "Хадгалах сангийн хэмжээ дүүрсэн байна"
          } else if (error.code === "storage/unauthenticated") {
            errorMessage = "Нэвтрэх эрх хүрэлцэхгүй байна"
          } else if (error.code === "storage/retry-limit-exceeded") {
            errorMessage = "Файл хэт том эсвэл сүлжээний холболт тасарсан"
          }

          reject(new Error(errorMessage))
        },
        async () => {
          clearTimeout(timeout)
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log("[v0] File uploaded successfully:", downloadURL)
            console.log("[v0] Upload completed for file size:", (file.size / (1024 * 1024)).toFixed(2), "MB")
            resolve(downloadURL)
          } catch (error) {
            console.error("[v0] Error getting download URL:", error)
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error("[v0] Upload initialization error:", error)
    throw error
  }
}

// Delete file from Firebase Storage
export const deleteFile = async (url: string): Promise<void> => {
  const fileRef = ref(storage, url)
  await deleteObject(fileRef)
}

// Add new movie
export const addMovie = async (movieData: Omit<Movie, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, MOVIES_COLLECTION), {
    ...movieData,
    createdAt: new Date(),
  })
  return docRef.id
}

// Get all movies
export const getMovies = async (): Promise<Movie[]> => {
  try {
    console.log("[v0] Fetching movies from Firestore...")
    const q = query(collection(db, MOVIES_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    console.log("[v0] Successfully fetched", querySnapshot.docs.length, "movies")
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Movie,
    )
  } catch (error) {
    console.error("[v0] Error fetching movies:", error)
    // Return empty array instead of throwing error to prevent app crash
    return []
  }
}

// Get single movie
export const getMovie = async (id: string): Promise<Movie | null> => {
  try {
    console.log("[v0] Fetching movie with id:", id)
    const docRef = doc(db, MOVIES_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log("[v0] Successfully fetched movie:", docSnap.id)
      return { id: docSnap.id, ...docSnap.data() } as Movie
    }
    console.log("[v0] Movie not found with id:", id)
    return null
  } catch (error) {
    console.error("[v0] Error fetching movie:", error)
    return null
  }
}

// Update movie
export const updateMovie = async (id: string, movieData: Partial<Movie>): Promise<void> => {
  const docRef = doc(db, MOVIES_COLLECTION, id)
  await updateDoc(docRef, movieData)
}

// Delete movie
export const deleteMovie = async (id: string): Promise<void> => {
  const docRef = doc(db, MOVIES_COLLECTION, id)
  await deleteDoc(docRef)
}

export const getAllMovies = getMovies
export const getMovieById = getMovie
