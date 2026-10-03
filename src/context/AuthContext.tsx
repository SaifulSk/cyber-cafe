import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { UserProfile } from "../types";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  registerUser: (
    email: string,
    pass: string,
    name: string,
    kendraName: string,
    phone?: string
  ) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateKendraProfile: (details: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const savedMeta = localStorage.getItem(`sevadesk_profile_${user.uid}`);
        let extraProfile: any = {};
        if (savedMeta) {
          try {
            extraProfile = JSON.parse(savedMeta);
          } catch (e) {}
        }
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || extraProfile.displayName || user.email?.split("@")[0] || "Operator",
          kendraName: extraProfile.kendraName || "Digital Seva Kendra",
          phone: extraProfile.phone || "",
          cscId: extraProfile.cscId || "",
          address: extraProfile.address || "",
        });
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = async (
    email: string,
    pass: string,
    name: string,
    kendraName: string,
    phone?: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      const profileData: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        kendraName: kendraName || "Digital Seva Kendra",
        phone: phone || "",
        cscId: "",
      };
      localStorage.setItem(
        `sevadesk_profile_${userCredential.user.uid}`,
        JSON.stringify(profileData)
      );
      setUserProfile(profileData);
      setCurrentUser(userCredential.user);
    }
  };

  const loginUser = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    setCurrentUser(user);
    const savedMeta = localStorage.getItem(`sevadesk_profile_${user.uid}`);
    let extra: any = {};
    if (savedMeta) {
      try {
        extra = JSON.parse(savedMeta);
      } catch (e) {}
    }
    setUserProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || extra.displayName || "Operator",
      kendraName: extra.kendraName || "Digital Seva Kendra",
      phone: extra.phone || "",
      cscId: extra.cscId || "",
      address: extra.address || "",
    });
  };

  const logoutUser = async () => {
    setUserProfile(null);
    setCurrentUser(null);
    await signOut(auth);
  };

  const updateKendraProfile = (details: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...(userProfile || {}), ...details, uid: currentUser.uid } as UserProfile;
    setUserProfile(updated);
    localStorage.setItem(`sevadesk_profile_${currentUser.uid}`, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        updateKendraProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
