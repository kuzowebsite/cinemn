import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import type { User as FirebaseUser } from "firebase/auth"
import { auth, db } from "@/lib/firebase"

export interface User {
  id: string
  email: string
  displayName: string
  profileName: string
  status: "pending" | "approved" | "expired" | "rejected"
  accessStartDate?: Date
  accessEndDate?: Date
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
  requiresPasswordReset?: boolean
}

export interface RegistrationRequest {
  id: string
  email: string
  displayName: string
  profileName: string
  password: string
  status: "pending"
  createdAt: Date
}

export const getCurrentUser = (): any | null => {
  if (typeof window === "undefined") return null

  try {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      return JSON.parse(storedUser)
    }
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    localStorage.removeItem("currentUser")
  }

  return null
}

export const signOutCurrentUser = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
  }
}

export const ensureAdminDocument = async (user: FirebaseUser): Promise<void> => {
  try {
    console.log("[v0] Ensuring admin document exists for:", user.email)
    const adminDocRef = doc(db, "admins", user.uid)
    const adminDoc = await getDoc(adminDocRef)

    if (!adminDoc.exists()) {
      console.log("[v0] Admin document doesn't exist, creating...")
      await setDoc(adminDocRef, {
        email: user.email,
        createdAt: new Date(),
        role: "admin",
      })
      console.log("[v0] Admin document created successfully")
    } else {
      console.log("[v0] Admin document already exists")
    }
  } catch (error) {
    console.error("[v0] Error ensuring admin document:", error)
    throw error
  }
}

// User Management Functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log("[v0] Starting getAllUsers function...")

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to access user data")
    }

    console.log("[v0] Current authenticated user:", currentUser.email)

    await ensureAdminDocument(currentUser)

    const usersRef = collection(db, "users")
    const q = query(usersRef, orderBy("createdAt", "desc"))
    console.log("[v0] Created query for users collection")

    const querySnapshot = await getDocs(q)
    console.log("[v0] Query executed, found", querySnapshot.docs.length, "users")

    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log("[v0] Processing user:", doc.id, data)
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        profileName: data.profileName,
        status: data.status,
        accessStartDate: data.accessStartDate?.toDate(),
        accessEndDate: data.accessEndDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        approvedBy: data.approvedBy,
        requiresPasswordReset: data.requiresPasswordReset || false,
      }
    })

    console.log("[v0] getAllUsers completed successfully, returning", users.length, "users")
    return users
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    console.error("[v0] Error code:", (error as any)?.code)
    console.error("[v0] Error message:", (error as any)?.message)
    throw error
  }
}

export const getPendingRegistrations = async (): Promise<RegistrationRequest[]> => {
  try {
    console.log("[v0] Starting getPendingRegistrations function...")

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to access registration requests")
    }

    console.log("[v0] Current authenticated user:", currentUser.email)

    await ensureAdminDocument(currentUser)

    const registrationsRef = collection(db, "registrationRequests")
    const q = query(registrationsRef, where("status", "==", "pending"))
    console.log("[v0] Created simplified query for registrationRequests collection")

    const querySnapshot = await getDocs(q)
    console.log("[v0] Query executed, found", querySnapshot.docs.length, "pending registrations")

    const requests = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log("[v0] Processing registration request:", doc.id, data)
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        profileName: data.profileName,
        password: data.password,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
      }
    })

    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    console.log("[v0] getPendingRegistrations completed successfully, returning", requests.length, "requests")
    return requests
  } catch (error) {
    console.error("[v0] Error fetching pending registrations:", error)
    console.error("[v0] Error code:", (error as any)?.code)
    console.error("[v0] Error message:", (error as any)?.message)
    throw error
  }
}

