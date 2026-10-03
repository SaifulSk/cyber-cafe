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
  isDemoUser: boolean;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_PROFILE: UserProfile = {
  uid: "demo_csc_operator",
  email: "operator@digitalseva.in",
  displayName: "Operator",
  kendraName: "Digital Seva Kendra",
  phone: "",
  cscId: "",
  address: "",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if demo user was active
    const savedDemo = localStorage.getItem("sevadesk_demo_active");
    if (savedDemo === "true") {
      setIsDemoUser(true);
      setUserProfile(DEMO_USER_PROFILE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);
        // Load custom profile details from localStorage
        const savedMeta = localStorage.getItem(`sevadesk_profile_${user.uid}`);
        let extraProfile = {};
        if (savedMeta) {
          try {
            extraProfile = JSON.parse(savedMeta);
          } catch (e) {}
        }
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "Operator",
          kendraName: (extraProfile as any).kendraName || "Digital Seva Kendra",
          phone: (extraProfile as any).phone || "",
          cscId: (extraProfile as any).cscId || "",
          address: (extraProfile as any).address || "",
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
    localStorage.removeItem("sevadesk_demo_active");
    setIsDemoUser(false);
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
    localStorage.removeItem("sevadesk_demo_active");
    setIsDemoUser(false);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    setCurrentUser(user);
    const savedMeta = localStorage.getItem(`sevadesk_profile_${user.uid}`);
    let extra = {};
    if (savedMeta) {
      try {
        extra = JSON.parse(savedMeta);
      } catch (e) {}
    }
    setUserProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Operator",
      kendraName: (extra as any).kendraName || "Digital Seva Kendra",
      phone: (extra as any).phone || "",
      cscId: (extra as any).cscId || "",
      address: (extra as any).address || "",
    });
  };

  const logoutUser = async () => {
    localStorage.removeItem("sevadesk_demo_active");
    setIsDemoUser(false);
    setUserProfile(null);
    setCurrentUser(null);
    await signOut(auth);
  };

  const loginAsDemo = () => {
    localStorage.setItem("sevadesk_demo_active", "true");
    setIsDemoUser(true);
    setUserProfile(DEMO_USER_PROFILE);
    setCurrentUser(null);
  };

  const updateKendraProfile = (details: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...details };
    setUserProfile(updated);
    if (userProfile.uid) {
      localStorage.setItem(`sevadesk_profile_${userProfile.uid}`, JSON.stringify(updated));
    }
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
        isDemoUser,
        loginAsDemo,
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
