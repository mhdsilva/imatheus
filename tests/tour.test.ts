import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cancelTour,
  completeTourStop,
  newTour,
  restoreTour,
  resumeTour,
  startTour,
} from "../src/tour";

test("tour advances only after its current page opens", () => {
  const tour = newTour();
  assert.equal(startTour(tour), "about");
  assert.equal(tour.active, true);
  assert.equal(completeTourStop(tour, "contact"), "about");
  assert.deepEqual(tour.visited, []);
  assert.equal(completeTourStop(tour, "about"), "projects");
  assert.equal(completeTourStop(tour, "projects"), "career");
  assert.equal(completeTourStop(tour, "career"), null);
  assert.deepEqual(tour.visited, ["about", "projects", "career"]);
  assert.equal(tour.active, false);
});

test("tour cancellation is saved and resume preserves progress", () => {
  const tour = newTour();
  startTour(tour);
  completeTourStop(tour, "about");
  cancelTour(tour);
  assert.equal(tour.dismissed, true);
  assert.equal(tour.active, false);
  assert.equal(resumeTour(tour), "projects");
  assert.equal(tour.active, true);
  assert.deepEqual(tour.visited, ["about"]);
});

test("invalid tour state becomes a new tour", () => {
  assert.deepEqual(restoreTour(null), newTour());
  assert.deepEqual(
    restoreTour({
      dismissed: "yes",
      active: true,
      current: 9,
      visited: ["about"],
    }),
    newTour(),
  );
});