export const getExpiredUsers = async (): Promise<User[]> => {
  try {
    console.log("[v0] Starting getExpiredUsers function...")

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to access expired users")
    }

    console.log("[v0] Current authenticated user:", currentUser.email)

    await ensureAdminDocument(currentUser)

    const usersRef = collection(db, "users")
    const q = query(usersRef, where("status", "==", "expired"))
    console.log("[v0] Created simplified query for expired users")

    const querySnapshot = await getDocs(q)
    console.log("[v0] Query executed, found", querySnapshot.docs.length, "expired users")

    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log("[v0] Processing expired user:", doc.id, data)
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        profileName: data.profileName,
        status: data.status,
        accessStartDate: data.accessStartDate?.toDate(),
        accessEndDate: data.accessEndDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        approvedBy: data.approvedBy,
        requiresPasswordReset: data.requiresPasswordReset || false,
      }
    })

    users.sort((a, b) => {
      const dateA = a.accessEndDate?.getTime() || 0
      const dateB = b.accessEndDate?.getTime() || 0
      return dateB - dateA
    })

    console.log("[v0] getExpiredUsers completed successfully, returning", users.length, "users")
    return users
  } catch (error) {
    console.error("[v0] Error fetching expired users:", error)
    console.error("[v0] Error code:", (error as any)?.code)
    console.error("[v0] Error message:", (error as any)?.message)
    throw error
  }
}

export const submitRegistrationRequest = async (
  email: string,
  displayName: string,
  profileName: string,
  password: string,
): Promise<void> => {
  try {
    console.log("[v0] Starting registration request submission...")
    console.log("[v0] Email:", email)
    console.log("[v0] Display Name:", displayName)
    console.log("[v0] Profile Name:", profileName)

    const registrationRef = doc(collection(db, "registrationRequests"))
    console.log("[v0] Created document reference:", registrationRef.id)

    const registrationData = {
      email,
      displayName,
      profileName,
      password, // In production, this should be hashed
      status: "pending",
      createdAt: Timestamp.now(),
    }

    console.log("[v0] Registration data:", registrationData)

    await setDoc(registrationRef, registrationData)

    console.log("[v0] Registration request submitted successfully")
  } catch (error) {
    console.error("[v0] Error submitting registration request:", error)
    console.error("[v0] Error code:", (error as any)?.code)
    console.error("[v0] Error message:", (error as any)?.message)

    if ((error as any)?.code === "permission-denied") {
      throw new Error("Firebase Firestore rules шаардлагатай. Админтай холбогдоно уу.")
    }

    throw error
  }
}

export const approveRegistration = async (
  requestId: string,
  accessStartDate: Date,
  accessEndDate: Date,
  approvedBy: string,
): Promise<void> => {
  try {
    console.log("[v0] Starting registration approval process...")

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to approve registrations")
    }

    console.log("[v0] Current admin user:", currentUser.email)
    await ensureAdminDocument(currentUser)

    // Get the registration request
    const requestRef = doc(db, "registrationRequests", requestId)
    const requestDoc = await getDoc(requestRef)

    if (!requestDoc.exists()) {
      throw new Error("Registration request not found")
    }

    const requestData = requestDoc.data()
    console.log("[v0] Registration request data:", requestData)

    // Generate a unique user ID
    const userRef = doc(collection(db, "users"))
    const userId = userRef.id

    console.log("[v0] Creating user document with ID:", userId)

    // Create user document in Firestore
    await setDoc(userRef, {
      email: requestData.email,
      displayName: requestData.displayName,
      profileName: requestData.profileName,
      password: requestData.password, // Store temporarily - user will set new password on first login
      status: "approved",
      accessStartDate: Timestamp.fromDate(accessStartDate),
      accessEndDate: Timestamp.fromDate(accessEndDate),
      createdAt: requestData.createdAt,
      approvedAt: Timestamp.now(),
      approvedBy,
      requiresPasswordReset: true, // Flag to require password reset on first login
    })
    console.log("[v0] User document created in Firestore")

    // Delete the registration request
    await deleteDoc(requestRef)
    console.log("[v0] Registration request deleted successfully")

    console.log("[v0] Registration approval completed successfully")
  } catch (error) {
    console.error("[v0] Error approving registration:", error)
    throw error
  }
}

export const rejectRegistration = async (requestId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to reject registrations")
    }

    await ensureAdminDocument(currentUser)

    const requestRef = doc(db, "registrationRequests", requestId)
    await deleteDoc(requestRef)

    console.log("[v0] Registration rejected successfully")
  } catch (error) {
    console.error("[v0] Error rejecting registration:", error)
    throw error
  }
}

