"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Link as LinkIcon, QrCode, Code2 } from "lucide-react";
import QRCode from "qrcode";

interface FormSharingPanelProps {
  formId: string;
}

export default function FormSharingPanel({ formId }: FormSharingPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${baseUrl}/forms/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0" style="border:none;border-radius:12px;"></iframe>`;

  useEffect(() => {
    if (formUrl && baseUrl) {
      QRCode.toDataURL(formUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [formUrl, baseUrl]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Direct Link */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-medium text-foreground">Direct Link</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={formUrl}
              className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono"
            />
            <button
              onClick={() => copyToClipboard(formUrl, "link")}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              {copied === "link" ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* QR Code */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-medium text-foreground">QR Code</h3>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 inline-block">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Form QR code" width={200} height={200} />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Generating...</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Scan with a phone camera to open the form.
          </p>
        </section>

        {/* Embed Code */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-medium text-foreground">Embed Code</h3>
          </div>
          <div className="relative">
            <pre className="rounded-md border border-border bg-surface p-3 text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
            <button
              onClick={() => copyToClipboard(embedCode, "embed")}
              className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              {copied === "embed" ? <Check size={10} className="text-success" /> : <Copy size={10} />}
              {copied === "embed" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Paste this HTML into your website to embed the form.
          </p>
        </section>
      </div>
    </div>
  );
}
