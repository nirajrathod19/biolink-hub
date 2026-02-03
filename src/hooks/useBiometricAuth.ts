import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  type: string;
}

const BIOMETRIC_CREDENTIAL_KEY = "admin_biometric_credential";
const BIOMETRIC_ENABLED_KEY = "admin_biometric_enabled";
const ADMIN_BIOMETRIC_SESSION_KEY = "admin_biometric_verified";

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Check if device is mobile
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) 
    && window.innerWidth < 768;
};

export const useBiometricAuth = (userId: string | undefined) => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported and device is mobile
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      
      // Only enable biometric for mobile devices
      if (!mobile) {
        setIsBiometricAvailable(false);
        return;
      }
      
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricAvailable(available);
          
          // Check if user has enabled biometric
          if (userId) {
            const enabled = localStorage.getItem(`${BIOMETRIC_ENABLED_KEY}_${userId}`) === "true";
            setIsBiometricEnabled(enabled);
          }
        } catch (error) {
          console.error("Error checking biometric availability:", error);
          setIsBiometricAvailable(false);
        }
      }
    };

    checkBiometricSupport();
    
    // Re-check on resize (for responsive testing)
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [userId]);

  // Register biometric credential
  const enableBiometric = useCallback(async () => {
    if (!userId || !isBiometricAvailable) {
      toast({
        title: "Error",
        description: "Biometric authentication is not available on this device",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Create challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options
      const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "BioLink Admin",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: `admin_${userId}`,
          displayName: "Admin User",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: createOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID
        const credentialData = {
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          type: credential.type,
        };
        
        localStorage.setItem(`${BIOMETRIC_CREDENTIAL_KEY}_${userId}`, JSON.stringify(credentialData));
        localStorage.setItem(`${BIOMETRIC_ENABLED_KEY}_${userId}`, "true");
        setIsBiometricEnabled(true);

        toast({
          title: "Biometric Enabled",
          description: "Fingerprint/Face ID login has been set up successfully",
        });

        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      console.error("Biometric registration error:", error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up biometric authentication",
        variant: "destructive",
      });
    }

    setIsLoading(false);
    return false;
  }, [userId, isBiometricAvailable, toast]);

  // Verify biometric
  const verifyBiometric = useCallback(async (): Promise<boolean> => {
    if (!userId || !isBiometricEnabled) {
      return false;
    }

    setIsLoading(true);

    try {
      // Get stored credential
      const storedCredentialStr = localStorage.getItem(`${BIOMETRIC_CREDENTIAL_KEY}_${userId}`);
      if (!storedCredentialStr) {
        setIsLoading(false);
        return false;
      }

      const storedCredential = JSON.parse(storedCredentialStr);

      // Create challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Get credential options
      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
        allowCredentials: [
          {
            id: base64ToArrayBuffer(storedCredential.rawId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
      };

      // Get assertion
      const assertion = await navigator.credentials.get({
        publicKey: getOptions,
      }) as PublicKeyCredential;

      if (assertion) {
        // Store biometric session - bypasses admin password
        const sessionData = {
          user_id: userId,
          verified_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        };
        localStorage.setItem(ADMIN_BIOMETRIC_SESSION_KEY, JSON.stringify(sessionData));
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      console.error("Biometric verification error:", error);
      
      // Don't show error for user cancellation
      if (error.name !== "NotAllowedError") {
        toast({
          title: "Verification Failed",
          description: "Biometric failed. Use your device password or admin password.",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
    return false;
  }, [userId, isBiometricEnabled, toast]);

  // Check if biometric session is valid (bypasses admin password)
  const checkBiometricSession = useCallback((): boolean => {
    if (!userId) return false;
    
    try {
      const sessionStr = localStorage.getItem(ADMIN_BIOMETRIC_SESSION_KEY);
      if (!sessionStr) return false;
      
      const session = JSON.parse(sessionStr);
      if (session.user_id === userId && new Date(session.expires_at) > new Date()) {
        return true;
      }
      
      localStorage.removeItem(ADMIN_BIOMETRIC_SESSION_KEY);
    } catch {
      localStorage.removeItem(ADMIN_BIOMETRIC_SESSION_KEY);
    }
    
    return false;
  }, [userId]);

  // Clear biometric session
  const clearBiometricSession = useCallback(() => {
    localStorage.removeItem(ADMIN_BIOMETRIC_SESSION_KEY);
  }, []);

  // Disable biometric
  const disableBiometric = useCallback(() => {
    if (userId) {
      localStorage.removeItem(`${BIOMETRIC_CREDENTIAL_KEY}_${userId}`);
      localStorage.removeItem(`${BIOMETRIC_ENABLED_KEY}_${userId}`);
      localStorage.removeItem(ADMIN_BIOMETRIC_SESSION_KEY);
      setIsBiometricEnabled(false);
      
      toast({
        title: "Biometric Disabled",
        description: "Fingerprint/Face ID login has been disabled",
      });
    }
  }, [userId, toast]);

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    isMobile,
    isLoading,
    enableBiometric,
    verifyBiometric,
    checkBiometricSession,
    clearBiometricSession,
    disableBiometric,
  };
};
