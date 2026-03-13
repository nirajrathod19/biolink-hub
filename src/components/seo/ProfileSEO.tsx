import { Helmet } from "react-helmet-async";
import { getProfileUrl } from "@/lib/constants";

interface ProfileSEOProps {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const ProfileSEO = ({ username, displayName, bio, avatarUrl }: ProfileSEOProps) => {
  const name = displayName || `@${username}`;
  const description = bio
    ? `${bio.slice(0, 140)}${bio.length > 140 ? "…" : ""}`
    : `Check out ${name}'s links and content on Brioo`;
  const profileUrl = getProfileUrl(username);

  return (
    <Helmet>
      <title>{`${name} | Brioo`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={profileUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={`${name} | Brioo`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={profileUrl} />
      {avatarUrl && <meta property="og:image" content={avatarUrl} />}
      <meta property="og:site_name" content="Brioo" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={avatarUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={`${name} | Brioo`} />
      <meta name="twitter:description" content={description} />
      {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: name,
          description: description,
          url: profileUrl,
          ...(avatarUrl && { image: avatarUrl }),
          mainEntity: {
            "@type": "Person",
            name: name,
            url: profileUrl,
          },
        })}
      </script>
    </Helmet>
  );
};
