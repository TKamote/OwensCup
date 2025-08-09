import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/firebase";

export const useUsernameCheck = () => {
  const { user } = useAuth();
  const [needsUsername, setNeedsUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!user) {
        setNeedsUsername(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        // Check if user has a username
        if (!profile?.username) {
          setNeedsUsername(true);
        } else {
          setNeedsUsername(false);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        // If we can't fetch profile, assume they need username
        setNeedsUsername(true);
      } finally {
        setLoading(false);
      }
    };

    checkUsername();
  }, [user]);

  return {
    needsUsername,
    loading,
    userProfile,
  };
};
