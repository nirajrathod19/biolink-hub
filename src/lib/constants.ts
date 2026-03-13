// Production domain constant - single source of truth
export const PRODUCTION_DOMAIN = "https://brioo.in";

export const getProfileUrl = (username: string) => `${PRODUCTION_DOMAIN}/${username}`;

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
