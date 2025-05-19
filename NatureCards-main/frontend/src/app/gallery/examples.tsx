"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/mock-db";

export function GalleryExamples() {
  const [exampleUsers, setExampleUsers] = useState<Array<{ id: string, name: string }>>([]);
  
  useEffect(() => {
    // Get all users from the mock database
    const allUsers = getAllUsers();
    
    // Select the first 3 users for examples
    const selectedUsers = allUsers.slice(0, 3).map(user => ({
      id: user._id,
      name: user.username
    }));
    
    setExampleUsers(selectedUsers);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Example User Galleries</h2>
      <p className="text-gray-600 mb-4">
        Click on a user to see their card collection:
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/gallery">
          <Button variant="outline">Your Gallery</Button>
        </Link>
        {exampleUsers.map(user => (
          <Link 
            key={user.id} 
            href={`/gallery?userid=${user.id}`}
          >
            <Button variant="outline">{user.name}</Button>
          </Link>
        ))}
      </div>
    </div>
  );
} 