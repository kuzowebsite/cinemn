// Firebase Firestore Security Rules Setup
// Run this script to set up basic security rules for the movie database

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to movies for all users
    match /movies/{movieId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || isAdmin(request.auth));
    }
    
    match /registrationRequests/{requestId} {
      allow read, write: if request.auth != null && isAdmin(request.auth);
      allow create: if true; // Allow anyone to create registration requests
    }
    
    // Allow admin documents to be created and read
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
    
    function isAdmin(auth) {
      return exists(/databases/$(database)/documents/admins/$(auth.uid));
    }
  }
}
`

console.log("Firebase Firestore Security Rules:")
console.log(rules)
console.log("\nTo apply these rules:")
console.log("1. Go to Firebase Console")
console.log("2. Select your project: nexora-79493")
console.log("3. Go to Firestore Database")
console.log("4. Click on 'Rules' tab")
console.log("5. Replace the existing rules with the rules above")
console.log("6. Click 'Publish'")
