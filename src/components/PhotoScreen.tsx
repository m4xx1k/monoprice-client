import { useRef, useCallback } from "react";
import { X, Camera } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { warmup } from "../api";

interface Props {
  selectedPhotos: File[];
  onPhotosChange: (photos: File[]) => void;
  onReset: () => void;
  onNext: (photos: File[]) => void;
}

interface SortablePhotoTileProps {
  id: string;
  file: File;
  index: number;
  onRemove: () => void;
  tileClass?: string;
}

function SortablePhotoTile({ id, file, index, onRemove, tileClass }: SortablePhotoTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const url = URL.createObjectURL(file);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-2xl select-none touch-none ${tileClass ?? ""}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={url}
        alt={`Фото ${index + 1}`}
        className="w-full h-full object-cover"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      {index === 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
          Обкладинка
        </div>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function PhotoMosaic({
  photos,
  ids,
  onRemove,
}: {
  photos: File[];
  ids: string[];
  onRemove: (index: number) => void;
}) {
  const count = photos.length;

  if (count === 1) {
    return (
      <div className="w-full aspect-square">
        <SortablePhotoTile
          id={ids[0]}
          file={photos[0]}
          index={0}
          onRemove={() => onRemove(0)}
          tileClass="w-full h-full"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2" style={{ height: "280px" }}>
        {photos.map((file, i) => (
          <SortablePhotoTile
            key={ids[i]}
            id={ids[i]}
            file={file}
            index={i}
            onRemove={() => onRemove(i)}
            tileClass="w-full h-full"
          />
        ))}
      </div>
    );
  }

  // 3-5 photos: collage
  return (
    <div className="flex gap-2" style={{ height: "320px" }}>
      {/* Left large tile */}
      <div className="flex-[3]">
        <SortablePhotoTile
          id={ids[0]}
          file={photos[0]}
          index={0}
          onRemove={() => onRemove(0)}
          tileClass="w-full h-full"
        />
      </div>
      {/* Right column */}
      <div className="flex-[2] flex flex-col gap-2">
        {photos.slice(1).map((file, i) => (
          <SortablePhotoTile
            key={ids[i + 1]}
            id={ids[i + 1]}
            file={file}
            index={i + 1}
            onRemove={() => onRemove(i + 1)}
            tileClass="w-full flex-1"
          />
        ))}
      </div>
    </div>
  );
}

export function PhotoScreen({ selectedPhotos, onPhotosChange, onReset, onNext }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPhotos = selectedPhotos.length > 0;

  // Stable IDs for dnd-kit
  const idsRef = useRef<string[]>([]);
  while (idsRef.current.length < selectedPhotos.length) {
    idsRef.current.push(crypto.randomUUID());
  }
  idsRef.current = idsRef.current.slice(0, selectedPhotos.length);
  const ids = idsRef.current;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      idsRef.current = arrayMove(ids, oldIndex, newIndex);
      onPhotosChange(arrayMove(selectedPhotos, oldIndex, newIndex));
    },
    [ids, selectedPhotos, onPhotosChange],
  );

  const handleAddFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files).slice(0, 5 - selectedPhotos.length);
      if (newFiles.length === 0) return;
      const updated = [...selectedPhotos, ...newFiles].slice(0, 5);
      onPhotosChange(updated);
    },
    [selectedPhotos, onPhotosChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const updated = selectedPhotos.filter((_, i) => i !== index);
      idsRef.current = idsRef.current.filter((_, i) => i !== index);
      onPhotosChange(updated);
    },
    [selectedPhotos, onPhotosChange],
  );

  const handleNext = useCallback(() => {
    warmup(selectedPhotos);
    onNext(selectedPhotos);
  }, [selectedPhotos, onNext]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F2F2F7]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={onReset}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500"
        >
          <X size={18} />
        </button>
        <h1 className="text-base font-bold text-gray-900">
          {hasPhotos ? "Фото товару" : "Спочатку додайте фото товару"}
        </h1>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6 flex flex-col">
        {!hasPhotos ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-8 rounded-3xl border-2 border-dashed border-gray-300 bg-white text-gray-400 active:bg-gray-50 transition-colors"
            >
              <Camera size={40} strokeWidth={1.5} />
              <span className="text-base font-semibold text-gray-700">Додати фото</span>
              <span className="text-sm text-gray-400">Можна до 5 штук</span>
            </button>
          </div>
        ) : (
          /* Filled state */
          <div className="flex-1 flex flex-col gap-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                <PhotoMosaic photos={selectedPhotos} ids={ids} onRemove={handleRemove} />
              </SortableContext>
            </DndContext>

            {selectedPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-gray-500 text-sm font-semibold active:bg-gray-50 transition-colors"
              >
                <Camera size={16} />
                Додати ще фото
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          type="button"
          onClick={hasPhotos ? handleNext : () => fileInputRef.current?.click()}
          disabled={!hasPhotos}
          className="w-full py-4 rounded-full bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {hasPhotos ? "Зберегти" : "Далі"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleAddFiles(e.target.files)}
      />
    </div>
  );
}
