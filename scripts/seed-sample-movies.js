// Sample movie data seeding script
// This will add some sample movies to test the database connection

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCCLE5YaaA19xEQjhxnuYRDY16kmz5CpUM",
  authDomain: "nexora-79493.firebaseapp.com",
  databaseURL: "https://nexora-79493-default-rtdb.firebaseio.com",
  projectId: "nexora-79493",
  storageBucket: "nexora-79493.firebasestorage.app",
  messagingSenderId: "592841812290",
  appId: "1:592841812290:web:909d532853040ce6a9c0db",
  measurementId: "G-RWCLYDZMPW",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleMovies = [
  {
    title: "Эпик Fantasy",
    description: "Уул, баатрууд бүхий гайхамшигтай fantasy кино",
    coverImage: "/epic-fantasy-movie-scene-with-mountains-and-heroes.jpg",
    detailImages: ["/epic-fantasy-movie-scene-with-mountains-and-heroes.jpg"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    genre: "Fantasy",
    year: 2024,
    rating: 8.5,
    createdAt: new Date(),
  },
  {
    title: "Сансрын тулаан",
    description: "Ирээдүйн сансрын хөлөг онгоц, одод бүхий тулаан",
    coverImage: "/futuristic-space-battle-with-spaceships-and-stars.jpg",
    detailImages: ["/futuristic-space-battle-with-spaceships-and-stars.jpg"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    genre: "Sci-Fi",
    year: 2024,
    rating: 9.0,
    createdAt: new Date(),
  },
  {
    title: "Нууцлаг хот",
    description: "Шөнийн неон гэрэл бүхий нууцлаг харанхуй хот",
    coverImage: "/mysterious-dark-city-at-night-with-neon-lights.jpg",
    detailImages: ["/mysterious-dark-city-at-night-with-neon-lights.jpg"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    genre: "Mystery",
    year: 2024,
    rating: 7.8,
    createdAt: new Date(),
  },
]

async function seedMovies() {
  try {
    console.log("Starting to seed sample movies...")

    for (const movie of sampleMovies) {
      const docRef = await addDoc(collection(db, "movies"), movie)
      console.log("Added movie with ID:", docRef.id, "- Title:", movie.title)
    }

    console.log("Successfully seeded", sampleMovies.length, "sample movies!")
    console.log("You can now test the movie website with real data.")
  } catch (error) {
    console.error("Error seeding movies:", error)
    console.log("Make sure you have applied the Firestore security rules first!")
  }
}

seedMovies()
