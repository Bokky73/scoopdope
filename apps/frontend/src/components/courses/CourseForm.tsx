import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Course {
  id: string;
  title: string;
}

interface CourseFormProps {
  courseId?: string;
  initialValues?: {
    title?: string;
    description?: string;
    prerequisiteCourseIds?: string[];
  };
  onSaved?: (course: Course) => void;
}

export function CourseForm({ courseId, initialValues, onSaved }: CourseFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [prerequisiteCourseIds, setPrerequisiteCourseIds] = useState<string[]>(
    initialValues?.prerequisiteCourseIds ?? []
  );
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Course[]>('/courses')
      .then((courses) => {
        if (!cancelled) {
          setAvailableCourses(courses.filter((course) => course.id !== courseId));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableCourses([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const addPrerequisite = () => {
    if (!selectedCourseId || prerequisiteCourseIds.includes(selectedCourseId)) {
      return;
    }
    setPrerequisiteCourseIds([...prerequisiteCourseIds, selectedCourseId]);
    setSelectedCourseId('');
  };

  const removePrerequisite = (id: string) => {
    setPrerequisiteCourseIds(prerequisiteCourseIds.filter((courseIdValue) => courseIdValue !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        prerequisiteCourseIds,
      };
      const saved = courseId
        ? await api.put<Course>(`/courses/${courseId}`, payload)
        : await api.post<Course>('/courses', payload);
      onSaved?.(saved);
    } catch (err) {
      setError('Unable to save course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const prerequisiteCourses = availableCourses.filter((course) =>
    prerequisiteCourseIds.includes(course.id)
  );
  const selectableCourses = availableCourses.filter(
    (course) => !prerequisiteCourseIds.includes(course.id)
  );

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="course-title">Title</label>
        <input
          id="course-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="course-description">Description</label>
        <textarea
          id="course-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <fieldset>
        <legend>Prerequisite courses</legend>
        <p>Students must complete these courses before they can enroll.</p>

        {prerequisiteCourses.length === 0 ? (
          <p>No prerequisites set.</p>
        ) : (
          <ul>
            {prerequisiteCourses.map((course) => (
              <li key={course.id}>
                <span>{course.title}</span>
                <button type="button" onClick={() => removePrerequisite(course.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div>
          <label htmlFor="prerequisite-select">Add prerequisite</label>
          <select
            id="prerequisite-select"
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
          >
            <option value="">Select a course</option>
            {selectableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={addPrerequisite} disabled={!selectedCourseId}>
            Add
          </button>
        </div>
      </fieldset>

      {error ? <p role="alert">{error}</p> : null}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save course'}
      </button>
    </form>
  );
}

export default CourseForm;
