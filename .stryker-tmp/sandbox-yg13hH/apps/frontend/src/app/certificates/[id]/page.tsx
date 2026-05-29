import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scoopdope.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CertData {
  id: string;
  courseName: string;
  studentName: string;
  issuedAt: string;
  txHash: string;
  grade?: string;
  skills?: string[];
}

async function getCert(id: string): Promise<CertData | null> {
  try {
    const res = await fetch(`${API_URL}/v1/credentials/detail/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const cert = await getCert(params.id);
  if (!cert) return { title: 'Certificate | scoopdope', robots: { index: false } };

  const title = `${cert.studentName} earned "${cert.courseName}" — scoopdope`;
  const description = `Verified blockchain certificate issued on ${new Date(cert.issuedAt).toLocaleDateString()}.`;
  const url = `${SITE_URL}/certificates/${cert.id}`;
  const ogImage = `${API_URL}/v1/certificates/${cert.id}/og-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'scoopdope',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await getCert(params.id);

  if (!cert) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-500">Certificate not found.</p>
      </main>
    );
  }

  const shareUrl = `${SITE_URL}/certificates/${cert.id}`;

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="border-4 border-blue-600 rounded-xl p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold text-blue-600">Certificate of Completion</h1>
        <p className="text-lg text-gray-600">This certifies that</p>
        <p className="text-4xl font-bold">{cert.studentName}</p>
        <p className="text-lg text-gray-600">has successfully completed</p>
        <p className="text-2xl font-semibold text-blue-600">{cert.courseName}</p>
        
        {cert.grade && (
          <p className="text-md font-medium text-gray-700">
            Grade: <span className="text-blue-600">{cert.grade}</span>
          </p>
        )}

        {cert.skills && cert.skills.length > 0 && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2 font-medium">Skills acquired:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {cert.skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 pt-4">
          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 font-mono break-all">Tx: {cert.txHash}</p>
      </div>

      {/* Share buttons (client-side interactivity handled via inline onclick) */}
      <div className="flex flex-wrap gap-3 justify-center">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors"
        >
          Share on LinkedIn
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I earned a certificate for "${cert.courseName}" on scoopdope! 🎓`)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Share on X / Twitter
        </a>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${cert.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Verify on Stellar ↗
        </a>
      </div>
    </main>
  );
}
