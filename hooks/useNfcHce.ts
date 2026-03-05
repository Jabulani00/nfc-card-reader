import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Hook for NFC Host Card Emulation (HCE) on Android.
 * When enabled, the phone emits an NFC Type 4 tag that other readers can detect.
 * The tag content should be the current user's nfcId or uid so readers can look up the user in Firebase.
 *
 * Only works on Android; no-op on iOS and web.
 */
export function useNfcHce() {
  const [isEmitting, setIsEmitting] = useState(false);
  const sessionRef = useRef<{
    setApplication: (tag: unknown) => void;
    setEnabled: (enabled: boolean) => Promise<void>;
  } | null>(null);

  const startEmitting = useCallback(
    async (
      content: string
    ): Promise<{ success: boolean; error?: Error }> => {
      if (Platform.OS !== 'android') {
        const error = new Error('NFC card emulation is only available on Android devices.');
        return { success: false, error };
      }

      try {
        const {
          HCESession,
          NFCTagType4,
          NFCTagType4NDEFContentType,
        } = await import('react-native-hce');

        const tag = new NFCTagType4({
          type: NFCTagType4NDEFContentType.Text,
          content: content || 'unknown',
          writable: false,
        });

        const session = await HCESession.getInstance();
        session.setApplication(tag);
        await session.setEnabled(true);
        sessionRef.current = session;
        setIsEmitting(true);

        return { success: true };
      } catch (e) {
        const error =
          e instanceof Error ? e : new Error(String(e ?? 'Unknown NFC HCE error'));
        console.warn(
          'NFC HCE start failed (expected on iOS/web or if HCE not available):',
          error
        );
        setIsEmitting(false);
        return { success: false, error };
      }
    },
    []
  );

  const stopEmitting = useCallback(async () => {
    if (Platform.OS !== 'android' || !sessionRef.current) return;

    try {
      await sessionRef.current.setEnabled(false);
      sessionRef.current = null;
      setIsEmitting(false);
    } catch (e) {
      console.warn('NFC HCE stop failed:', e);
      sessionRef.current = null;
      setIsEmitting(false);
    }
  }, []);

  return { startEmitting, stopEmitting, isEmitting };
}
