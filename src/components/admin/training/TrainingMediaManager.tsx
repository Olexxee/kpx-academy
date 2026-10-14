import { useRef } from "react";
import { Loader2, X, Upload, Star, Trash2, Film } from "lucide-react";
import type { TrainingProgram } from "../../../api/training.api";
import { useTrainingMedia } from "../../../features/admin/training/training.queries";
import {
  useDeleteTrainingMedia,
  useSetPrimaryTrainingMedia,
  useUploadTrainingMedia,
} from "../../../features/admin/training/training.mutations";

interface Props {
  program: TrainingProgram;
  onClose: () => void;
}

export default function TrainingMediaManager({ program, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const query = useTrainingMedia(program.id);
  const uploadMutation = useUploadTrainingMedia();
  const deleteMutation = useDeleteTrainingMedia();
  const primaryMutation = useSetPrimaryTrainingMedia();

  const media = query.data ?? [];

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadMutation.mutateAsync({
      trainingProgramId: program.id,
      file,
    });

    event.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D4ED8]/50 p-4 sm:p-6">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Program media
            </h2>
            <p className="mt-1 text-xs text-slate-500">{program.title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload zone */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="mb-6 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadMutation.isPending ? (
              <Loader2 size={24} className="animate-spin text-slate-400" />
            ) : (
              <Upload size={24} className="text-slate-400" />
            )}
            <span className="mt-3 text-sm font-medium text-slate-700">
              {uploadMutation.isPending ? "Uploading..." : "Upload media"}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Images and videos up to 50 MB
            </span>
          </button>

          {/* Media grid */}
          {query.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200"
                >
                  <div className="aspect-video bg-slate-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-8 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
              <Film size={24} className="mx-auto text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No media yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload an image or video to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item: any) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-video bg-slate-100">
                    {item.mimeType.startsWith("video/") ? (
                      <video
                        src={item.url}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={program.title}
                        className="h-full w-full object-cover"
                      />
                    )}

                    {item.isPrimary && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1D4ED8]/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <Star size={10} className="fill-current" />
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-3">
                    {!item.isPrimary && (
                      <button
                        type="button"
                        onClick={() =>
                          primaryMutation.mutate({
                            trainingProgramId: program.id,
                            mediaId: item.id,
                          })
                        }
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Star size={12} />
                        Make primary
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteMutation.mutate({
                          trainingProgramId: program.id,
                          mediaId: item.id,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
