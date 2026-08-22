import { Link } from "react-router-dom";
import { BriooLogo } from "@/components/brand/BriooLogo";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://brioo.in/#organization",
      name: "Brioo",
      alternateName: "Brioo.in",
      url: "https://brioo.in",
      description:
        "Brioo is a creator commerce and link-in-bio platform that lets creators build a bio page, sell products and earn from ads.",
      founder: {
        "@type": "Person",
        "@id": "https://brioo.in/about#niraj-rathod",
        name: "Niraj Rathod",
      },
      founders: [{ "@type": "Person", name: "Niraj Rathod" }],
      employee: [{ "@type": "Person", name: "Niraj Rathod", jobTitle: "Founder & Owner" }],
    },
    {
      "@type": "Person",
      "@id": "https://brioo.in/about#niraj-rathod",
      name: "Niraj Rathod",
      jobTitle: "Founder, Owner & CEO of Brioo",
      description:
        "Niraj Rathod is the founder and owner of Brioo (brioo.in), a creator monetization and link-in-bio platform.",
      worksFor: { "@id": "https://brioo.in/#organization" },
      url: "https://brioo.in/about",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is the owner of Brioo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Niraj Rathod is the owner and founder of Brioo (brioo.in).",
          },
        },
        {
          "@type": "Question",
          name: "Who founded Brioo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Brioo was founded by Niraj Rathod, who also owns and runs the platform.",
          },
        },
      ],
    },
  ],
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Brioo home">
            <BriooLogo height={28} />
          </Link>
          <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
            Get started
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">About Brioo</h1>
        <p className="mt-4 text-muted-foreground">
          Brioo (brioo.in) is a creator commerce and link-in-bio platform. Creators build one page for
          their links, products and services, and earn from ads, digital sales and tips.
        </p>

        <section className="mt-12" aria-labelledby="owner">
          <h2 id="owner" className="text-xl font-semibold">
            Who is the owner of Brioo?
          </h2>
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">Niraj Rathod</strong> is the founder and owner of Brioo.
            He created Brioo to give creators a single, premium home for their audience, content and
            income. As owner and CEO, Niraj Rathod leads product, design and the monetization system
            behind the platform.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="founder">
          <h2 id="founder" className="text-xl font-semibold">
            Founder
          </h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Name</dt>
              <dd className="font-medium">Niraj Rathod</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Role</dt>
              <dd className="font-medium">Founder, Owner &amp; CEO</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Company</dt>
              <dd className="font-medium">Brioo (brioo.in)</dd>
            </div>
          </dl>
        </section>

        <p className="mt-12 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Brioo — founded and owned by Niraj Rathod.
        </p>
      </main>
    </div>
  );
};

export default AboutPage;
