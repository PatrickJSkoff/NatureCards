export async function updateUserProfile({
    username,
    password,
    profilePic,
  }: {
    username: string;
    password: string;
    profilePic: File | null;
  }) {
    // Implement actual update logic
    console.log("Updating profile", { username, password, profilePic });
  }
  
  export async function deleteUserAccount() {
    // Implement delete logic
    console.log("Deleting account");
  }
  