export const updateUserAccess = async (userId: string, accessStartDate: Date, accessEndDate: Date): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to update user access")
    }

    await ensureAdminDocument(currentUser)

    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      accessStartDate: Timestamp.fromDate(accessStartDate),
      accessEndDate: Timestamp.fromDate(accessEndDate),
      status: new Date() > accessEndDate ? "expired" : "approved",
    })

    console.log("[v0] User access updated successfully")
  } catch (error) {
    console.error("[v0] Error updating user access:", error)
    throw error
  }
}

export const checkUserAccess = async (
  email: string,
  password: string,
): Promise<{ success: boolean; user?: any; message?: string }> => {
  try {
    console.log("[v0] Checking user access for:", email)

    // Query users by email
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return { success: false, message: "Хэрэглэгч олдсонгүй" }
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    console.log("[v0] Found user:", userData)

    // Check password
    if (userData.password !== password) {
      return { success: false, message: "Нууц үг буруу байна" }
    }

    // Check if user is approved
    if (userData.status !== "approved") {
      if (userData.status === "pending") {
        return { success: false, message: "Таны бүртгэл хараахан зөвшөөрөгдөөгүй байна" }
      } else if (userData.status === "expired") {
        return { success: false, message: "Таны эрх дууссан байна" }
      } else {
        return { success: false, message: "Бүртгэл идэвхгүй байна" }
      }
    }

    // Check access dates
    const now = new Date()
    const accessStartDate = userData.accessStartDate?.toDate()
    const accessEndDate = userData.accessEndDate?.toDate()

    if (accessStartDate && now < accessStartDate) {
      return { success: false, message: "Таны эрх хараахан эхлээгүй байна" }
    }

    if (accessEndDate && now > accessEndDate) {
      // Update status to expired
      await updateDoc(userDoc.ref, { status: "expired" })
      return { success: false, message: "Таны эрх дууссан байна" }
    }

    return {
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        profileName: userData.profileName,
        requiresPasswordReset: userData.requiresPasswordReset || false,
      },
    }
  } catch (error) {
    console.error("[v0] Error checking user access:", error)

    if ((error as any)?.code === "permission-denied") {
      console.error("[v0] Permission denied - Firestore rules need to be updated!")
      return {
        success: false,
        message:
          "Системийн тохиргоо дутуу байна. Firebase Firestore rules-г шинэчлэх шаардлагатай. Админтай холбогдоно уу.",
      }
    }

    return { success: false, message: "Системийн алдаа гарлаа. Дахин оролдоно уу." }
  }
}

// Check and update expired users (should be run periodically)
export const updateExpiredUsers = async (): Promise<void> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("status", "==", "approved"))
    const querySnapshot = await getDocs(q)

    const now = new Date()
    const batch = []

    for (const doc of querySnapshot.docs) {
      const userData = doc.data()
      const accessEndDate = userData.accessEndDate?.toDate()

      if (accessEndDate && now > accessEndDate) {
        batch.push(updateDoc(doc.ref, { status: "expired" }))
      }
    }

    await Promise.all(batch)
    console.log("[v0] Updated expired users")
  } catch (error) {
    console.error("[v0] Error updating expired users:", error)
  }
}

export const toggleUserStatus = async (userId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to toggle user status")
    }

    await ensureAdminDocument(currentUser)

    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    const currentStatus = userData.status

    // Toggle between active and inactive status
    let newStatus: string
    if (currentStatus === "inactive") {
      // Check if user should be approved or expired based on dates
      const now = new Date()
      const accessEndDate = userData.accessEndDate?.toDate()

      if (accessEndDate && now > accessEndDate) {
        newStatus = "expired"
      } else {
        newStatus = "approved"
      }
    } else {
      newStatus = "inactive"
    }

    await updateDoc(userRef, { status: newStatus })
    console.log("[v0] User status toggled successfully")
  } catch (error) {
    console.error("[v0] Error toggling user status:", error)
    throw error
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log("[v0] Starting user deletion process for:", userId)

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("Admin must be authenticated to delete users")
    }

    console.log("[v0] Current admin user:", currentUser.email)
    await ensureAdminDocument(currentUser)

    // Get the user document to verify it exists
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const userData = userDoc.data()
    console.log("[v0] Deleting user:", userData.email, userData.profileName)

    // Delete the user document from Firestore
    await deleteDoc(userRef)
    console.log("[v0] User deleted successfully from Firestore")

    console.log("[v0] User deletion completed successfully")
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    throw error
  }
}
