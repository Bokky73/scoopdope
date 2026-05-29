'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface LessonDraft {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  durationMinutes: number;
}

interface ModuleDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: string;
  thumbnailUrl: string;
  price: string;
  tokenReward: string;
}

function SortableModule({
  mod,
  index,
  onUpdate,
  onRemove,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
}: {
  mod: ModuleDraft;
  index: number;
  onUpdate: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onUpdateLesson: (moduleId: string, lessonId: string, field: keyof LessonDraft, value: string | number) => void;
  onRemoveLesson: (moduleId: string, lessonId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
    >
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">⠿</button>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">M{index + 1}</span>
        <input className="flex-1 border rounded px-3 py-1.5 text-sm font-medium dark:bg-gray-800 dark:border-gray-600" placeholder="Module title" value={mod.title} onChange={(e) => onUpdate(mod.id, e.target.value)} />
        <button type="button" onClick={() => onRemove(mod.id)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
      </div>
      <div className="p-4 space-y-3">
        {mod.lessons.map((lesson, li) => (
          <div key={lesson.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5">L{li + 1}</span>
              <input className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600" placeholder="Lesson title" value={lesson.title} onChange={(e) => onUpdateLesson(mod.id, lesson.id, 'title', e.target.value)} />
              <button type="button" onClick={() => onRemoveLesson(mod.id, lesson.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
            </div>
            <textarea className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600" rows={2} placeholder="Lesson content" value={lesson.content} onChange={(e) => onUpdateLesson(mod.id, lesson.id, 'content', e.target.value)} />
            <div className="flex gap-2">
              <input className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600" placeholder="Video URL" value={lesson.videoUrl} onChange={(e) => onUpdateLesson(mod.id, lesson.id, 'videoUrl', e.target.value)} />
              <input type="number" min={0} className="w-28 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600" placeholder="Duration (min)" value={lesson.durationMinutes || ''} onChange={(e) => onUpdateLesson(mod.id, lesson.id, 'durationMinutes', Number(e.target.value))} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onAddLesson(mod.id)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Lesson</button>
      </div>
    </div>
  );
}

export function CourseCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    durationHours: '',
    thumbnailUrl: '',
    price: '',
    tokenReward: '',
  });
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  const saveDraft = () => {
    localStorage.setItem('courseDraft', JSON.stringify({ form, modules }));
    setIsDraft(true);
    setTimeout(() => setIsDraft(false), 2000);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('courseDraft');
    if (draft) {
      const { form: savedForm, modules: savedModules } = JSON.parse(draft);
      setForm(savedForm);
      setModules(savedModules);
    }
  };

  const addModule = () => setModules((prev) => [...prev, { id: crypto.randomUUID(), title: '', lessons: [] }]);
  const updateModule = (id: string, title: string) => setModules((prev) => prev.map((m) => (m.id === id ? { ...m, title } : m)));
  const removeModule = (id: string) => setModules((prev) => prev.filter((m) => m.id !== id));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((prev) => {
        const oldIndex = prev.findIndex((m) => m.id === active.id);
        const newIndex = prev.findIndex((m) => m.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addLesson = (moduleId: string) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: crypto.randomUUID(), title: '', content: '', videoUrl: '', durationMinutes: 0 }] } : m
      )
    );

  const updateLesson = (moduleId: string, lessonId: string, field: keyof LessonDraft, value: string | number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l)) } : m
      )
    );

  const removeLesson = (moduleId: string, lessonId: string) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      )
    );

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError('Title is required.');
    setError('');
    setSubmitting(true);

    try {
      const { data: course } = await api.post('/courses', {
        title: form.title.trim(),
        description: form.description.trim(),
        level: form.level,
        durationHours: Number(form.durationHours) || 0,
      });

      const courseId: string = course?.data?.id ?? course?.id;

      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const { data: createdMod } = await api.post(`/courses/${courseId}/modules`, {
          title: mod.title || `Module ${i + 1}`,
          order: i,
        });

        const moduleId: string = createdMod?.data?.id ?? createdMod?.id;

        for (let j = 0; j < mod.lessons.length; j++) {
          const lesson = mod.lessons[j];
          await api.post(`/modules/${moduleId}/lessons`, {
            title: lesson.title || `Lesson ${j + 1}`,
            content: lesson.content,
            videoUrl: lesson.videoUrl || undefined,
            durationMinutes: lesson.durationMinutes || 0,
            order: j,
          });
        }
      }

      localStorage.removeItem('courseDraft');
      router.push(`/courses/${courseId}`);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" rows={4} placeholder="What will students learn?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" placeholder="e.g. Blockchain" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" placeholder="https://..." value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setStep(2)}>Next</Button>
            <Button variant="outline" onClick={saveDraft}>{isDraft ? 'Saved!' : 'Save Draft'}</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Modules & Lessons</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4 mb-4">
                {modules.map((mod, i) => (
                  <SortableModule key={mod.id} mod={mod} index={i} onUpdate={updateModule} onRemove={removeModule} onAddLesson={addLesson} onUpdateLesson={updateLesson} onRemoveLesson={removeLesson} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" onClick={addModule}>+ Add Module</Button>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setStep(3)}>Next</Button>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Pricing & Rewards</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (USD)</label>
                <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Token Reward</label>
                <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" placeholder="100" value={form.tokenReward} onChange={(e) => setForm({ ...form, tokenReward: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setStep(4)}>Next</Button>
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Preview & Publish</h2>
          <div className="space-y-4 text-sm">
            <div><strong>Title:</strong> {form.title}</div>
            <div><strong>Description:</strong> {form.description}</div>
            <div><strong>Modules:</strong> {modules.length}</div>
            <div><strong>Total Lessons:</strong> {modules.reduce((acc, m) => acc + m.lessons.length, 0)}</div>
          </div>
          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Publishing...' : 'Publish Course'}</Button>
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <button onClick={loadDraft} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4">Load Draft</button>
      )}
    </div>
  );
}
