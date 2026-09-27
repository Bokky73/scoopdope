import Link from 'next/link';
import Image from 'next/image';
import { BookmarkButton } from './BookmarkButton';
import { CompareCheckbox } from './CompareCheckbox';

export type Category = {
  id: string;
  name: string;
  slug: string;
  iconName: string | null;
};

export type Course = {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  /** Legacy plain-string category (used when no full Category object is available). */
  category?: string;
  /** Full category object with icon name. */
  categoryObj?: Category | null;
  durationHours?: number;
  price?: number;
  rating?: number;
  enrollments?: number;
  description?: string;
  thumbnailUrl?: string;
};

/** Renders a FontAwesome icon name as a <i> element; falls back gracefully. */
function CategoryIcon({ iconName }: { iconName: string | null }) {
  if (!iconName) return null;
  return (
    <i
      className={`fa-solid ${iconName} text-blue-500 dark:text-blue-400 mr-1 text-[10px]`}
      aria-hidden="true"
    />
  );
}

export function CourseCard({ course, observerRef }: { course: Course; observerRef?: React.Ref<HTMLDivElement> }) {
  // Prefer the full category object; fall back to the plain string.
  const categoryName = course.categoryObj?.name ?? course.category;
  const categoryIcon = course.categoryObj?.iconName ?? null;

  return (
    <div
      ref={observerRef}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col gap-2"
      role="gridcell"
    >
      {course.thumbnailUrl && (
        <div className="relative w-full h-36">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">{course.title}</h2>
          <BookmarkButton course={course} />
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="capitalize">{course.level}</span>
          {course.language && <><span>·</span><span className="uppercase">{course.language}</span></>}
          {categoryName && (
            <>
              <span>·</span>
              <span className="flex items-center">
                <CategoryIcon iconName={categoryIcon} />
                {categoryName}
              </span>
            </>
          )}
          {course.durationHours != null && <><span>·</span><span>{course.durationHours}h</span></>}
          {course.rating != null && <><span>·</span><span className="text-yellow-500">★ {course.rating.toFixed(1)}</span></>}
        </div>
        {course.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <CompareCheckbox course={course} />
          {course.price != null && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/courses/${course.id}`}
              aria-label={`View ${course.title}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              View →
            </Link>
            <Link
              href={`/courses/${course.id}/enroll`}
              className="text-sm font-medium px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              aria-label={`Enroll in ${course.title}`}
            >
              Enroll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

