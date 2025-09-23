import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

// Admin credentials - in production, this should be stored securely
const ADMIN_EMAIL = "admin@nexora.com"

const getRegisteredAdmins = (): string[] => {
  if (typeof window === "undefined") return [ADMIN_EMAIL]
  try {
    const stored = localStorage.getItem("registeredAdmins")
    console.log("[v0] Raw localStorage data:", stored)

    let admins: string[]
    if (stored) {
      admins = JSON.parse(stored)
      // Ensure default admin is always included
      if (!admins.includes(ADMIN_EMAIL)) {
        admins.push(ADMIN_EMAIL)
      }
    } else {
      admins = [ADMIN_EMAIL]
    }

    console.log("[v0] Registered admins:", admins)
    return admins
  } catch (error) {
    console.log("[v0] Error reading registered admins:", error)
    return [ADMIN_EMAIL]
  }
}

const addRegisteredAdmin = (email: string): void => {
  if (typeof window === "undefined") return
  try {
    const admins = getRegisteredAdmins()
    console.log("[v0] Current admins before adding:", admins)

    if (!admins.includes(email)) {
      admins.push(email)
      localStorage.setItem("registeredAdmins", JSON.stringify(admins))
      console.log("[v0] Added new admin:", email, "Updated list:", admins)

      // Verify the storage worked
      const verification = localStorage.getItem("registeredAdmins")
      console.log("[v0] Verification - stored data:", verification)
    } else {
      console.log("[v0] Admin already exists:", email)
    }
  } catch (error) {
    console.log("[v0] Error adding admin:", error)
  }
}

const createAdminDocument = async (user: User): Promise<void> => {
  try {
    const adminDocRef = doc(db, "admins", user.uid)
    await setDoc(adminDocRef, {
      email: user.email,
      createdAt: new Date(),
      role: "admin",
    })
    console.log("[v0] Admin document created in Firestore for:", user.email)
  } catch (error) {
    console.error("[v0] Error creating admin document:", error)
  }
}

export const signInAdmin = async (email: string, password: string): Promise<User> => {
  console.log("[v0] Attempting admin login for:", email)

  // First authenticate with Firebase
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  // Then check if user is registered as admin
  const registeredAdmins = getRegisteredAdmins()
  console.log("[v0] Checking admin status for:", email, "against:", registeredAdmins)

  if (!registeredAdmins.includes(email)) {
    // Sign out the user since they're not an admin
    await signOut(auth)
    throw new Error("Зөвхөн админ нэвтрэх боломжтой")
  }

  console.log("[v0] Admin login successful for:", email)
  return userCredential.user
}

export const signOutAdmin = async (): Promise<void> => {
  await signOut(auth)
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) return false
  const registeredAdmins = getRegisteredAdmins()
  return registeredAdmins.includes(user.email)
}

export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName })
  return userCredential.user
}

export const registerAdmin = async (email: string, password: string): Promise<User> => {
  console.log("[v0] Starting admin registration for:", email)

  try {
    // First create the Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log("[v0] Firebase user created successfully")

    // Create admin document in Firestore
    await createAdminDocument(userCredential.user)

    // Then add to admin list (for backward compatibility)
    addRegisteredAdmin(email)

    // Verify the admin was added
    const updatedAdmins = getRegisteredAdmins()
    console.log("[v0] Final admin list after registration:", updatedAdmins)

    console.log("[v0] Admin registration completed successfully for:", email)
    return userCredential.user
  } catch (error) {
    console.log("[v0] Admin registration failed:", error)
    throw error
  }
}

export const signInUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const signOutUser = async (): Promise<void> => {
  await signOut(auth)
}

export const isAdminInFirestore = async (user: User | null): Promise<boolean> => {
  if (!user) return false

  try {
    const adminDocRef = doc(db, "admins", user.uid)
    const adminDoc = await getDoc(adminDocRef)
    return adminDoc.exists()
  } catch (error) {
    console.error("[v0] Error checking admin status in Firestore:", error)
    return false
  }
}
