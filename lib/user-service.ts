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
import { createUserWithEmailAndPassword, updateProfile, type User as FirebaseUser } from "firebase/auth"
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

// User Management Functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
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
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    throw error
  }
}

export const getPendingRegistrations = async (): Promise<RegistrationRequest[]> => {
  try {
    const registrationsRef = collection(db, "registrationRequests")
    const q = query(registrationsRef, where("status", "==", "pending"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
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
  } catch (error) {
    console.error("[v0] Error fetching pending registrations:", error)
    throw error
  }
}

export const getExpiredUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("status", "==", "expired"), orderBy("accessEndDate", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
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
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching expired users:", error)
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
    const registrationRef = doc(collection(db, "registrationRequests"))
    await setDoc(registrationRef, {
      email,
      displayName,
      profileName,
      password, // In production, this should be hashed
      status: "pending",
      createdAt: Timestamp.now(),
    })

    console.log("[v0] Registration request submitted successfully")
  } catch (error) {
    console.error("[v0] Error submitting registration request:", error)
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
    // Get the registration request
    const requestRef = doc(db, "registrationRequests", requestId)
    const requestDoc = await getDoc(requestRef)

    if (!requestDoc.exists()) {
      throw new Error("Registration request not found")
    }

    const requestData = requestDoc.data()

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, requestData.email, requestData.password)

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: requestData.displayName,
    })

    // Create user document
    const userRef = doc(db, "users", userCredential.user.uid)
    await setDoc(userRef, {
      email: requestData.email,
      displayName: requestData.displayName,
      profileName: requestData.profileName,
      status: "approved",
      accessStartDate: Timestamp.fromDate(accessStartDate),
      accessEndDate: Timestamp.fromDate(accessEndDate),
      createdAt: requestData.createdAt,
      approvedAt: Timestamp.now(),
      approvedBy,
    })

    // Delete the registration request
    await deleteDoc(requestRef)

    console.log("[v0] Registration approved successfully")
  } catch (error) {
    console.error("[v0] Error approving registration:", error)
    throw error
  }
}

export const rejectRegistration = async (requestId: string): Promise<void> => {
  try {
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

export const checkUserAccess = async (user: FirebaseUser): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return false
    }

    const userData = userDoc.data()
    const now = new Date()
    const accessEndDate = userData.accessEndDate?.toDate()

    if (userData.status !== "approved") {
      return false
    }

    if (accessEndDate && now > accessEndDate) {
      // Update status to expired
      await updateDoc(userRef, { status: "expired" })
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error checking user access:", error)
    return false
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
