// Firebase Storage Security Rules Setup
// Run this script to set up security rules for file uploads

const rules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images and videos
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow any authenticated user to upload files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
`

console.log("Firebase Storage Security Rules:")
console.log(rules)
console.log("\nTo apply these rules:")
console.log("1. Go to Firebase Console")
console.log("2. Select your project: nexora-79493")
console.log("3. Go to Storage")
console.log("4. Click on 'Rules' tab")
console.log("5. Replace the existing rules with the rules above")
console.log("6. Click 'Publish'")
