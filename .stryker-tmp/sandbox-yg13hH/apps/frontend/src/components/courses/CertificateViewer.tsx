'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from '@/lib/toast';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issuedAt: string;
  txHash: string;
  grade?: string;
  skills?: string[];
}

interface CertificateViewerProps {
  certificate: Certificate;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateViewer({ certificate, isOpen, onClose }: CertificateViewerProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/certificates/${certificate.id}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificate.courseName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const shareLinkedIn = () => {
    const url = `${window.location.origin}/certificates/${certificate.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareTwitter = () => {
    const url = `${window.location.origin}/certificates/${certificate.id}`;
    const text = `I just earned a certificate for ${certificate.courseName}! 🎓`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  const copyLink = () => {
    const url = `${window.location.origin}/certificates/${certificate.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
  };

  const print = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate">
      <div className="space-y-6">
        <Card className="print:shadow-none">
          <div className="text-center space-y-4 p-8 border-4 border-blue-600 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-600">Certificate of Completion</h2>
            <p className="text-lg">This certifies that</p>
            <p className="text-3xl font-bold">{certificate.studentName}</p>
            <p className="text-lg">has successfully completed</p>
            <p className="text-2xl font-semibold text-blue-600">{certificate.courseName}</p>
            
            {certificate.grade && (
              <p className="text-md font-medium text-gray-700">
                Grade: <span className="text-blue-600">{certificate.grade}</span>
              </p>
            )}

            {certificate.skills && certificate.skills.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2 font-medium">Skills acquired:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {certificate.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 pt-4">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400 font-mono break-all">Blockchain Verified: {certificate.txHash}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3 print:hidden">
          <div className="flex gap-2">
            <Button onClick={downloadPDF} disabled={downloading} className="flex-1">
              {downloading ? 'Downloading...' : '📥 Download PDF'}
            </Button>
            <Button onClick={print} variant="outline" className="flex-1">
              🖨️ Print
            </Button>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Share on social media:</p>
            <div className="flex gap-2">
              <Button onClick={shareLinkedIn} variant="outline" className="flex-1">
                LinkedIn
              </Button>
              <Button onClick={shareTwitter} variant="outline" className="flex-1">
                Twitter
              </Button>
              <Button onClick={copyLink} variant="outline" className="flex-1">
                Copy Link
              </Button>
            </div>
          </div>

          <div className="border-t pt-3">
            <a
              href={`https://stellar.expert/explorer/${process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet'}/tx/${certificate.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline block text-center"
            >
              🔗 Verify on Stellar Blockchain ↗
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
