export const TOUR_STOPS = ["about", "projects", "career"] as const;
export type TourStop = (typeof TOUR_STOPS)[number];

export type TourState = {
  dismissed: boolean;
  active: boolean;
  current: number;
  visited: TourStop[];
};

export const newTour = (): TourState => ({
  dismissed: false,
  active: false,
  current: 0,
  visited: [],
});

function isStop(value: unknown): value is TourStop {
  return typeof value === "string" && TOUR_STOPS.includes(value as TourStop);
}

export function restoreTour(value: unknown): TourState {
  if (!value || typeof value !== "object") return newTour();
  const saved = value as Partial<TourState>;
  const dismissed = saved.dismissed ?? false;
  if (
    typeof dismissed !== "boolean" ||
    typeof saved.active !== "boolean" ||
    !Number.isInteger(saved.current) ||
    saved.current! < 0 ||
    saved.current! > TOUR_STOPS.length ||
    !Array.isArray(saved.visited) ||
    !saved.visited.every(isStop) ||
    saved.visited.length !== saved.current ||
    saved.visited.some((stop, index) => stop !== TOUR_STOPS[index]) ||
    (saved.active && saved.current === TOUR_STOPS.length)
  )
    return newTour();
  return {
    dismissed,
    active: saved.active,
    current: saved.current,
    visited: [...saved.visited],
  };
}

export function startTour(tour: TourState): TourStop {
  if (tour.current === TOUR_STOPS.length) {
    tour.current = 0;
    tour.visited = [];
  }
  tour.dismissed = false;
  tour.active = true;
  return TOUR_STOPS[tour.current];
}

export function completeTourStop(
  tour: TourState,
  page: string,
): TourStop | null {
  if (!tour.active) return tour.current < TOUR_STOPS.length ? TOUR_STOPS[tour.current] : null;
  const stop = TOUR_STOPS[tour.current];
  if (page !== stop) return stop;
  tour.visited.push(stop);
  tour.current++;
  if (tour.current === TOUR_STOPS.length) {
    tour.active = false;
    return null;
  }
  return TOUR_STOPS[tour.current];
}

export function cancelTour(tour: TourState) {
  tour.active = false;
  tour.dismissed = true;
}

export function resumeTour(tour: TourState): TourStop | null {
  if (tour.current === TOUR_STOPS.length) return null;
  tour.dismissed = false;
  tour.active = true;
  return TOUR_STOPS[tour.current];
}
