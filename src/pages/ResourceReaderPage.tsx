import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPublicResource, getResourceDownloadUrl, getResourceViewUrl } from "../api/siteContent.api";

export default function ResourceReaderPage() {
  const { slug = "" } = useParams();
  const query = useQuery({ queryKey: ["site-content", "resource", slug], queryFn: () => getPublicResource(slug), enabled: Boolean(slug) });
  if (query.isLoading) return <div className="mx-auto max-w-6xl px-5 py-16 text-sm text-slate-500">Loading resource…</div>;
  if (query.isError || !query.data) return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><FileText size={36} className="mx-auto text-[#8B1E5A]"/><h1 className="mt-4 text-2xl font-bold">Resource not found</h1><p className="mt-2 text-sm text-slate-500">This resource may have been unpublished or moved.</p><Link to="/resources" className="mt-6 inline-flex rounded-full bg-[#8B1E5A] px-5 py-3 text-sm font-semibold text-white">Back to resources</Link></div>;
  const resource = query.data;
  return <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 sm:px-8 sm:py-12">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><Link to="/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B1E5A] hover:underline"><ArrowLeft size={16}/> All resources</Link><h1 className="mt-4 font-[Sora] text-3xl font-bold tracking-tight text-[#212529] sm:text-4xl">{resource.title}</h1>{resource.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{resource.description}</p>}</div>
        <a href={getResourceDownloadUrl(resource.slug)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#8B1E5A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6e1747]"><Download size={16}/> Download PDF</a>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe title={`${resource.title} PDF reader`} src={getResourceViewUrl(resource.slug)} className="h-[72vh] min-h-[560px] w-full" />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">If the preview does not load, <a className="font-semibold text-[#8B1E5A] underline" href={getResourceDownloadUrl(resource.slug)}>download the PDF</a> or <a className="font-semibold text-[#8B1E5A] underline" href={getResourceViewUrl(resource.slug)} target="_blank" rel="noreferrer">open the PDF in a new tab</a>.</p>
    </div>
  </main>;
}
